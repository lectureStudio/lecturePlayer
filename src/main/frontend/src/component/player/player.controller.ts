import { ReactiveController } from 'lit';
import { StreamActionProcessor } from '../../action/stream-action-processor';
import { CourseState, CourseStateDocuments, QuizState } from '../../model/course-state';
import { CourseStateDocument } from '../../model/course-state-document';
import { SlideDocument } from '../../model/document';
import { CourseStateService } from '../../service/course.service';
import { EventService } from '../../service/event.service';
import { JanusService } from '../../service/janus.service';
import { SpeechService } from '../../service/speech.service';
import { Devices } from '../../utils/devices';
import { State } from '../../utils/state';
import { Utils } from '../../utils/utils';
import { t } from '../i18n-mixin';
import { PlayerViewController } from '../player-view/player-view.controller';
import { QuizModal } from '../quiz-modal/quiz.modal';
import { RecordedModal } from '../recorded-modal/recorded.modal';
import { SettingsModal } from '../settings-modal/settings.modal';
import { SpeechAcceptedModal } from '../speech-accepted-modal/speech-accepted.modal';
import { Toaster } from '../toast/toaster';
import { LecturePlayer } from './player';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;

	private readonly eventService: EventService;

	private readonly speechService: SpeechService;

	private readonly janusService: JanusService;

	private readonly courseStateService: CourseStateService;

	private readonly actionProcessor: StreamActionProcessor;

	private viewController: PlayerViewController;

	private recordedModal: RecordedModal;

	private quizModal: QuizModal;

	private speechRequestId: bigint;

	private devicesSelected: boolean;


	constructor(host: LecturePlayer) {
		this.host = host;
		this.host.addController(this);

		this.eventService = new EventService();
		this.speechService = new SpeechService();
		this.courseStateService = new CourseStateService("https://" + window.location.host);
		this.janusService = new JanusService("https://" + window.location.hostname + ":8089/janus");
		this.actionProcessor = new StreamActionProcessor();
		this.recordedModal = new RecordedModal();
	}

	hostConnected() {
		this.host.addEventListener("fullscreen", this.onFullscreen.bind(this));
		this.host.addEventListener("player-settings", this.onSettings.bind(this), false);
		this.host.addEventListener("player-hand-action", this.onHandAction.bind(this), false);
		this.host.addEventListener("player-quiz-action", this.onQuizAction.bind(this), false);

		this.eventService.addEventListener("messenger-state", this.onMessengerState.bind(this));
		this.eventService.addEventListener("quiz-state", this.onQuizState.bind(this));
		this.eventService.addEventListener("recording-state", this.onRecordingState.bind(this));
		this.eventService.addEventListener("stream-state", this.onStreamState.bind(this));
		this.eventService.addEventListener("speech-state", this.onSpeechState.bind(this));

		this.janusService.setRoomId(this.host.courseId);
		this.janusService.setOnData(this.actionProcessor.processData.bind(this.actionProcessor));
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

	private connect() {
		this.getCourseState()
			.then(state => {
				this.viewController.setCourseDocumentState(state);

				this.janusService.connect();

				this.setConnectionState(State.CONNECTED);

				if (state.courseState.recorded) {
					this.recordedModal.open();
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
		settingsModal.open();
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
		this.quizModal = new QuizModal();
		this.quizModal.courseId = this.host.courseId;
		this.quizModal.feature = this.viewController.getCourseState().quizFeature;
		this.quizModal.open();
	}

	private onMessengerState(event: CustomEvent) {
		const courseId = event.detail.courseId;
		const started = event.detail.started;

		if (this.host.courseId !== courseId) {
			return;
		}

		if (started) {

		}
		else {

		}

		this.host.dispatchEvent(Utils.createEvent("messenger-state", event.detail));
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		if (state.started) {

		}
		else {

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
			this.recordedModal.open();
		}
		else {
			this.recordedModal.close();
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
			this.recordedModal.close();

			if (this.quizModal) {
				this.quizModal.close();
			}

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
		if (this.devicesSelected) {
			this.sendSpeechRequest();
		}
		else {
			this.showSpeechSettingsModal();
		}
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
			speechModal.open();
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
		settingsModal.open();
	}
}