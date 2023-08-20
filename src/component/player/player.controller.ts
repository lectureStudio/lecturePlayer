import { ReactiveController } from 'lit';
import { StreamActionProcessor } from '../../action/stream-action-processor';
import { CourseState, MessengerState, QuizState } from '../../model/course-state';
import { CourseParticipant, CourseParticipantPresence } from '../../model/participant';
import { CourseStateDocument } from '../../model/course-state-document';
import { SlideDocument } from '../../model/document';
import { CourseStateService } from '../../service/course.service';
import { EventService } from '../../service/event.service';
import { JanusService } from '../../service/janus.service';
import { ChatHistory, ChatService } from '../../service/chat.service';
import { PlaybackService } from '../../service/playback.service';
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
import { CourseStateApi } from '../../transport/course-state-api';
import { CourseSpeechApi } from '../../transport/course-speech-api';
import { CourseUserApi } from '../../transport/course-user-api';
import { CourseParticipantApi } from '../../transport/course-participant-api';
import { CourseChatApi } from '../../transport/course-chat-api';
import { CourseNotLiveError } from '../../error/course-not-live.error';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;

	private readonly maxWidth576Query: MediaQueryList;

	private readonly courseStateService: CourseStateService;

	private readonly janusService: JanusService;

	private readonly playbackService: PlaybackService;

	readonly chatService: ChatService;

	private documentState: State;

	private janusServiceState: State;

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

		this.chatService = new ChatService();

		this.playbackService = new PlaybackService();
		this.playbackService.initialize(this.renderController);

		const actionProcessor = new StreamActionProcessor(this.playbackService);
		actionProcessor.onGetDocument = this.getDocument.bind(this);
		actionProcessor.onPeerConnected = this.onPeerConnected.bind(this);

		this.courseStateService = new CourseStateService();
		this.janusService = new JanusService("https://" + window.location.hostname + ":8089/janus", actionProcessor);
		this.modals = new Map();

		this.maxWidth576Query = window.matchMedia("(max-width: 575px) , (orientation: portrait)");
	}

	hostConnected() {
		this.eventService = new EventService(this.host.courseId);
		this.eventService.addEventSubService(this.chatService);
		this.eventService.connect();

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
			if (this.isClassroomProfile() || this.host.isClassroom) {
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

	private connect() {
		CourseStateApi.getCourseState(this.host.courseId)
			.then(this.onCourseState.bind(this))
			.then(this.onUserInformation.bind(this))
			.then(this.onCourseParticipants.bind(this))
			.then(this.onChatHistory.bind(this))
			.then(this.onMediaDevicesHandled.bind(this))
			.then(this.onConnected.bind(this))
			.catch(this.onConnectionError.bind(this));
	}

	private onCourseState(state: CourseState) {
		courseStore.setCourseId(state.courseId);
		courseStore.setTimeStarted(state.timeStarted);
		courseStore.setTitle(state.title);
		courseStore.setDescription(state.description);
		courseStore.setConference(state.conference);
		courseStore.setRecorded(state.recorded);

		privilegeStore.setPrivileges(state.userPrivileges);

		featureStore.setChatFeature(state.messageFeature);
		featureStore.setQuizFeature(state.quizFeature);

		documentStore.setActiveDocument(state.activeDocument);
		documentStore.setDocumentMap(state.documentMap);

		return CourseUserApi.getUserInformation();
	}

	private onUserInformation(courseUser: CourseParticipant) {
		userStore.setUserId(courseUser.userId);
		userStore.setName(courseUser.firstName, courseUser.familyName);
		userStore.setParticipantType(courseUser.participantType);

		if (!documentStore.activeDocument && !featureStore.hasFeatures()) {
			return Promise.reject(new CourseNotLiveError());
		}

		return CourseParticipantApi.getParticipants(courseStore.courseId);
	}

	private onCourseParticipants(participants: CourseParticipant[]) {
		participantStore.setParticipants(participants);

		if (featureStore.hasChatFeature()) {
			return CourseChatApi.getChatHistory(courseStore.courseId)
		}
		else {
			return Promise.resolve(null);
		}
	}

	private onChatHistory(history: ChatHistory) {
		if (history) {
			chatStore.setMessages(history.messages);
		}

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
		console.log("~ connecting janus");

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
					this.playbackService.start();
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
		// Ignore 'not live' errors, since this will only interrupt the procedure chain.
		if (!(cause instanceof CourseNotLiveError)) {
			// If any of the previous executions fail, panic.
			console.error(cause);
		}

		this.setConnectionState(State.DISCONNECTED);
	}

	private setDisconnected() {
		this.setFullscreen(false);

		this.playbackService.stop();

		if (this.viewController) {
			this.viewController.setDisconnected();
		}
	}

	private setReconnecting() {
		const reconnectModal = new ReconnectModal();
		reconnectModal.addEventListener("reconnect-modal-abort", () => {
			this.setConnectionState(State.DISCONNECTED);
		});

		this.registerModal("ReconnectModal", reconnectModal);
	}

	private getDocument(stateDoc: CourseStateDocument): Promise<SlideDocument> {
		return this.courseStateService.getDocument(this.host.courseId, stateDoc);
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
			chatModal.messageService = this.chatService;

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

		if (connected) {
			switch (uiStateStore.state) {
				case State.CONNECTING:
				case State.CONNECTED:
				case State.CONNECTED_FEATURES:
					this.fetchChatHistory();
					break;
			}
		}

		if (this.janusServiceState === State.DISCONNECTED) {
			this.janusService.reconnect();
		}
	}

	private fetchChatHistory() {
		if (featureStore.hasChatFeature()) {
			CourseParticipantApi.getParticipants(courseStore.courseId)
				.then(participants => {
					participantStore.setParticipants(participants);
				});

			CourseChatApi.getChatHistory(courseStore.courseId)
				.then(history => {
					chatStore.setMessages(history.messages);
				});
		}
	}

	private onChatState(event: CustomEvent) {
		const state: MessengerState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		featureStore.setChatFeature(state.started ? state.feature : null);

		if (state.started) {
			this.fetchChatHistory();
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
			courseStore.setTimeStarted(streamEvent.timeStarted);

			if (uiStateStore.state === State.CONNECTED) {
				console.log("reconnecting ...");
				this.janusService.disconnect();
			}

			this.connect();
		}
		else {
			this.closeAllModals();

			this.documentState = State.DISCONNECTED;
			this.janusServiceState = State.DISCONNECTED;

			courseStore.reset();
			documentStore.reset();
			featureStore.reset();
			participantStore.reset();
			userStore.reset();
			chatStore.reset();

			this.updateConnectionState();
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
		if (this.hasStream() && !this.isClassroomProfile()) {
			if (this.janusServiceState === State.CONNECTED && this.documentState === State.CONNECTED) {
				this.setConnectionState(State.CONNECTED);
			}
		}
		else if (featureStore.hasFeatures()) {
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
		return Settings.getMediaProfile() === MediaProfile.Classroom || this.host.isClassroom;
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
		CourseSpeechApi.requestSpeech(this.host.courseId)
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

		CourseSpeechApi.cancelSpeech(this.host.courseId, this.speechRequestId)
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