import { ReactiveController } from 'lit';
import { StreamStatsModal } from "../../component/stream-stats-modal/stream-stats.modal";
import { ApplicationContext } from "../../context/application.context";
import { CourseContext } from "../../context/course.context";
import { PlaybackController } from "../../controller/playback.controller";
import { SpeechController } from "../../controller/speech.controller";
import { StreamController } from "../../controller/stream.controller";
import { Course } from "../../model/course";
import { MediaProfile } from "../../model/ui-state";
import { privilegeStore } from "../../store/privilege.store";
import { CourseStateApi } from "../../transport/course-state-api";
import { DeviceInfo, Devices } from '../../utils/devices';
import { State } from '../../utils/state';
import { Utils } from '../../utils/utils';
import { EntryModal } from '../../component/entry-modal/entry.modal';
import { ReconnectModal } from '../../component/reconnect-modal/reconnect.modal';
import { RecordedModal } from '../../component/recorded-modal/recorded.modal';
import { chatStore } from '../../store/chat.store';
import { participantStore } from '../../store/participants.store';
import { courseStore } from '../../store/course.store';
import { userStore } from '../../store/user.store';
import { documentStore } from '../../store/document.store';
import { uiStateStore } from '../../store/ui-state.store';
import { deviceStore } from '../../store/device.store';
import { CourseUserApi } from '../../transport/course-user-api';
import { CourseParticipantApi } from '../../transport/course-participant-api';
import { CourseChatApi } from '../../transport/course-chat-api';
import { streamStatsStore } from '../../store/stream-stats.store';
import { LpChatResponseEvent, LpChatStateEvent, LpEventServiceStateEvent, LpMediaStateEvent, LpParticipantPresenceEvent, LpParticipantModerationEvent, LpQuizStateEvent, LpRecordingStateEvent, LpStreamStateEvent } from '../../event';
import { Toaster } from '../../utils/toaster';
import { t } from 'i18next';
import { CourseView } from "./course-view";
import EventContext from "../../decorator/event-context.decorator";

export class CourseViewController implements ReactiveController {

	private readonly host: CourseView;

	private readonly course: Course | undefined;

	private readonly applicationContext: ApplicationContext;

	private readonly courseContext: CourseContext;

	private streamController: StreamController;

	private playbackController: PlaybackController;

	private speechController: SpeechController;

	private connecting: boolean;


	constructor(host: CourseView) {
		this.host = host;
		this.course = host.course;
		this.applicationContext = this.host.applicationContext;
		this.courseContext = this.host.courseContext;

		host.addController(this);
	}

	@EventContext("course-view")
	hostConnected() {
		const eventEmitter = this.applicationContext.eventEmitter;

		this.streamController = new StreamController(this.courseContext);

		this.testConnection();
		this.setInitialState();

		this.applicationContext.eventService.initializeSubService(this.courseContext.chatService);

		this.host.addEventListener("participant-audio-play-error", this.onAudioPlayError.bind(this), false);
		this.host.addEventListener("participant-video-play-error", this.onVideoPlayError.bind(this), false);

		eventEmitter.addEventListener("lp-stream-statistics", this.onStatistics.bind(this));
		eventEmitter.addEventListener("lp-event-service-state", this.onEventServiceState.bind(this));
		eventEmitter.addEventListener("lp-chat-state", this.onChatState.bind(this));
		eventEmitter.addEventListener("lp-chat-error", this.onChatError.bind(this));
		eventEmitter.addEventListener("lp-chat-response", this.onChatResponse.bind(this));
		eventEmitter.addEventListener("lp-quiz-state", this.onQuizState.bind(this));
		eventEmitter.addEventListener("lp-recording-state", this.onRecordingState.bind(this));
		eventEmitter.addEventListener("lp-stream-state", this.onStreamState.bind(this));
		eventEmitter.addEventListener("lp-media-state", this.onMediaState.bind(this));
		eventEmitter.addEventListener("lp-participant-presence", this.onParticipantPresence.bind(this));
		eventEmitter.addEventListener("lp-stream-connection-state", this.onStreamConnectionState.bind(this));
		eventEmitter.addEventListener("lp-participant-moderation", this.onParticipantModeration.bind(this));

		if (courseStore.activeCourse?.isLive) {
			this.connect();
		}
	}

	hostDisconnected() {
		uiStateStore.setState(State.DISCONNECTED);
		uiStateStore.setStreamState(State.DISCONNECTED);
		uiStateStore.setDocumentState(State.DISCONNECTED);

		this.applicationContext.eventService.disposeSubService(this.courseContext.chatService);

		// Remove all registered event listeners.
		this.applicationContext.eventEmitter.disposeContext("course-view");

		if (this.playbackController) {
			this.playbackController.dispose();
		}
		if (this.speechController) {
			this.speechController.dispose();
		}
		if (this.streamController) {
			this.streamController.dispose();
		}
	}

	private testConnection() {
		this.streamController.testConnection()
			.catch(() => uiStateStore.setStreamProbeFailed(true));
	}

	private setInitialState() {
		courseStore.isClassroom = uiStateStore.mediaProfile === MediaProfile.CLASSROOM;

		// Early state recognition to avoid the view flickering.
		if (courseStore.activeCourse?.isLive) {
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

	private initControllers() {
		this.playbackController = new PlaybackController(this.courseContext, this.streamController);
		this.speechController = new SpeechController(this.courseContext, this.streamController);
	}

	private connect() {
		uiStateStore.setStreamState(State.DISCONNECTED);
		uiStateStore.setDocumentState(State.DISCONNECTED);

		if (!this.course) {
			throw new Error("Course not found");
		}

		this.initControllers();

		this.loadCourseState(this.course)
			.then(async () => {
				if (courseStore.hasFeatures() || courseStore.activeCourse?.isLive) {
					this.connecting = true;

					try {
						await this.loadUserInfo();
						await this.loadParticipants();

						if (courseStore.hasChatFeature()) {
							await this.loadChatHistory();
						}
						if (courseStore.activeCourse?.isLive && !courseStore.isClassroom) {
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

	private async loadCourseState(course: Course) {
		const state = await CourseStateApi.getCourseState(course.id);

		console.log("* on course state");

		privilegeStore.setPrivileges(state.userPrivileges);
		documentStore.setActiveDocument(state.activeDocument);
		documentStore.setDocumentMap(state.documentMap);
	}

	private async loadUserInfo() {
		const userInfo = await CourseUserApi.getUserInformation();

		console.log("* on user info");

		userStore.setUserId(userInfo.userId);
		userStore.setName(userInfo.firstName, userInfo.familyName);
		userStore.setParticipantType(userInfo.participantType);
	}

	private async loadParticipants() {
		if (!courseStore.activeCourse) {
			throw new Error("Course is not set");
		}

		const participants = await CourseParticipantApi.getParticipants(courseStore.activeCourse.id);

		console.log("* on participants", participants);

		participantStore.setParticipants(participants);
	}

	private async loadChatHistory() {
		if (!courseStore.activeCourse) {
			throw new Error("Course is not set");
		}

		const history = await CourseChatApi.getChatHistory(courseStore.activeCourse.id);

		console.log("* on chat history");

		chatStore.setMessages(history.messages);
	}

	private async loadMediaDevices() {
		try {
			const deviceInfo = await Devices.enumerateAudioDevices(false);
			console.log("* on media devices");

			// Stream is not needed.
			Devices.stopMediaTracks(deviceInfo.stream);

			// Select default devices.
			if (!deviceStore.microphoneDeviceId) {
				const audioInputDevices = deviceInfo.devices.filter(device => device.kind === "audioinput");

				deviceStore.microphoneDeviceId = Devices.getDefaultDevice(audioInputDevices).deviceId;
			}
			if (!deviceStore.speakerDeviceId && deviceStore.canSelectSpeaker && !Utils.isFirefox()) {
				const audioOutputDevices = deviceInfo.devices.filter(device_1 => device_1.kind === "audiooutput");

				deviceStore.speakerDeviceId = Devices.getDefaultDevice(audioOutputDevices).deviceId;
			}
			if (!deviceStore.cameraDeviceId) {
				deviceStore.cameraDeviceId = "none";
			}

			deviceStore.microphoneBlocked = false;
		}
		catch (_error) {
			deviceStore.microphoneBlocked = true;
		}
	}

	private loadStream() {
		return this.streamController.connect();
	}

	private async loadDocuments() {
		uiStateStore.setDocumentState(State.CONNECTING);

		if (!documentStore.documentMap) {
			return Promise.reject("No documents to load");
		}

		const documents = await this.courseContext.documentService.getDocuments(documentStore.documentMap);

		console.log("* on documents loaded");

		this.playbackController.start();
		this.playbackController.setDocuments(documents);

		if (documentStore.activeDocument) {
			this.playbackController.setActiveDocument(documentStore.activeDocument);
		}

		this.applicationContext.modalController.registerModal("RecordedModal", new RecordedModal(), false, false);

		if (courseStore.activeCourse?.isRecorded) {
			this.applicationContext.modalController.openModal("RecordedModal");
		}

		uiStateStore.setDocumentState(State.CONNECTED);

		this.updateConnectionState();
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
		this.applicationContext.eventEmitter.dispatchEvent(Utils.createEvent("lp-fullscreen", false));

		this.playbackController.setDisconnected();
	}

	private setReconnecting() {
		const reconnectModal = new ReconnectModal();
		reconnectModal.addEventListener("reconnect-modal-abort", () => {
			// Refresh the page.
			location.reload();
		});

		this.applicationContext.modalController.registerModal("ReconnectModal", reconnectModal);
	}

	private onStatistics() {
		const statisticsModal = new StreamStatsModal();
		statisticsModal.eventEmitter = this.applicationContext.eventEmitter;

		this.applicationContext.modalController.registerModal("StreamStatsModal", statisticsModal);
	}

	private onEventServiceState(event: LpEventServiceStateEvent) {
		const state = event.detail;

		console.log("* on event service", state, uiStateStore.state);

		if (state == State.CONNECTED) {
			switch (uiStateStore.state) {
				case State.CONNECTING:
				//case State.CONNECTED:
				// case State.CONNECTED_FEATURES:
				// 	this.fetchChatData();
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

		if (courseStore.hasChatFeature()) {
			await this.loadUserInfo();
			await this.loadParticipants();
			await this.loadChatHistory()
		}
	}

	private onChatState(event: LpChatStateEvent) {
		const chatState = event.detail;

		console.log("* on chat", chatState, uiStateStore.state);

		if (this.connecting) {
			// Do not proceed with chat loading if the stream is connecting.
			return;
		}

		if (chatState.started) {
			this.fetchChatData();

		}
		else {
			this.applicationContext.modalController.closeAndDeleteModal("ChatModal");

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
			this.applicationContext.modalController.closeAndDeleteModal("QuizModal");
		}

		uiStateStore.setQuizSent(!quizState.started);

		this.updateConnectionState();
	}

	private onRecordingState(event: LpRecordingStateEvent) {
		const recordingState = event.detail;

		if (recordingState.recorded) {
			this.applicationContext.modalController.openModal("RecordedModal");
		}
		else {
			this.applicationContext.modalController.closeModal("RecordedModal");
		}
	}

	private onStreamState(event: LpStreamStateEvent) {
		const streamState = event.detail;

		console.log("~ on stream state", streamState);

		if (courseStore.isClassroom) {
			// Ignore, since we are not interested in receiving streaming media.
			return;
		}

		if (streamState.started) {
			if (uiStateStore.state === State.CONNECTED) {
				console.log("reconnecting ...");
				this.streamController.disconnect();
			}

			this.connect();
		}
		else {
			this.applicationContext.modalController.closeAllModals();

			uiStateStore.setStreamState(State.DISCONNECTED);
			uiStateStore.setDocumentState(State.DISCONNECTED);

			courseStore.reset();
			documentStore.reset();
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

		if (this.applicationContext.modalController.hasModalRegistered("EntryModal")) {
			return;
		}

		const entryModal = new EntryModal();
		entryModal.addEventListener("modal-closed", () => {
			this.host.dispatchEvent(Utils.createEvent("player-start-media"));
		});

		this.applicationContext.modalController.registerModal("EntryModal", entryModal);
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
			this.applicationContext.modalController.closeAllModals();

			uiStateStore.setStreamState(State.NO_ACCESS);
			uiStateStore.setDocumentState(State.NO_ACCESS);
			this.streamController.disconnect();
			// this.eventService.close();
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
			", has features", courseStore.hasFeatures());

		if (streamState == State.NO_ACCESS || documentState == State.NO_ACCESS) {
			this.setConnectionState(State.NO_ACCESS);
			return;
		}

		if (this.hasStream() && !courseStore.isClassroom) {
			if (streamState === State.CONNECTED && documentState === State.CONNECTED) {
				this.setConnectionState(State.CONNECTED);

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
		else if (courseStore.hasFeatures()) {
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
			this.applicationContext.modalController.closeAndDeleteModal("ReconnectModal");
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
}
