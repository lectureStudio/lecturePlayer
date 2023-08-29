import { ReactiveController } from 'lit';
import { MessengerState, QuizState } from '../../model/course-state';
import { CourseParticipantPresence } from '../../model/participant';
import { EventService } from '../../service/event.service';
import { ChatService } from '../../service/chat.service';
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
import { MediaStateEvent, RecordingStateEvent, StreamStateEvent } from '../../model/event/queue-events';
import { CourseStateApi } from '../../transport/course-state-api';
import { CourseUserApi } from '../../transport/course-user-api';
import { CourseParticipantApi } from '../../transport/course-participant-api';
import { CourseChatApi } from '../../transport/course-chat-api';
import { ApplicationContext } from '../controller/context';
import { EventEmitter } from '../../utils/event-emitter';
import { RootController } from '../controller/root.controller';
import { Controller } from '../controller/controller';
import { streamStatsStore } from '../../store/stream-stats.store';

export class PlayerController extends Controller implements ReactiveController {

	private readonly host: LecturePlayer;

	private eventService: EventService;

	private playerViewController: PlayerViewController;

	private connecting: boolean;


	constructor(host: LecturePlayer) {
		const context: ApplicationContext = {
			eventEmitter: new EventEmitter(),
			chatService: new ChatService(),
			host: host,
		}

		super(new RootController(context), context);

		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		this.setInitialState();

		this.eventService = new EventService(this.host.courseId, this.eventEmitter);
		this.eventService.addEventSubService(this.context.chatService);
		this.eventService.connect();

		this.host.addEventListener("participant-audio-play-error", this.onAudioPlayError.bind(this), false);
		this.host.addEventListener("participant-video-play-error", this.onVideoPlayError.bind(this), false);

		this.eventEmitter.addEventListener("event-service-state", this.onEventServiceState.bind(this));
		this.eventEmitter.addEventListener("event-service-chat-state", this.onChatState.bind(this));
		this.eventEmitter.addEventListener("event-service-quiz-state", this.onQuizState.bind(this));
		this.eventEmitter.addEventListener("event-service-recording-state", this.onRecordingState.bind(this));
		this.eventEmitter.addEventListener("event-service-stream-state", this.onStreamState.bind(this));
		this.eventEmitter.addEventListener("event-service-media-state", this.onMediaState.bind(this));
		this.eventEmitter.addEventListener("event-service-participant-presence", this.onParticipantPresence.bind(this));

		this.eventEmitter.addEventListener("stream-connection-state", this.onStreamConnectionState.bind(this));

		this.connect();
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

	private setInitialState() {
		courseStore.isLive = this.host.getAttribute("islive") == "true";
		courseStore.isClassroom = this.host.getAttribute("isClassroom") == "true" || Settings.getMediaProfile() === MediaProfile.Classroom;

		console.log("isLive", courseStore.isLive, "isClassroom", courseStore.isClassroom)

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

	private setConnectionState(state: State) {
		if (uiStateStore.state === state) {
			return;
		}

		console.log("new state", state)

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

	private connect() {
		this.connecting = true;

		uiStateStore.setStreamState(State.DISCONNECTED);
		uiStateStore.setDocumentState(State.DISCONNECTED);

		this.loadCourseState()
			.then(async () => {
				const tasks = new Array<Promise<void>>();

				if (featureStore.hasFeatures() || courseStore.isLive) {
					try {
						await this.loadUserInfo();
						await this.loadParticipants();

						if (featureStore.hasChatFeature()) {
							await tasks.push(this.loadChatHistory());
						}
						if (courseStore.isLive) {
							await tasks.push(this.loadMediaDevices());
							await tasks.push(this.loadStream());
							await tasks.push(this.loadDocuments());
						}

					}
					catch (error) {
						this.onConnectionError(error);
					}
				}

				this.connecting = false;

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
				console.log("* on participants", participants);

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
			.catch(error => {
				deviceStore.microphoneBlocked = true;

				throw error;
			});
	}

	private loadStream() {
		return this.streamController.connect();
	}

	private loadDocuments() {
		uiStateStore.setDocumentState(State.CONNECTING);

		return this.documentController.getDocuments(documentStore.documentMap)
			.then(documents => {
				console.log("* on documents loaded");

				this.playbackController.start();
				this.playbackController.setDocuments(documents);
				this.playbackController.setActiveDocument(documentStore.activeDocument);

				this.modalController.registerModal("RecordedModal", new RecordedModal(), false, false);

				if (courseStore.recorded) {
					this.modalController.openModal("RecordedModal");
				}

				uiStateStore.setDocumentState(State.CONNECTED);

				this.updateConnectionState();
			});
	}

	private onConnectionError(cause: any) {
		console.error(cause);

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
			this.setConnectionState(State.DISCONNECTED);
		});

		this.modalController.registerModal("ReconnectModal", reconnectModal);
	}

	private onEventServiceState(event: CustomEvent) {
		if (this.connecting) {
			return;
		}

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

		if (uiStateStore.state === State.DISCONNECTED) {
			return;
		}

		if (uiStateStore.streamState === State.DISCONNECTED && courseStore.isLive) {
			this.streamController.reconnect();
		}
	}

	private fetchChatHistory() {
		console.log("~ fetch");

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

		console.log("* on chat", state);

		if (this.connecting) {
			// Do not proceed with chat loading if the stream is connecting.
			return;
		}

		featureStore.setChatFeature(state.started ? state.feature : null);

		if (state.started) {
			this.fetchChatHistory();

		}
		else {
			this.modalController.closeAndDeleteModal("ChatModal");

			chatStore.reset();
		}

		this.updateConnectionState();
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;

		if (!state.started) {
			this.modalController.closeAndDeleteModal("QuizModal");
		}

		featureStore.setQuizFeature(state.started ? state.feature : null);

		this.updateConnectionState();
	}

	private onRecordingState(event: CustomEvent) {
		const recordingEvent: RecordingStateEvent = event.detail;

		if (this.host.courseId !== recordingEvent.courseId) {
			return;
		}

		if (recordingEvent.recorded) {
			this.modalController.openModal("RecordedModal");
		}
		else {
			this.modalController.closeModal("RecordedModal");
		}
	}

	private onStreamState(event: CustomEvent) {
		const streamEvent: StreamStateEvent = event.detail;

		console.log("~ on stream state", streamEvent);

		if (courseStore.isClassroom) {
			return;
		}

		if (streamEvent.started) {
			courseStore.isLive = true;
			courseStore.setTimeStarted(streamEvent.timeStarted);

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

	private updateConnectionState() {
		const state = uiStateStore.state;
		const streamState = uiStateStore.streamState;
		const documentState = uiStateStore.documentState;

		console.log("** update state:", state, ", streamState", streamState, ", documentState", documentState, ", has features", featureStore.hasFeatures());

		if (this.hasStream() && !courseStore.isClassroom) {
			if (streamState === State.CONNECTED && documentState === State.CONNECTED) {
				this.setConnectionState(State.CONNECTED);
			}
			else if (streamState === State.DISCONNECTED && state === State.CONNECTED) {
				this.setConnectionState(State.RECONNECTING);
			}
		}
		else if (featureStore.hasFeatures() && !this.connecting) {
			this.setConnectionState(State.CONNECTED_FEATURES);
		}
		else {
			this.setConnectionState(State.DISCONNECTED);
		}
	}
}