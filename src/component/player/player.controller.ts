import { ReactiveController } from 'lit';
import { StreamActionProcessor } from '../../action/stream-action-processor';
import { CourseState, MessengerState, QuizState } from '../../model/course-state';
import { CourseParticipant, CourseParticipantPresence } from '../../model/participant';
import { CourseStateDocument } from '../../model/course-state-document';
import { SlideDocument } from '../../model/document';
import { CourseStateService } from '../../service/course.service';
import { EventService } from '../../service/event.service';
import { JanusService } from '../../service/janus.service';
import { MessageService, MessageServiceHistory } from '../../service/message.service';
import { PlaybackService } from '../../service/playback.service';
import { SpeechService } from '../../service/speech.service';
import { Devices } from '../../utils/devices';
import { HttpRequest } from '../../utils/http-request';
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
import { LecturePlayer } from './player';
import { ParticipantsModal } from '../participants-modal/participants.modal';
import { VpnModal } from '../vpn-modal/vpn.modal';
import { featureStore } from '../../store/feature.store';
import { chatStore } from '../../store/chat.store';
import { privilegeStore } from '../../store/privilege.store';
import { participantStore } from '../../store/participants.store';
import { courseStore } from '../../store/course.store';
import { userStore } from '../../store/user.store';
import { documentStore } from '../../store/document.store';
import { Toaster } from '../../utils/toaster';
import { uiStateStore } from '../../store/ui-state.store';
import { ToolController } from '../../tool/tool-controller';
import { MouseListener } from '../../event/mouse-listener';
import { RenderController } from '../../render/render-controller';
import { SlideView } from '../slide-view/slide-view';
import { deviceStore } from '../../store/device.store';
import { MediaStateEvent, RecordingStateEvent, SpeechStateEvent, StreamStateEvent } from '../../model/event/queue-events';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;

	private readonly maxWidth576Query: MediaQueryList;

	private readonly speechService: SpeechService;

	private readonly courseStateService: CourseStateService;

	private readonly janusService: JanusService;

	private readonly playbackService: PlaybackService;

	private readonly messageService: MessageService;

	private documentState: State;

	private janusServiceState: State;

	private eventServiceState: State;

	private eventService: EventService;

	private renderController: RenderController;

	private viewController: PlayerViewController;

	private speechRequestId: string;

	private devicesSelected: boolean;

	private modals: Map<string, Modal>;


	constructor(host: LecturePlayer) {
		this.host = host;
		this.host.addController(this);

		this.renderController = new RenderController();

		this.messageService = new MessageService();
		this.speechService = new SpeechService();
		this.playbackService = new PlaybackService();

		this.playbackService.initialize(this.renderController);

		const actionProcessor = new StreamActionProcessor(this.playbackService);
		actionProcessor.onGetDocument = this.getDocument.bind(this);
		actionProcessor.onPeerConnected = this.onPeerConnected.bind(this);

		this.courseStateService = new CourseStateService("https://" + window.location.host);
		this.janusService = new JanusService("https://" + window.location.hostname + ":8089/janus", actionProcessor);
		this.modals = new Map();

		this.maxWidth576Query = window.matchMedia("(max-width: 575px) , (orientation: portrait)");
	}

	hostConnected() {
		this.eventService = new EventService(this.host.courseId);
		this.eventService.addEventSubService(this.messageService);
		this.eventService.connect();

		this.host.messageService = this.messageService;

		this.host.addEventListener("player-fullscreen", this.onFullscreen.bind(this));
		this.host.addEventListener("player-settings", this.onSettings.bind(this), false);
		this.host.addEventListener("player-hand-action", this.onHandAction.bind(this), false);
		this.host.addEventListener("player-quiz-action", this.onQuizAction.bind(this), false);
		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
		this.host.addEventListener("player-participants-visibility", this.onParticipantsVisibility.bind(this), false);
		this.host.addEventListener("participant-video-play-error", this.onMediaPlayError.bind(this), false);

		this.eventService.addEventListener("event-service-state", this.onEventServiceState.bind(this));
		this.eventService.addEventListener("chat-state", this.onChatState.bind(this));
		this.eventService.addEventListener("quiz-state", this.onQuizState.bind(this));
		this.eventService.addEventListener("recording-state", this.onRecordingState.bind(this));
		this.eventService.addEventListener("stream-state", this.onStreamState.bind(this));
		this.eventService.addEventListener("speech-state", this.onSpeechState.bind(this));
		this.eventService.addEventListener("media-state", this.onMediaState.bind(this));
		this.eventService.addEventListener("participant-presence", this.onParticipantPresence.bind(this));

		this.janusService.addEventListener("janus-connection-established", this.onJanusConnectionEstablished.bind(this));
		this.janusService.addEventListener("janus-connection-failure", this.onJanusConnectionFailure.bind(this));
		this.janusService.addEventListener("janus-session-error", this.onJanusSessionError.bind(this));

		const isLive = this.host.getAttribute("islive") == "true";

		// Early state recognition to avoid view flickering.
		if (isLive) {
			if (Settings.getMediaProfile() === MediaProfile.Classroom) {
				uiStateStore.setState(State.CONNECTED_FEATURES);
			}
		}
		else {
			uiStateStore.setState(State.DISCONNECTED);
		}

		this.connect();
	}

	setPlayerViewController(viewController: PlayerViewController) {
		this.viewController = viewController;
		this.viewController.update();
	}

	setSlideView(slideView: SlideView) {
		this.renderController.setSlideView(slideView);

		const toolController = new ToolController(this.renderController);
		const mouseListener = new MouseListener(toolController);

		slideView.addMouseListener(mouseListener);
	}

	private setConnectionState(state: State) {
		if (uiStateStore.state === state) {
			return;
		}

		console.log("set connection state:", state, "event:", this.eventServiceState, "janus:", this.janusServiceState);

		uiStateStore.setState(state);

		if (uiStateStore.state !== State.RECONNECTING) {
			this.closeAndDeleteModal("ReconnectModal");
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
		courseStore.courseId = state.courseId;
		courseStore.timeStarted = state.timeStarted;
		courseStore.title = state.title;
		courseStore.description = state.description;
		courseStore.conference = state.conference;
		courseStore.recorded = state.recorded;

		privilegeStore.setPrivileges(state.userPrivileges);

		featureStore.chatFeature = state.messageFeature;
		featureStore.quizFeature = state.quizFeature;

		documentStore.activeDocument = state.activeDocument;
		documentStore.documentMap = state.documentMap;
	}

	private connect() {
		participantStore.reset();
		chatStore.reset();

		this.courseStateService.getCourseState(this.host.courseId)
			.then(this.onCourseState.bind(this))
			.then(this.onCourseParticipant.bind(this))
			.then(this.onCourseParticipants.bind(this))
			.then(this.onMediaDevicesHandled.bind(this))
			.then(this.onConnected.bind(this))
			.catch(this.onConnectionError.bind(this));
	}

	private onCourseState(courseState: CourseState) {
		console.log("~ course state", courseState);

		this.setCourseState(courseState);

		return this.getCourseParticipant();
	}

	private onCourseParticipant(courseUser: CourseParticipant) {
		userStore.setUserId(courseUser.userId);
		userStore.setName(courseUser.firstName, courseUser.familyName);
		userStore.setParticipantType(courseUser.participantType);

		return this.getParticipants();
	}

	private onCourseParticipants(participants: CourseParticipant[]) {
		participantStore.setParticipants(participants);

		return new Promise<void>((resolve) => {
			if (courseStore.conference) {
				navigator.mediaDevices.getUserMedia({
					audio: true
				})
					.then((stream: MediaStream) => {
						// Stream is not needed.
						Devices.stopMediaTracks(stream);

						deviceStore.microphoneBlocked = false;
					})
					.catch(error => {
						deviceStore.microphoneBlocked = true;
					})
					.finally(() => {
						// Allways resolve, since we are only probing the permissions.
						resolve();
					});
			}
			else {
				resolve();
			}
		});
	}

	private onMediaDevicesHandled() {
		this.janusService.setRoomId(courseStore.courseId);
		this.janusService.setUserId(userStore.userId);

		return this.janusService.connect();
	}

	private onConnected() {
		if (!this.hasStream()) {
			// Update early, if not streaming.
			this.updateConnectionState();
		}
		if (this.isClassroomProfile()) {
			this.updateConnectionState();
			return;
		}

		if (documentStore.activeDocument) {
			this.documentState = State.DISCONNECTED;

			this.getDocuments(documentStore.documentMap)
				.then(documents => {
					this.playbackService.addDocuments(documents);
					this.playbackService.setActiveDocument(documentStore.activeDocument.documentId, documentStore.activeDocument.activePage.pageNumber);

					this.registerModal("RecordedModal", new RecordedModal(), false, false);

					if (courseStore.recorded) {
						this.openModal("RecordedModal");
					}

					this.documentState = State.CONNECTED;

					this.updateConnectionState();
				});
		}
	}

	private onConnectionError(cause: any) {
		// If any of the previous executions fail, panic.
		console.error(cause);

		this.setConnectionState(State.DISCONNECTED);

		this.onJanusSessionError();
	}

	private setDisconnected() {
		this.setFullscreen(false);
		this.playbackService.dispose();

		if (this.viewController) {
			this.viewController.setDisconnected();
		}

		participantStore.reset();
		chatStore.reset();
	}

	private setReconnecting() {
		const reconnectModal = new ReconnectModal();
		reconnectModal.addEventListener("reconnect-modal-abort", () => {
			this.setConnectionState(State.DISCONNECTED);
		});

		this.registerModal("ReconnectModal", reconnectModal);
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
		return this.courseStateService.getCourseState(courseStore.courseId);
	}

	private getParticipants(): Promise<CourseParticipant[]> {
		return new HttpRequest().get("/course/participants/" + this.host.courseId);
	}

	private getCourseParticipant(): Promise<CourseParticipant> {
		return new HttpRequest().get<CourseParticipant>("/course/user");
	}

	private getChatHistory(): Promise<MessageServiceHistory> {
		return new HttpRequest().get("/course/chat/history/" + this.host.courseId);
	}

	private onPeerConnected(peerId: bigint, displayName: string) {
		this.janusService.addPeer(peerId, displayName);
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

		this.registerModal("SettingsModal", settingsModal);
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

		this.registerModal("QuizModal", quizModal);
	}

	private onChatVisibility() {
		if (this.maxWidth576Query.matches) {
			const chatModal = new ChatModal();
			chatModal.messageService = this.messageService;

			this.registerModal("ChatModal", chatModal);
		}
	}

	private onParticipantsVisibility() {
		if (this.maxWidth576Query.matches) {
			const participantsModal = new ParticipantsModal();

			this.registerModal("ParticipantsModal", participantsModal);
		}
	}

	private onEventServiceState(event: CustomEvent) {
		const connected = event.detail.connected;

		this.eventServiceState = connected ? State.CONNECTED : State.DISCONNECTED;

		if (connected) {
			switch (uiStateStore.state) {
				case State.CONNECTING:
				case State.CONNECTED:
				case State.CONNECTED_FEATURES:
					this.fetchState();
					break;
			}
		}

		if (this.janusServiceState === State.DISCONNECTED) {
			this.janusService.reconnect();
		}
	}

	private fetchState() {
		const promises = new Array<Promise<any>>();

		promises.push(this.getParticipants());

		if (featureStore.hasChatFeature()) {
			promises.push(this.getChatHistory());
		}

		Promise.all(promises).then(values => {
			participantStore.setParticipants(values[0]);

			if (values.length > 1) {
				chatStore.setMessages(values[1].messages);
			}
		});
	}

	private onChatState(event: CustomEvent) {
		const state: MessengerState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		featureStore.setChatFeature(state.started ? state.feature : null);

		if (state.started) {
			this.fetchState();
		}
		else {
			this.closeAndDeleteModal("ChatModal");

			chatStore.reset();
		}

		if (this.isClassroomProfile() || !this.hasStream()) {
			this.updateConnectionState();
		}
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		if (!state.started) {
			this.closeAndDeleteModal("QuizModal");
		}

		featureStore.setQuizFeature(state.started ? state.feature : null);

		if (this.isClassroomProfile() || !this.hasStream()) {
			this.updateConnectionState();
		}
	}

	private onRecordingState(event: CustomEvent) {
		const recordingEvent: RecordingStateEvent = event.detail;

		if (this.host.courseId !== recordingEvent.courseId) {
			return;
		}

		if (recordingEvent.recorded) {
			this.openModal("RecordedModal");
		}
		else {
			this.closeModal("RecordedModal");
		}
	}

	private onStreamState(event: CustomEvent) {
		const streamEvent: StreamStateEvent = event.detail;

		if (this.host.courseId !== streamEvent.courseId) {
			return;
		}
		if (this.isClassroomProfile()) {
			return;
		}

		if (streamEvent.started) {
			courseStore.timeStarted = streamEvent.timeStarted;

			if (uiStateStore.state === State.CONNECTED) {
				console.log("reconnecting ...");
				this.janusService.disconnect();
			}

			this.connect();
		}
		else {
			location.reload();

			// this.closeAllModals();

			// this.documentState = State.DISCONNECTED;
			// this.janusServiceState = State.DISCONNECTED;

			// this.updateConnectionState();

			// courseStore.reset();
			// privilegeStore.reset();
			// documentStore.reset();
			// featureStore.reset();
			// participantStore.reset();
			// userStore.reset();
			// chatStore.reset();
		}
	}

	private onSpeechState(event: CustomEvent) {
		const speechEvent: SpeechStateEvent = event.detail;

		if (this.speechRequestId && speechEvent.requestId === this.speechRequestId) {
			if (speechEvent.accepted) {
				this.speechAccepted();
			}
			else {
				this.speechCanceled();

				Toaster.showInfo(`${t("course.speech.request.rejected")}`);
			}
		}
	}

	private onMediaState(event: CustomEvent) {
		const mediaEvent: MediaStateEvent = event.detail;
		const userId = mediaEvent.userId;

		if (mediaEvent.state.Audio != null) {
			participantStore.setParticipantMicrophoneActive(userId, mediaEvent.state.Audio);
		}
		if (mediaEvent.state.Camera != null) {
			participantStore.setParticipantCameraActive(userId, mediaEvent.state.Camera);
		}
		if (mediaEvent.state.Screen != null) {
			participantStore.setParticipantScreenActive(userId, mediaEvent.state.Screen);
		}
	}

	private onParticipantPresence(event: CustomEvent) {
		const participant: CourseParticipantPresence = event.detail;

		// React only to events originated from other participants.
		if (participant.userId === userStore.userId) {
			return;
		}

		if (participant.presence === "CONNECTED") {
			participantStore.addParticipant(participant);
		}
		else if (participant.presence === "DISCONNECTED") {
			participantStore.removeParticipant(participant);
		}
	}

	private hasStream() {
		return documentStore.activeDocument != null;
	}

	private updateConnectionState() {
		const isClassroom = this.isClassroomProfile();
		const hasFeatures = featureStore.hasChatFeature() || featureStore.hasQuizFeature();

		if (this.hasStream() && !isClassroom) {
			if (this.janusServiceState === State.CONNECTED && this.documentState === State.CONNECTED) {
				this.setConnectionState(State.CONNECTED);
			}
		}
		else if (hasFeatures) {
			this.setConnectionState(State.CONNECTED_FEATURES);
		}
		else {
			this.setConnectionState(State.DISCONNECTED);
		}
	}

	private onJanusConnectionEstablished() {
		this.janusServiceState = State.CONNECTED;

		this.updateConnectionState();
	}

	private onJanusConnectionFailure() {
		this.janusServiceState = State.DISCONNECTED;

		this.setConnectionState(State.RECONNECTING);
	}

	private onJanusSessionError() {
		this.janusServiceState = State.DISCONNECTED;

		const vpnModal = new VpnModal();

		this.registerModal("VpnModal", vpnModal);
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
		const constraints = {
			audio: {
				deviceId: deviceStore.microphoneDeviceId ? { exact: deviceStore.microphoneDeviceId } : undefined
			},
			video: {
				deviceId: deviceStore.cameraDeviceId ? { exact: deviceStore.cameraDeviceId } : undefined,
				width: { ideal: 1280 },
				height: { ideal: 720 },
				facingMode: "user"
			}
		};

		navigator.mediaDevices.getUserMedia(constraints)
			.then(stream => {
				this.showSpeechAcceptedModal(stream, false);
			})
			.catch(error => {
				console.error(error.name);

				// Try again without camera which might be blocked.
				constraints.video = undefined;

				navigator.mediaDevices.getUserMedia(constraints)
					.then(stream => {
						this.showSpeechAcceptedModal(stream, true);
					})
					.catch(error => {
						console.error(error.name);

						// Give up. Show error message.
						this.cancelSpeech();

						Toaster.showError(t("course.speech.request.aborted"));
					});
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

	private showSpeechAcceptedModal(stream: MediaStream, camBlocked: boolean) {
		if (this.speechRequestId) {
			const speechModal = new SpeechAcceptedModal();
			speechModal.stream = stream;
			speechModal.cameraBlocked = camBlocked;
			speechModal.addEventListener("speech-accepted-canceled", () => {
				this.cancelSpeech();
			});
			speechModal.addEventListener("speech-accepted-start", () => {
				this.janusService.startSpeech(!camBlocked);
			});

			this.registerModal("SpeechAcceptedModal", speechModal);
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

		this.registerModal("SettingsModal", settingsModal);
	}

	private onMediaPlayError() {
		if (this.modals.has("EntryModal")) {
			return;
		}

		const entryModal = new EntryModal();
		entryModal.addEventListener("modal-closed", () => {
			this.host.dispatchEvent(Utils.createEvent("player-start-media"));
		});

		this.registerModal("EntryModal", entryModal);
	}

	private registerModal(name: string, modal: Modal, autoRemove: boolean = true, open: boolean = true) {
		if (autoRemove) {
			modal.addEventListener("modal-closed", () => {
				this.closeAndDeleteModal(name);
			});
		}

		modal.container = this.host.renderRoot;

		// Close potentially opened modal of same type to prevent modal overlapping.
		this.closeModal(name);

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