import { ReactiveController } from 'lit';
import { StreamActionProcessor } from '../../action/stream-action-processor';
import { CourseState, CourseStateDocuments, MessengerState, QuizState } from '../../model/course-state';
import { CourseStateDocument } from '../../model/course-state-document';
import { SlideDocument } from '../../model/document';
import { CourseStateService } from '../../service/course.service';
import { EventService } from '../../service/event.service';
import { JanusService } from '../../service/janus.service';
import { SpeechService } from '../../service/speech.service';
import { Devices } from '../../utils/devices';
import { State } from '../../utils/state';
import { Utils } from '../../utils/utils';
import { ChatModal } from '../chat-modal/chat.modal';
import { EntryModal } from '../entry-modal/entry.modal';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { PlayerViewController } from '../player-view/player-view.controller';
import { QuizModal } from '../quiz-modal/quiz.modal';
import { RecordedModal } from '../recorded-modal/recorded.modal';
import { SettingsModal } from '../settings-modal/settings.modal';
import { SpeechAcceptedModal } from '../speech-accepted-modal/speech-accepted.modal';
import { ToastGravity, ToastPosition } from '../toast/toast';
import { Toaster } from '../toast/toaster';
import { LecturePlayer } from './player';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;

	private readonly eventService: EventService;

	private readonly speechService: SpeechService;

	private readonly janusService: JanusService;

	private readonly courseStateService: CourseStateService;

	private readonly actionProcessor: StreamActionProcessor;

	private readonly maxWidth576Query: MediaQueryList;

	private viewController: PlayerViewController;

	private speechRequestId: bigint;

	private devicesSelected: boolean;

	private modals: Map<string, Modal>;


	constructor(host: LecturePlayer) {
		this.host = host;
		this.host.addController(this);

		this.eventService = new EventService();
		this.speechService = new SpeechService();
		this.courseStateService = new CourseStateService("https://" + window.location.host);
		this.janusService = new JanusService("https://" + window.location.hostname + ":8089/janus");
		this.actionProcessor = new StreamActionProcessor();
		this.modals = new Map();

		this.registerModal(RecordedModal.name, new RecordedModal(), false, false);

		this.maxWidth576Query = window.matchMedia("(max-width: 576px)");
	}

	hostConnected() {
		this.host.addEventListener("fullscreen", this.onFullscreen.bind(this));
		this.host.addEventListener("player-settings", this.onSettings.bind(this), false);
		this.host.addEventListener("player-hand-action", this.onHandAction.bind(this), false);
		this.host.addEventListener("player-quiz-action", this.onQuizAction.bind(this), false);
		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
		this.host.addEventListener("participant-video-play-error", this.onMediaPlayError.bind(this), false);

		this.eventService.addEventListener("messenger-state", this.onMessengerState.bind(this));
		this.eventService.addEventListener("quiz-state", this.onQuizState.bind(this));
		this.eventService.addEventListener("recording-state", this.onRecordingState.bind(this));
		this.eventService.addEventListener("stream-state", this.onStreamState.bind(this));
		this.eventService.addEventListener("speech-state", this.onSpeechState.bind(this));

		this.janusService.setRoomId(this.host.courseId);
		this.janusService.setOnData(this.actionProcessor.processData.bind(this.actionProcessor));

		this.initToaster();
	}

	setPlayerViewController(viewController: PlayerViewController) {
		this.viewController = viewController;

		const playbackService = viewController.getPlaybackService();

		this.actionProcessor.onAddAction = playbackService.addAction.bind(playbackService);
		this.actionProcessor.onAddDocument = playbackService.addDocument.bind(playbackService);
		this.actionProcessor.onSelectDocument = playbackService.selectDocument.bind(playbackService);
		this.actionProcessor.onRemoveDocument = playbackService.removeDocument.bind(playbackService);
		this.actionProcessor.onGetDocument = this.getDocument.bind(this);
		this.actionProcessor.onPeerConnected = this.onPeerConnected.bind(this);

		this.connect();
	}

	private initToaster() {
		Toaster.init({
			duration: 5000,
			gravity: ToastGravity.Top,
			position: ToastPosition.Center,
			closeable: false,
			stopOnFocus: true,
			selector: this.host.renderRoot
		});
	}

	private connect() {
		this.getCourseState()
			.then(state => {
				this.viewController.setCourseDocumentState(state);

				this.janusService.connect();

				this.setConnectionState(State.CONNECTED);

				if (state.courseState.recorded) {
					this.openModal(RecordedModal.name);
				}
			})
			.catch(error => {
				console.error(error);

				this.setConnectionState(State.DISCONNECTED);
			});
	}

	private getDocument(stateDoc: CourseStateDocument): Promise<SlideDocument> {
		return this.courseStateService.getStateDocument(this.host.courseId, stateDoc);
	}

	private getCourseState(): Promise<CourseStateDocuments> {
		return new Promise<CourseStateDocuments>((resolve, reject) => {
			this.courseStateService.getCourseState(this.host.courseId)
				.then((courseState: CourseState) => {
					console.log("Course state", courseState);

					// Load all initially opened documents.
					const promises = [];

					for (const value of Object.values(courseState.documentMap)) {
						const promise = this.getDocument(value);

						promises.push(promise);
					}

					Promise.all(promises)
						.then(documents => {
							resolve({
								courseState: courseState,
								documents: documents
							});
						})
						.catch(error => {
							reject(error);
						});
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	private setConnectionState(state: State) {
		this.host.state = state;

		if (state === State.DISCONNECTED) {
			this.viewController.setDisconnected();
		}
	}

	private onPeerConnected(peerId: bigint) {
		this.janusService.addPeer(peerId);
	}

	private onFullscreen(event: CustomEvent) {
		if (event.detail.fullscreen === true) {
			if (this.host.requestFullscreen) {
				this.host.requestFullscreen();
			}
		}
		else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	private onSettings() {
		const settingsModal = new SettingsModal();

		this.registerModal(SettingsModal.name, settingsModal);
	}

	private onHandAction(event: CustomEvent) {
		const handUp = event.detail.handUp;

		if (handUp) {
			this.initSpeech();
		}
		else {
			this.janusService.stopSpeech();

			this.cancelSpeech();
		}
	}

	private onQuizAction() {
		const quizModal = new QuizModal();
		quizModal.courseId = this.host.courseId;
		quizModal.feature = this.viewController.getCourseState().quizFeature;

		this.registerModal(QuizModal.name, quizModal);
	}

	private onChatVisibility() {
		if (this.maxWidth576Query.matches) {
			const chatModal = new ChatModal();
			chatModal.courseId = this.host.courseId;
			chatModal.feature = this.viewController.getCourseState().messageFeature;

			this.registerModal(ChatModal.name, chatModal);
		}
	}

	private onMessengerState(event: CustomEvent) {
		const state: MessengerState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		if (!state.started) {
			this.closeAndDeleteModal(ChatModal.name);
		}

		this.host.dispatchEvent(Utils.createEvent("messenger-state", state));
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		if (!state.started) {
			this.closeAndDeleteModal(QuizModal.name);
		}

		this.host.dispatchEvent(Utils.createEvent("quiz-state", state));
	}

	private onRecordingState(event: CustomEvent) {
		const courseId = event.detail.courseId;
		const started = event.detail.started;

		if (this.host.courseId !== courseId) {
			return;
		}

		if (started) {
			this.openModal(RecordedModal.name);
		}
		else {
			this.closeModal(RecordedModal.name);
		}
	}

	private onStreamState(event: CustomEvent) {
		const courseId = event.detail.courseId;
		const started = event.detail.started;

		if (this.host.courseId !== courseId) {
			return;
		}

		const mediaProfile = localStorage.getItem("media.profile");

		if (mediaProfile === "classroom") {
			// this.showFeatures(true);
			return;
		}

		if (started) {
			this.connect();
		}
		else {
			this.closeAllModals();
			this.setConnectionState(State.DISCONNECTED);
		}
	}

	private onSpeechState(event: CustomEvent) {
		const accepted = event.detail.accepted;
		const requestId = event.detail.requestId;

		if (BigInt(requestId) - this.speechRequestId < 1000) {
			if (accepted) {
				this.speechAccepted();
			}
			else {
				this.speechCanceled();

				Toaster.showInfo(`${t("course.speech.request.rejected")}`);
			}
		}
	}

	private initSpeech() {
		Toaster.showInfo("Hello World...");

		// if (this.devicesSelected) {
		// 	this.sendSpeechRequest();
		// }
		// else {
		// 	this.showSpeechSettingsModal();
		// }
	}

	private speechAccepted() {
		const speechConstraints = {
			audioDeviceId: Devices.getMicrophoneId(),
			videoDeviceId: Devices.getCameraId()
		};

		const constraints = {
			video: {
				deviceId: speechConstraints.videoDeviceId ? { exact: speechConstraints.videoDeviceId } : undefined
			}
		};

		navigator.mediaDevices.getUserMedia(constraints)
			.then(stream => {
				this.showSpeechAcceptedModal(stream, speechConstraints, false);
			})
			.catch(error => {
				console.error(error.name);

				speechConstraints.videoDeviceId = undefined;

				this.showSpeechAcceptedModal(null, speechConstraints, true);
			});
	}

	private sendSpeechRequest() {
		this.speechService.requestSpeech(this.host.courseId)
			.then(requestId => {
				this.speechRequestId = requestId;
			})
			.catch(error => console.error(error));
	}

	private cancelSpeech() {
		if (!this.speechRequestId) {
			this.speechCanceled();
			return;
		}

		this.speechService.cancelSpeech(this.host.courseId, this.speechRequestId)
			.then(() => {
				this.speechCanceled();
			})
			.catch(error => console.error(error));
	}

	private speechCanceled() {
		this.speechRequestId = null;

		this.host.dispatchEvent(Utils.createEvent("speech-canceled"));
	}

	private showSpeechAcceptedModal(stream: MediaStream, speechConstraints: any, camBlocked: boolean) {
		if (this.speechRequestId) {
			const speechModal = new SpeechAcceptedModal();
			speechModal.videoInputBlocked = camBlocked;
			speechModal.addEventListener("speech-accepted-canceled", () => {
				this.cancelSpeech();
			});
			speechModal.addEventListener("speech-accepted-start", () => {
				this.janusService.startSpeech(speechConstraints);
			});
			speechModal.addEventListener("modal-closing", () => {
				Devices.stopMediaTracks(stream);
			});

			this.registerModal(SpeechAcceptedModal.name, speechModal);
		}
		else {
			// Speech has been aborted by the remote peer.
			Devices.stopMediaTracks(stream);
		}
	}

	private showSpeechSettingsModal() {
		const settingsModal = new SettingsModal();
		settingsModal.addEventListener("device-settings-canceled", () => {
			this.cancelSpeech();
		});
		settingsModal.addEventListener("device-settings-saved", () => {
			this.devicesSelected = true;
			this.sendSpeechRequest();
		});

		this.registerModal(SettingsModal.name, settingsModal);
	}

	private onMediaPlayError() {
		const entryModal = new EntryModal();
		entryModal.addEventListener("modal-closed", () => {
			this.host.dispatchEvent(Utils.createEvent("player-start-media"));
		});

		this.registerModal(EntryModal.name, entryModal);
	}

	private registerModal(name: string, modal: Modal, autoRemove: boolean = true, open: boolean = true) {
		if (autoRemove) {
			modal.addEventListener("modal-closed", () => {
				this.closeAndDeleteModal(name);
			});
		}

		modal.container = this.host.renderRoot;

		this.modals.set(name, modal);

		if (open) {
			modal.open();
		}
	}

	private openModal(name: string) {
		const modal = this.modals.get(name);

		if (modal) {
			modal.open();
		}
	}

	private closeModal(name: string) {
		const modal = this.modals.get(name);

		if (modal) {
			modal.close();
		}
	}

	private closeAndDeleteModal(name: string) {
		const modal = this.modals.get(name);

		if (modal) {
			modal.close();

			this.modals.delete(name);
		}
	}

	private closeAllModals() {
		this.modals.forEach((modal: Modal) => {
			modal.close();
		});
		this.modals.clear();
	}
}