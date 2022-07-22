import { ReactiveController } from 'lit';
import { StreamActionProcessor } from '../../action/stream-action-processor';
import { CourseState, MessengerState, QuizState } from '../../model/course-state';
import { CourseStateDocument } from '../../model/course-state-document';
import { SlideDocument } from '../../model/document';
import { CourseStateService } from '../../service/course.service';
import { EventService } from '../../service/event.service';
import { JanusService } from '../../service/janus.service';
import { MessageService } from '../../service/message.service';
import { PlaybackService } from '../../service/playback.service';
import { SpeechService } from '../../service/speech.service';
import { Devices } from '../../utils/devices';
import { MediaProfile, Settings } from '../../utils/settings';
import { State } from '../../utils/state';
import { Utils } from '../../utils/utils';
import { ChatModal } from '../chat-modal/chat.modal';
import { EntryModal } from '../entry-modal/entry.modal';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { PlayerViewController } from '../player-view/player-view.controller';
import { QuizModal } from '../quiz-modal/quiz.modal';
import { ReconnectModal } from '../reconnect-modal/reconnect.modal';
import { RecordedModal } from '../recorded-modal/recorded.modal';
import { SettingsModal } from '../settings-modal/settings.modal';
import { SpeechAcceptedModal } from '../speech-accepted-modal/speech-accepted.modal';
import { ToastGravity, ToastPosition } from '../toast/toast';
import { Toaster } from '../toast/toaster';
import { LecturePlayer } from './player';

export class PlayerController implements ReactiveController {

	private readonly reconnectState = {
		attempt: 0,
		attemptsMax: 5,
		timeout: 2000
	};

	private readonly host: LecturePlayer;

	private readonly maxWidth576Query: MediaQueryList;

	private readonly speechService: SpeechService;

	private readonly courseStateService: CourseStateService;

	private readonly janusService: JanusService;

	private readonly playbackService: PlaybackService;

	private messageService: MessageService;

	private eventService: EventService;

	private viewController: PlayerViewController;

	private speechRequestId: bigint;

	private devicesSelected: boolean;

	private modals: Map<string, Modal>;


	constructor(host: LecturePlayer) {
		this.host = host;
		this.host.addController(this);

		this.speechService = new SpeechService();
		this.playbackService = new PlaybackService();

		const actionProcessor = new StreamActionProcessor(this.playbackService);
		actionProcessor.onGetDocument = this.getDocument.bind(this);
		actionProcessor.onPeerConnected = this.onPeerConnected.bind(this);

		this.courseStateService = new CourseStateService("https://" + window.location.host);
		this.janusService = new JanusService("wss://" + window.location.hostname + ":8989/janus", actionProcessor);
		this.modals = new Map();

		this.maxWidth576Query = window.matchMedia("(max-width: 576px)");
	}

	hostConnected() {
		this.messageService = new MessageService(this.host.courseId);
		this.eventService = new EventService(this.host.courseId);

		this.host.messageService = this.messageService;

		this.host.addEventListener("player-fullscreen", this.onFullscreen.bind(this));
		this.host.addEventListener("player-settings", this.onSettings.bind(this), false);
		this.host.addEventListener("player-hand-action", this.onHandAction.bind(this), false);
		this.host.addEventListener("player-quiz-action", this.onQuizAction.bind(this), false);
		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
		this.host.addEventListener("participant-video-play-error", this.onMediaPlayError.bind(this), false);

		this.eventService.addEventListener("event-service-state", this.onEventServiceState.bind(this));
		this.eventService.addEventListener("messenger-state", this.onMessengerState.bind(this));
		this.eventService.addEventListener("quiz-state", this.onQuizState.bind(this));
		this.eventService.addEventListener("recording-state", this.onRecordingState.bind(this));
		this.eventService.addEventListener("stream-state", this.onStreamState.bind(this));
		this.eventService.addEventListener("speech-state", this.onSpeechState.bind(this));

		this.janusService.addEventListener("janus-connection-established", this.onJanusConnectionEstablished.bind(this));
		this.janusService.addEventListener("janus-connection-failure", this.onJanusConnectionFailure.bind(this));

		this.initToaster();
	}

	setPlayerViewController(viewController: PlayerViewController) {
		this.viewController = viewController;

		this.connect();
	}

	private setConnectionState(state: State) {
		this.host.state = state;

		if (this.host.state !== State.RECONNECTING) {
			this.closeAndDeleteModal(ReconnectModal.name);
		}

		switch (state) {
			case State.CONNECTED_FEATURES:
			case State.DISCONNECTED:
				this.setDisconnected();
				break;

			case State.RECONNECTING:
				this.setReconnecting();
				break;
		}
	}

	private setCourseState(state: CourseState) {
		this.messageService.feature = state.messageFeature;

		this.host.courseState = state;
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
			.then(courseState => {
				console.log("Course state", courseState);

				this.messageService.userId = courseState.userId;

				this.setCourseState(courseState);

				if (courseState.activeDocument == null) {
					// Update early, if not streaming.
					this.updateCourseState();
				}
				if (this.isClassroomProfile()) {
					this.updateCourseState();
					return;
				}

				this.getDocuments(courseState.documentMap)
					.then(documents => {
						if (courseState.activeDocument) {
							this.registerModal(RecordedModal.name, new RecordedModal(), false, false);

							this.playbackService.initialize(this.viewController.host, this.host.courseState, documents);

							this.viewController.setCourseState(courseState);

							this.janusService.setRoomId(this.host.courseId);
							this.janusService.connect();

							if (courseState.recorded) {
								this.openModal(RecordedModal.name);
							}

							this.updateCourseState();
						}
					});
			})
			.catch(error => {
				console.error(error);

				if (this.host.state === State.RECONNECTING) {
					this.reconnect();
				}
				else {
					this.setConnectionState(State.DISCONNECTED);
				}
			});
	}

	private reconnect() {
		if (this.host.state !== State.RECONNECTING) {
			return;
		}

		console.log("Reconnecting...");

		this.reconnectState.attempt++;

		if (this.reconnectState.attempt >= this.reconnectState.attemptsMax) {
			this.reconnectState.attempt = 0;
			this.setConnectionState(State.DISCONNECTED);
		}
		else {
			this.janusService.disconnect();
			window.setTimeout(this.connect.bind(this), this.reconnectState.timeout);
		}
	}

	private setDisconnected() {
		this.setFullscreen(false);
		this.playbackService.dispose();
		this.viewController.setDisconnected();
	}

	private setReconnecting() {
		const reconnectModal = new ReconnectModal();
		reconnectModal.addEventListener("reconnect-modal-abort", () => {
			this.setConnectionState(State.DISCONNECTED);
		});

		this.registerModal(ReconnectModal.name, reconnectModal);
	}

	private getDocument(stateDoc: CourseStateDocument): Promise<SlideDocument> {
		return this.courseStateService.getStateDocument(this.host.courseId, stateDoc);
	}

	private getDocuments(documentMap: Map<bigint, CourseStateDocument>): Promise<SlideDocument[]> {
		return new Promise<SlideDocument[]>((resolve, reject) => {
			// Load all initially opened documents.
			const promises = [];

			for (const value of Object.values(documentMap || {})) {
				const promise = this.getDocument(value);

				promises.push(promise);
			}

			Promise.all(promises)
				.then(documents => {
					resolve(documents);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	private getCourseState(): Promise<CourseState> {
		return this.courseStateService.getCourseState(this.host.courseId);
	}

	private onPeerConnected(peerId: bigint) {
		this.janusService.addPeer(peerId);
	}

	private setFullscreen(enable: boolean) {
		const isFullscreen = document.fullscreenElement !== null;

		if (enable) {
			if (this.host.requestFullscreen && !isFullscreen) {
				this.host.requestFullscreen();
			}
		}
		else {
			if (document.exitFullscreen && isFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	private onFullscreen(event: CustomEvent) {
		this.setFullscreen(event.detail.fullscreen === true);
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
		quizModal.feature = this.host.courseState.quizFeature;

		this.registerModal(QuizModal.name, quizModal);
	}

	private onChatVisibility() {
		if (this.maxWidth576Query.matches) {
			const chatModal = new ChatModal();
			chatModal.courseId = this.host.courseId;
			chatModal.messageService = this.messageService;

			this.registerModal(ChatModal.name, chatModal);
		}
	}

	private onEventServiceState(event: CustomEvent) {
		const connected = event.detail.connected;

		if (connected) {
			if (this.host.state === State.RECONNECTING) {
				this.reconnect();
			}
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

		this.setCourseState({
			...this.host.courseState,
			...{
				messageFeature: state.started ? state.feature : null
			}
		});
		this.host.dispatchEvent(Utils.createEvent("messenger-state", state));

		this.updateCourseState();
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		if (!state.started) {
			this.closeAndDeleteModal(QuizModal.name);
		}

		this.setCourseState({
			...this.host.courseState,
			...{
				quizFeature: state.started ? state.feature : null
			}
		});
		this.host.dispatchEvent(Utils.createEvent("quiz-state", state));

		this.updateCourseState();
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
		if (this.isClassroomProfile()) {
			return;
		}

		if (started) {
			this.connect();
		}
		else {
			this.closeAllModals();

			this.host.courseState.activeDocument = null;
			this.updateCourseState();
		}
	}

	private onSpeechState(event: CustomEvent) {
		const accepted = event.detail.accepted;
		const requestId = event.detail.requestId;

		if (this.speechRequestId && (BigInt(requestId) - this.speechRequestId) < 1000) {
			if (accepted) {
				this.speechAccepted();
			}
			else {
				this.speechCanceled();

				Toaster.showInfo(`${t("course.speech.request.rejected")}`);
			}
		}
	}

	private updateCourseState() {
		if (!this.host.courseState) {
			return;
		}

		const isClassroom = this.isClassroomProfile();
		const hasFeatures = this.host.courseState.messageFeature != null || this.host.courseState.quizFeature != null;
		const hasStream = this.host.courseState.activeDocument != null;

		if (hasStream && !isClassroom) {
			this.setConnectionState(State.CONNECTED);
		}
		else if (hasFeatures) {
			this.setConnectionState(State.CONNECTED_FEATURES);
		}
		else {
			this.setConnectionState(State.DISCONNECTED);
		}
	}

	private onJanusConnectionEstablished() {
		if (this.host.state === State.RECONNECTING) {
			this.setConnectionState(State.CONNECTED);
		}
	}

	private onJanusConnectionFailure() {
		this.setConnectionState(State.RECONNECTING);
	}

	private isClassroomProfile() {
		return Settings.getMediaProfile() === MediaProfile.Classroom;
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
			audioDeviceId: Settings.getMicrophoneId(),
			videoDeviceId: Settings.getCameraId()
		};

		const constraints = {
			audio: {
				deviceId: speechConstraints.audioDeviceId ? { exact: speechConstraints.audioDeviceId } : undefined
			},
			video: {
				deviceId: speechConstraints.videoDeviceId ? { exact: speechConstraints.videoDeviceId } : undefined,
				width: 1280,
				height: 720,
				facingMode: "user"
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
			speechModal.stream = stream;
			speechModal.videoInputBlocked = camBlocked;
			speechModal.addEventListener("speech-accepted-canceled", () => {
				this.cancelSpeech();
			});
			speechModal.addEventListener("speech-accepted-start", () => {
				this.janusService.startSpeech(speechConstraints);
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