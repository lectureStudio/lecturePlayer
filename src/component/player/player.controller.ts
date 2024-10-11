import { ReactiveController } from 'lit';
import { EventService } from '../../service/event.service';
import { ChatService } from '../../service/chat.service';
import { ModerationService } from "../../service/moderation.service";
import { DeviceInfo, Devices } from '../../utils/devices';
import { MediaProfile, Settings } from '../../utils/settings';
import { State } from '../../utils/state';
import { Utils } from '../../utils/utils';
import { EntryModal } from '../entry-modal/entry.modal';
import { PlayerViewController } from '../player-view/player-view.controller';
import { ReconnectModal } from '../reconnect-modal/reconnect.modal';
import { RecordedModal } from '../recorded-modal/recorded.modal';
import { LecturePlayer } from './player';
import { featureStore } from '../../store/feature.store';
import { chatStore } from '../../store/chat.store';
import { privilegeStore } from '../../store/privilege.store';
import { participantStore } from '../../store/participants.store';
import { courseStore } from '../../store/course.store';
import { userStore } from '../../store/user.store';
import { documentStore } from '../../store/document.store';
import { uiStateStore } from '../../store/ui-state.store';
import { ToolController } from '../../tool/tool-controller';
import { MouseListener } from '../../event/mouse-listener';
import { SlideView } from '../slide-view/slide-view';
import { deviceStore } from '../../store/device.store';
import { CourseStateApi } from '../../transport/course-state-api';
import { CourseUserApi } from '../../transport/course-user-api';
import { CourseParticipantApi } from '../../transport/course-participant-api';
import { CourseChatApi } from '../../transport/course-chat-api';
import { ApplicationContext } from '../controller/context';
import { EventEmitter } from '../../utils/event-emitter';
import { RootController } from '../controller/root.controller';
import { Controller } from '../controller/controller';
import { streamStatsStore } from '../../store/stream-stats.store';
import { LpChatResponseEvent, LpChatStateEvent, LpEventServiceStateEvent, LpMediaStateEvent, LpParticipantPresenceEvent, LpParticipantModerationEvent, LpQuizStateEvent, LpRecordingStateEvent, LpStreamStateEvent } from '../../event';
import { Toaster } from '../../utils/toaster';
import { t } from 'i18next';

export class PlayerController extends Controller implements ReactiveController {

	private readonly host: LecturePlayer;

	private eventService: EventService;

	private playerViewController: PlayerViewController;

	private connecting: boolean;


	constructor(host: LecturePlayer) {
		const context: ApplicationContext = {
			eventEmitter: new EventEmitter(),
			chatService: new ChatService(),
			moderationService: new ModerationService(),
			host: host,
		}

		super(new RootController(context), context);

		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		this.testConnection();
		this.setInitialState();

		this.eventService = new EventService(this.host.courseId, this.eventEmitter);
		this.eventService.addEventSubService(this.context.chatService);

		this.context.moderationService.initialize(this.host.courseId);

		this.host.addEventListener("participant-audio-play-error", this.onAudioPlayError.bind(this), false);
		this.host.addEventListener("participant-video-play-error", this.onVideoPlayError.bind(this), false);

		this.eventEmitter.addEventListener("lp-event-service-state", this.onEventServiceState.bind(this));
		this.eventEmitter.addEventListener("lp-chat-state", this.onChatState.bind(this));
		this.eventEmitter.addEventListener("lp-chat-error", this.onChatError.bind(this));
		this.eventEmitter.addEventListener("lp-chat-response", this.onChatResponse.bind(this));
		this.eventEmitter.addEventListener("lp-quiz-state", this.onQuizState.bind(this));
		this.eventEmitter.addEventListener("lp-recording-state", this.onRecordingState.bind(this));
		this.eventEmitter.addEventListener("lp-stream-state", this.onStreamState.bind(this));
		this.eventEmitter.addEventListener("lp-media-state", this.onMediaState.bind(this));
		this.eventEmitter.addEventListener("lp-participant-presence", this.onParticipantPresence.bind(this));
		this.eventEmitter.addEventListener("lp-stream-connection-state", this.onStreamConnectionState.bind(this));
		this.eventEmitter.addEventListener("lp-participant-moderation", this.onParticipantModeration.bind(this));

		if (this.host.courseId) {
			this.eventService.connect();
			this.connect();
		}
	}

	setPlayerViewController(viewController: PlayerViewController) {
		this.playerViewController = viewController;
		this.playerViewController.update();

		this.rootController.viewController.update();
	}

	setSlideView(slideView: SlideView) {
		this.renderController.setSlideView(slideView);

		const toolController = new ToolController(this.renderController);
		const mouseListener = new MouseListener(toolController);

		slideView.addMouseListener(mouseListener);
	}

	private testConnection() {
		this.streamController.testConnection()
			.catch(() => uiStateStore.setStreamProbeFailed(true));
	}

	private setInitialState() {
		courseStore.isLive = this.host.getAttribute("islive") == "true";
		courseStore.isClassroom = this.host.getAttribute("isClassroom") == "true" || Settings.getMediaProfile() === MediaProfile.Classroom;

		// console.log("isLive", courseStore.isLive, "isClassroom", courseStore.isClassroom)

		// Early state recognition to avoid view flickering.
		if (courseStore.isLive) {
			if (courseStore.isClassroom) {
				uiStateStore.setState(State.CONNECTED_FEATURES);
			}
			else {
				uiStateStore.setState(State.CONNECTING);
			}
		}
		else {
			uiStateStore.setState(State.DISCONNECTED);
		}
	}

	private connect() {
		uiStateStore.setStreamState(State.DISCONNECTED);
		uiStateStore.setDocumentState(State.DISCONNECTED);

		this.loadCourseState()
			.then(async () => {
				if (featureStore.hasFeatures() || courseStore.isLive) {
					this.connecting = true;

					try {
						await this.loadUserInfo();
						await this.loadParticipants();

						if (featureStore.hasChatFeature()) {
							await this.loadChatHistory();
						}
						if (courseStore.isLive && !courseStore.isClassroom) {
							await this.loadMediaDevices();
							await this.loadStream();
							await this.loadDocuments();
						}
					}
					catch (error) {
						this.onConnectionError(error);
					}
				}

				this.updateConnectionState();
			});
	}

	private loadCourseState() {
		return CourseStateApi.getCourseState(this.host.courseId)
			.then(state => {
				console.log("* on course state");

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
			});
	}

	private loadUserInfo() {
		return CourseUserApi.getUserInformation()
			.then(userInfo => {
				console.log("* on user info");

				userStore.setUserId(userInfo.userId);
				userStore.setName(userInfo.firstName, userInfo.familyName);
				userStore.setParticipantType(userInfo.participantType);
			});
	}

	private loadParticipants() {
		return CourseParticipantApi.getParticipants(courseStore.courseId)
			.then(participants => {
				// console.log("* on participants", participants);

				participantStore.setParticipants(participants);
			});
	}

	private loadChatHistory() {
		return CourseChatApi.getChatHistory(courseStore.courseId)
			.then(history => {
				console.log("* on chat history");

				chatStore.setMessages(history.messages);
			});
	}

	private loadMediaDevices() {
		return Devices.enumerateAudioDevices(false)
			.then((deviceInfo: DeviceInfo) => {
				console.log("* on media devices");

				// Stream is not needed.
				Devices.stopMediaTracks(deviceInfo.stream);

				// Select default devices.
				if (!deviceStore.microphoneDeviceId) {
					const audioInputDevices = deviceInfo.devices.filter(device => device.kind === "audioinput");

					deviceStore.microphoneDeviceId = Devices.getDefaultDevice(audioInputDevices).deviceId;
				}
				if (!deviceStore.speakerDeviceId && deviceStore.canSelectSpeaker && !Utils.isFirefox()) {
					const audioOutputDevices = deviceInfo.devices.filter(device => device.kind === "audiooutput");

					deviceStore.speakerDeviceId = Devices.getDefaultDevice(audioOutputDevices).deviceId;
				}
				if (!deviceStore.cameraDeviceId) {
					deviceStore.cameraDeviceId = "none";
				}

				deviceStore.microphoneBlocked = false;
			})
			.catch(_error => {
				deviceStore.microphoneBlocked = true;
			});
	}

	private loadStream() {
		return this.streamController.connect();
	}

	private loadDocuments() {
		uiStateStore.setDocumentState(State.CONNECTING);

		if (!documentStore.documentMap) {
			return Promise.reject("No documents to load");
		}

		return this.documentController.getDocuments(documentStore.documentMap)
			.then(documents => {
				console.log("* on documents loaded");

				this.playbackController.start();
				this.playbackController.setDocuments(documents);

				if (documentStore.activeDocument) {
					this.playbackController.setActiveDocument(documentStore.activeDocument);
				}

				uiStateStore.setDocumentState(State.CONNECTED);

				this.updateConnectionState();
			});
	}

	private onConnectionError(cause: unknown) {
		if (cause instanceof DOMException) {
			console.error(cause.name, cause.message);
		}
		else {
			console.error(cause);
		}

		this.setConnectionState(State.DISCONNECTED);
	}

	private setDisconnected() {
		this.rootController.viewController.setFullscreen(false);

		this.playbackController.setDisconnected();

		if (this.playerViewController) {
			this.playerViewController.setDisconnected();
		}
	}

	private setReconnecting() {
		const reconnectModal = new ReconnectModal();
		reconnectModal.addEventListener("reconnect-modal-abort", () => {
			// Refresh the page.
			location.reload();
		});

		this.modalController.registerModal("ReconnectModal", reconnectModal);
	}

	private onEventServiceState(event: LpEventServiceStateEvent) {
		const state = event.detail;

		console.log("* on event service", State[state]);

		if (state == State.CONNECTED) {
			switch (uiStateStore.state) {
				case State.CONNECTING:
				//case State.CONNECTED:
				case State.CONNECTED_FEATURES:
					this.fetchChatData();
					break;
			}
		}

		if (uiStateStore.streamState === State.DISCONNECTED && uiStateStore.state === State.RECONNECTING) {
			//this.streamController.reconnect();

			this.streamController.disconnect();
			this.connect();
		}
	}

	private async fetchChatData() {
		if (this.connecting) {
			// Do not proceed with chat loading if the stream is connecting.
			return;
		}

		console.log("~ fetch");

		if (featureStore.hasChatFeature()) {
			await this.loadUserInfo();
			await this.loadParticipants();
			await this.loadChatHistory()
		}
	}

	private onChatState(event: LpChatStateEvent) {
		const chatState = event.detail;

		console.log("* on chat", chatState);

		featureStore.setChatFeature(chatState.started ? chatState.feature : undefined);

		if (this.connecting) {
			// Do not proceed with chat loading if the stream is connecting.
			return;
		}

		if (chatState.started) {
			this.fetchChatData();

		}
		else {
			this.modalController.closeAndDeleteModal("ChatModal");

			chatStore.reset();
		}

		this.updateConnectionState();
	}

	private onChatError(event: LpChatResponseEvent) {
		const response = event.detail;

		if (response.statusCode != 0) {
			Toaster.showError(t("course.feature.message.send.error"));
		}
	}

	private onChatResponse(event: LpChatResponseEvent) {
		const response = event.detail;

		if (response.statusCode == 0) {
			Toaster.showSuccess(t("course.feature.message.sent"));
		}
	}

	private onQuizState(event: LpQuizStateEvent) {
		const quizState = event.detail;

		if (!quizState.started) {
			this.modalController.closeAndDeleteModal("QuizModal");
		}

		uiStateStore.setQuizSent(!quizState.started);
		featureStore.setQuizFeature(quizState.started ? quizState.feature : undefined);

		this.updateConnectionState();
	}

	private onRecordingState(event: LpRecordingStateEvent) {
		const recordingState = event.detail;

		if (recordingState.started && !courseStore.recorded && uiStateStore.state === State.CONNECTED) {
			this.showRecordedModal();
		}
		else {
			this.modalController.closeModal("RecordedModal");
		}

		courseStore.setRecorded(recordingState.started);
	}

	private onStreamState(event: LpStreamStateEvent) {
		const streamState = event.detail;

		console.log("~ on stream state", streamState);

		if (courseStore.isClassroom) {
			// Ignore, since we are not interested in receiving streaming media.
			return;
		}

		if (streamState.started) {
			courseStore.isLive = true;
			courseStore.setTimeStarted(streamState.timeStarted);

			if (uiStateStore.state === State.CONNECTED) {
				console.log("reconnecting ...");
				this.streamController.disconnect();
			}

			this.connect();
		}
		else {
			courseStore.isLive = false;

			this.modalController.closeAllModals();

			uiStateStore.setStreamState(State.DISCONNECTED);
			uiStateStore.setDocumentState(State.DISCONNECTED);

			courseStore.reset();
			documentStore.reset();
			featureStore.reset();
			participantStore.reset();
			userStore.reset();
			chatStore.reset();
			streamStatsStore.reset();

			this.updateConnectionState();

			this.streamController.disconnect();
		}
	}

	private onMediaState(event: LpMediaStateEvent) {
		const mediaState = event.detail;
		const userId = mediaState.userId;

		if (mediaState.state.Audio != null) {
			participantStore.setParticipantMicrophoneActive(userId, mediaState.state.Audio);
		}
		if (mediaState.state.Camera != null) {
			participantStore.setParticipantCameraActive(userId, mediaState.state.Camera);
		}
		if (mediaState.state.Screen != null) {
			participantStore.setParticipantScreenActive(userId, mediaState.state.Screen);
		}
	}

	private onParticipantPresence(event: LpParticipantPresenceEvent) {
		const participant = event.detail;

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

	private onAudioPlayError() {
		console.log("** audio play error");

		Devices.enumerateAudioDevices(false)
			.then((deviceInfo: DeviceInfo) => {
				// Stream is not needed.
				Devices.stopMediaTracks(deviceInfo.stream);

				this.host.dispatchEvent(Utils.createEvent("player-start-media"));
			})
			.catch(error => {
				console.error(error);
			});
	}

	private onVideoPlayError() {
		console.log("** video play error");

		if (this.modalController.hasModalRegistered("EntryModal")) {
			return;
		}

		const entryModal = new EntryModal();
		entryModal.addEventListener("modal-closed", () => {
			this.host.dispatchEvent(Utils.createEvent("player-start-media"));
		});

		this.modalController.registerModal("EntryModal", entryModal);
	}

	private onStreamConnectionState() {
		this.updateConnectionState();
	}

	private onParticipantModeration(event: LpParticipantModerationEvent) {
		const moderation = event.detail;

		if (moderation.userId !== userStore.userId) {
			console.log("User moderation event for user, but not me.")
			return;
		}

		if (moderation.moderationType === "PERMANENT_BAN") {
			console.log("User banned.")
			this.modalController.closeAllModals();

			uiStateStore.setStreamState(State.NO_ACCESS);
			uiStateStore.setDocumentState(State.NO_ACCESS);
			this.streamController.disconnect();
			this.eventService.close();
			this.updateConnectionState();

			Toaster.showWarning(t("course.moderation.toast.permanent_banned.title"),
				t("course.moderation.toast.permanent_banned.description"), Infinity);
		}
	}

	private updateConnectionState() {
		const state = uiStateStore.state;
		const streamState = uiStateStore.streamState;
		const documentState = uiStateStore.documentState;

		console.log("** update state:", State[state],
			", streamState", State[streamState],
			", documentState", State[documentState],
			", has features", featureStore.hasFeatures());

		if (streamState == State.NO_ACCESS || documentState == State.NO_ACCESS) {
			this.setConnectionState(State.NO_ACCESS);
			return;
		}

		if (this.hasStream() && !courseStore.isClassroom) {
			if (streamState === State.CONNECTED && documentState === State.CONNECTED) {
				this.setConnectionState(State.CONNECTED);

				if (courseStore.recorded && !this.connecting) {
					this.showRecordedModal();
				}

				this.connecting = false;
			}
			else if (streamState === State.DISCONNECTED) {
				if (state === State.CONNECTED) {
					this.setConnectionState(State.RECONNECTING);
				}
				else if (state === State.RECONNECTING) {
					console.log("** reconnecting ...");
					this.streamController.disconnect();
					this.connect();
				}
			}
		}
		else if (featureStore.hasFeatures()) {
			this.setConnectionState(State.CONNECTED_FEATURES);

			this.connecting = false;
		}
		else {
			this.setConnectionState(State.DISCONNECTED);
		}
	}

	private setConnectionState(state: State) {
		if (uiStateStore.state === state) {
			return;
		}
		if (uiStateStore.state == State.NO_ACCESS) {
			console.log("no access, skip state change");
			return;
		}

		console.log("new state", State[state])

		uiStateStore.setState(state);

		if (uiStateStore.state !== State.RECONNECTING) {
			this.modalController.closeAndDeleteModal("ReconnectModal");
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

	private showRecordedModal() {
		this.modalController.registerModal("RecordedModal", new RecordedModal());
	}
}
