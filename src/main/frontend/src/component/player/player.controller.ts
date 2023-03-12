import { ReactiveController } from 'lit';
import { StreamActionProcessor } from '../../action/stream-action-processor';
import { CourseParticipant, CourseParticipantPresence, CourseState, MessengerState, QuizState } from '../../model/course-state';
import { CourseStateDocument } from '../../model/course-state-document';
import { SlideDocument } from '../../model/document';
import { CourseStateService } from '../../service/course.service';
import { EventService } from '../../service/event.service';
import { JanusService } from '../../service/janus.service';
import { MessageService, MessageServiceHistory } from '../../service/message.service';
import { PlaybackService } from '../../service/playback.service';
import { PrivilegeService } from '../../service/privilege.service';
import { SpeechService } from '../../service/speech.service';
import { HttpRequest } from '../../utils/http-request';
import { State } from '../../utils/state';
import { PlayerViewController } from '../player-view/player-view.controller';
import { LecturePlayer } from './player';
import { course } from '../../model/course';
import { participants } from '../../model/participants';
import { chatHistory } from '../../model/chat-history';
import { Modal } from '../modal/modal';
import { P2PService } from '../../service/p2p.service';

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

	private readonly privilegeService: PrivilegeService;

	private readonly janusService: JanusService;

	private readonly playbackService: PlaybackService;

	private readonly messageService: MessageService;

	private eventService: EventService;

	private viewController: PlayerViewController;

	private speechRequestId: bigint;

	private devicesSelected: boolean;

	private modals: Map<string, Modal>;


	constructor(host: LecturePlayer) {
		this.host = host;
		this.host.addController(this);

		this.messageService = new MessageService();
		this.speechService = new SpeechService();
		this.playbackService = new PlaybackService();
		this.privilegeService = new PrivilegeService();

		const actionProcessor = new StreamActionProcessor(this.playbackService);
		actionProcessor.onGetDocument = this.getDocument.bind(this);
		actionProcessor.onPeerConnected = this.onPeerConnected.bind(this);

		this.courseStateService = new CourseStateService("https://" + window.location.host);
		this.janusService = new JanusService("https://" + window.location.hostname + ":8089/janus", actionProcessor);
		this.modals = new Map();

		this.maxWidth576Query = window.matchMedia("(max-width: 576px)");
	}

	hostConnected() {
		this.eventService = new EventService(this.host.courseId);
		this.eventService.addEventSubService(this.messageService);
		this.eventService.addEventSubService(new P2PService());
		this.eventService.connect();

		this.host.messageService = this.messageService;
		this.host.privilegeService = this.privilegeService;

		this.host.addEventListener("player-fullscreen", this.onFullscreen.bind(this));

		this.eventService.addEventListener("event-service-state", this.onEventServiceState.bind(this));
		this.eventService.addEventListener("stream-state", this.onStreamState.bind(this));
		this.eventService.addEventListener("participant-presence", this.onParticipantPresence.bind(this));

		this.janusService.addEventListener("janus-connection-established", this.onJanusConnectionEstablished.bind(this));
		this.janusService.addEventListener("janus-connection-failure", this.onJanusConnectionFailure.bind(this));
		this.janusService.addEventListener("janus-session-error", this.onJanusSessionError.bind(this));
	}

	setPlayerViewController(viewController: PlayerViewController) {
		this.viewController = viewController;

		this.connect();
	}

	private setConnectionState(state: State) {
		if (this.host.state === state) {
			return;
		}

		this.host.state = state;

		if (this.host.state !== State.RECONNECTING) {
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
		course.courseId = state.courseId;
		course.timeStarted = state.timeStarted;
		course.title = state.title;
		course.description = state.description;
		course.userId = state.userId;
		course.userPrivileges = state.userPrivileges;
		course.chatFeature = state.messageFeature;
		course.quizFeature = state.quizFeature;
		course.documentMap = state.documentMap;
		course.activeDocument = state.activeDocument;
		course.mediaState = state.mediaState;
	}

	private connect() {
		participants.clear();
		chatHistory.clear();

		this.getCourseState()
			.then(courseState => {
				this.setCourseState(courseState);

				if (courseState.activeDocument == null) {
					// Update early, if not streaming.
					this.updateCourseState();
				}

				this.getDocuments(courseState.documentMap)
					.then(documents => {
						if (courseState.activeDocument) {
							this.playbackService.initialize(this.viewController.host, documents);

							this.viewController.update();

							this.janusService.setRoomId(this.host.courseId);
							this.janusService.setUserId(courseState.userId);
							this.janusService.connect();

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

		participants.clear();
		chatHistory.clear();
	}

	private setReconnecting() {
		
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

	private getParticipants(): Promise<CourseParticipant[]> {
		return new HttpRequest().get("/course/participants/" + this.host.courseId);
	}

	private getChatHistory(): Promise<MessageServiceHistory> {
		return new HttpRequest().get("/course/chat/history/" + this.host.courseId);
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

	private onEventServiceState(event: CustomEvent) {
		const connected = event.detail.connected;

		if (connected) {
			switch (this.host.state) {
				case State.CONNECTING:
				case State.CONNECTED:
				case State.CONNECTED_FEATURES:
					this.fetchState();
					break;

				case State.RECONNECTING:
					this.reconnect();
					break;
			}
		}
	}

	private fetchState() {
		console.log("fetch state");

		const promises = new Array<Promise<any>>();

		promises.push(this.getParticipants());

		if (course.chatFeature != null) {
			promises.push(this.getChatHistory());
		}

		Promise.all(promises).then(values => {
			participants.participants = values[0];

			if (values.length > 1) {
				chatHistory.history = values[1].messages;
			}
		});
	}

	private onChatState(event: CustomEvent) {
		const state: MessengerState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		course.chatFeature = state.started ? state.feature : null;

		if (state.started) {
			this.fetchState();
		}
		else {
			this.closeAndDeleteModal("ChatModal");

			chatHistory.clear();
		}

		this.updateCourseState();
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;

		if (this.host.courseId !== state.courseId) {
			return;
		}

		if (!state.started) {
			this.closeAndDeleteModal("QuizModal");
		}

		course.quizFeature = state.started ? state.feature : null;

		this.updateCourseState();
	}

	private onRecordingState(event: CustomEvent) {
		const courseId = event.detail.courseId;
		const started = event.detail.started;

		if (this.host.courseId !== courseId) {
			return;
		}

		if (started) {
			this.openModal("RecordedModal");
		}
		else {
			this.closeModal("RecordedModal");
		}
	}

	private onStreamState(event: CustomEvent) {
		const courseId = event.detail.courseId;
		const started = event.detail.started;

		if (this.host.courseId !== courseId) {
			return;
		}

		if (started) {
			this.connect();
		}
		else {
			this.closeAllModals();

			course.activeDocument = null;

			this.updateCourseState();
		}
	}

	private onParticipantPresence(event: CustomEvent) {
		const participant: CourseParticipantPresence = event.detail;

		// React only to events originated from other participants.
		if (participant.userId === course.userId) {
			return;
		}

		if (participant.presence === "CONNECTED") {
			participants.add(participant);
		}
		else if (participant.presence === "DISCONNECTED") {
			participants.remove(participant);
		}
	}

	private updateCourseState() {
		const hasFeatures = course.chatFeature != null || course.quizFeature != null;
		const hasStream = course.activeDocument != null;

		if (hasStream) {
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

	private onJanusSessionError() {
		
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