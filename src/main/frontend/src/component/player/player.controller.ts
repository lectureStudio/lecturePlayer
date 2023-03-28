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
import { Toaster } from '../../utils/toaster';
import { LecturePlayer } from './player';
import { course } from '../../model/course';
import { participants } from '../../model/participants';
import { chatHistory } from '../../model/chat-history';
import { ParticipantsModal } from '../participants-modal/participants.modal';
import { VpnModal } from '../vpn-modal/vpn.modal';
import { DocumentService } from '../../service/document.service';
import { RenderController } from '../../render/render-controller';
import { ToolController } from '../../tool/tool-controller';
import { MouseListener } from '../../event/mouse-listener';
import { ContentFocus, setContentFocus } from '../../model/presentation-store';
import { StatsModal } from '../stats-modal/stats.modal';
import { jsPDF } from 'jspdf';
import $documentStore from "../../model/document-store";
import $deviceSettingsStore, { DeviceSettings, setCameraDeviceId, setMicrophoneBlocked, setMicrophoneDeviceId, setSpeakerDeviceId } from "../../model/device-settings-store";

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
		this.eventService.connect();

		this.host.messageService = this.messageService;

		this.host.addEventListener("player-fullscreen", this.onFullscreen.bind(this));
		this.host.addEventListener("player-settings", this.onSettings.bind(this), false);
		this.host.addEventListener("player-stats", this.onStats.bind(this), false);
		this.host.addEventListener("player-hand-action", this.onHandAction.bind(this), false);
		this.host.addEventListener("player-quiz-action", this.onQuizAction.bind(this), false);
		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
		this.host.addEventListener("player-participants-visibility", this.onParticipantsVisibility.bind(this), false);
		this.host.addEventListener("participant-video-play-error", this.onMediaPlayError.bind(this), false);

		this.host.addEventListener("lect-open-new-document", this.onOpenNewDocument.bind(this));
		this.host.addEventListener("lect-open-new-whiteboard", this.onOpenNewWhiteboard.bind(this));
		this.host.addEventListener("lect-select-document", this.onSelectDocument.bind(this));
		this.host.addEventListener("lect-document-prev-page", this.onDocumentPrevPage.bind(this));
		this.host.addEventListener("lect-document-next-page", this.onDocumentNextPage.bind(this));

		this.host.addEventListener("lect-device-change", this.onDeviceChange.bind(this));
		this.host.addEventListener("lect-device-settings", this.onSettings.bind(this));

		document.addEventListener("lect-render-controller-ready", this.onRenderControllerReady.bind(this));

		document.addEventListener("lect-screen-share-not-allowed", () => {
			Toaster.showWarning(t("screenshare.error.not.allowed.title"), t("screenshare.error.not.allowed.message"));
		});
		document.addEventListener("lect-camera-not-allowed", () => {
			Toaster.showWarning(t("camera.error.not.allowed.title"), t("camera.error.not.allowed.message"));
		});
		document.addEventListener("lect-camera-not-readable", () => {
			Toaster.showWarning(t("camera.error.not.readable.title"), t("camera.error.not.readable.message"));
		});

		this.eventService.addEventListener("event-service-state", this.onEventServiceState.bind(this));
		this.eventService.addEventListener("chat-state", this.onChatState.bind(this));
		this.eventService.addEventListener("quiz-state", this.onQuizState.bind(this));
		this.eventService.addEventListener("recording-state", this.onRecordingState.bind(this));
		this.eventService.addEventListener("stream-state", this.onStreamState.bind(this));
		this.eventService.addEventListener("speech-state", this.onSpeechState.bind(this));
		this.eventService.addEventListener("participant-presence", this.onParticipantPresence.bind(this));

		this.janusService.addEventListener("janus-connection-established", this.onJanusConnectionEstablished.bind(this));
		this.janusService.addEventListener("janus-connection-failure", this.onJanusConnectionFailure.bind(this));
	}

	setPlayerViewController(controller: PlayerViewController) {
		this.viewController = controller;

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
		course.conference = state.conference;
		course.recorded = state.recorded;
		course.timeStarted = state.timeStarted;
		course.title = state.title;
		course.description = state.description;
		course.userId = state.userId;
		course.chatFeature = state.messageFeature;
		course.quizFeature = state.quizFeature;
		course.userPrivileges = state.userPrivileges;
		course.documentMap = state.documentMap ?? new Map();
		course.activeDocument = state.activeDocument;
		course.mediaState = state.mediaState;
	}

	private onCourseState(courseState: CourseState) {
		console.log("~ course state", courseState);

		this.setCourseState(courseState);

		return this.courseStateService.getCourseParticipant();
	}

	private onCourseParticipant(courseUser: CourseParticipant) {
		this.janusService.setRoomId(this.host.courseId);
		this.janusService.setUserId(courseUser.userId);
		this.janusService.setUserName(`${courseUser.firstName} ${courseUser.familyName}`);

		return new Promise<void>((resolve) => {
			if (course.conference) {
				navigator.mediaDevices.getUserMedia({
					audio: true
				})
					.then((stream: MediaStream) => {
						// Stream is not needed.
						Devices.stopMediaTracks(stream);

						setMicrophoneBlocked(false);
					})
					.catch(error => {
						setMicrophoneBlocked(true);
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
		return this.janusService.connect(course.conference);
	}

	private onConnected() {
		console.log("~ Janus connected");

		if (course.activeDocument == null && !course.conference) {
			// Update early, if not streaming.
			this.updateCourseState();
			return;
		}
		if (this.isClassroomProfile()) {
			this.updateCourseState();
			return;
		}

		if (course.activeDocument) {
			this.getDocuments(course.documentMap)
				.then(documents => {
					this.playbackService.addDocuments(documents);
					this.playbackService.setActiveDocument(course.activeDocument.documentId, course.activeDocument.activePage.pageNumber);

					this.registerModal("RecordedModal", new RecordedModal(), false, false);

					this.viewController.update();

					if (course.recorded) {
						this.openModal("RecordedModal");
					}
				});
		}

		this.updateCourseState();
	}

	private onConnectionError(cause: any) {
		// If any of the previous executions fail, panic.
		console.error(cause);

		this.setConnectionState(State.DISCONNECTED);

		this.onJanusSessionError();
	}

	private connect() {
		participants.clear();
		chatHistory.clear();

		this.courseStateService.getCourseState(this.host.courseId)
			.then(this.onCourseState.bind(this))
			.then(this.onCourseParticipant.bind(this))
			.then(this.onMediaDevicesHandled.bind(this))
			.then(this.onConnected.bind(this))
			.catch(this.onConnectionError.bind(this));
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

	private getParticipants(): Promise<CourseParticipant[]> {
		return new HttpRequest().get("/course/participants/" + this.host.courseId);
	}

	private getChatHistory(): Promise<MessageServiceHistory> {
		return new HttpRequest().get("/course/chat/history/" + this.host.courseId);
	}

	private onSelectDocument(event: CustomEvent) {
		const docId = BigInt(event.detail.documentId).valueOf();
		const docState = $documentStore.getState().documentStateMap.get(docId);
		const selectedPage = docState.selectedPageNumber;

		if (this.playbackService.setActiveDocument(docId, selectedPage)) {
			this.janusService.sendDocumentSelected(docState.document);
			this.janusService.sendPageSelected(docId, selectedPage);
		}
	}

	private onOpenNewDocument() {
		Utils.openFile({
			description: 'PDF files',
			mimeTypes: ['application/pdf'],
			extensions: ['.pdf']
		})
		.then((file: File) => {
			this.uploadDocument(file);
		})
		.catch(error => {
			console.error(error);
		});
	}

	private onOpenNewWhiteboard() {
		const doc = new jsPDF({
			orientation: "landscape",
			unit: "px",
			format: [720, 480],
			compress: true
		});

		// Create some empty pages.
		for (let i = 1; i < 50; i++) {
			doc.addPage();
		}

		const blob = doc.output("blob");
		const file = new File([blob], "whiteboard.pdf", { type: "application/pdf", lastModified: new Date().valueOf() });

		this.uploadDocument(file);
	}

	private uploadDocument(file: File) {
		let uploadedDoc: CourseStateDocument;

		this.courseStateService.uploadDocument(file)
			.then((stateDoc: CourseStateDocument) => {
				console.log("document state", stateDoc);

				uploadedDoc = stateDoc;

				return Utils.readFile(file);
			})
			.then((fileBuffer: Uint8Array) => {
				return new DocumentService().loadDocument(fileBuffer);
			})
			.then((document: SlideDocument) => {
				document.setDocumentId(uploadedDoc.documentId);
				document.setDocumentName(uploadedDoc.documentName);
				document.setDocumentFile(uploadedDoc.documentFile);

				const selectedPage = 0;

				this.playbackService.addDocument(document);
				this.playbackService.selectDocument(document.getDocumentId());
				this.playbackService.setPageNumber(selectedPage);

				this.janusService.sendDocumentCreated(document);
				this.janusService.sendDocumentSelected(document);
				this.janusService.sendPageSelected(document.getDocumentId(), selectedPage);

				setContentFocus(ContentFocus.Document);
			})
			.catch(error => {
				console.error(error);
			});
	}

	private onDocumentPrevPage() {
		if (this.playbackService.selectPreviousDocumentPage()) {
			const docState = $documentStore.getState().selectedDocumentState;

			this.janusService.sendPageSelected(docState.document.getDocumentId(), docState.selectedPageNumber);
		}
	}

	private onDocumentNextPage() {
		if (this.playbackService.selectNextDocumentPage()) {
			const docState = $documentStore.getState().selectedDocumentState;

			this.janusService.sendPageSelected(docState.document.getDocumentId(), docState.selectedPageNumber);
		}
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

	private onDeviceChange(event: CustomEvent) {
		const deviceConfig: MediaDeviceSetting = event.detail;

		if (deviceConfig.kind === "audioinput") {
			setMicrophoneDeviceId(deviceConfig.deviceId);
		}
		else if (deviceConfig.kind === "audiooutput") {
			setSpeakerDeviceId(deviceConfig.deviceId);
		}
		else if (deviceConfig.kind === "videoinput") {
			setCameraDeviceId(deviceConfig.deviceId);
		}
	}

	private onSettings(event: CustomEvent) {
		const section = event.detail?.type;

		const settingsModal = new SettingsModal();
		settingsModal.janusService = this.janusService;

		if (section) {
			settingsModal.section = section;
		}

		this.registerModal("SettingsModal", settingsModal);
	}

	private onStats() {
		const statsModal = new StatsModal();
		statsModal.janusService = this.janusService;

		this.registerModal("StatsModal", statsModal);
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
		quizModal.courseId = course.courseId;
		quizModal.feature = course.quizFeature;

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

	private onRenderControllerReady(event: CustomEvent) {
		const renderController: RenderController = event.detail;

		const toolController = new ToolController(renderController);
		const mouseListener = new MouseListener(toolController);

		this.playbackService.initialize(renderController);

		renderController.getSlideView().addMouseListener(mouseListener);
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
		if (this.isClassroomProfile()) {
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
		const isClassroom = this.isClassroomProfile();
		const hasFeatures = course.chatFeature != null || course.quizFeature != null;
		const hasStream = course.activeDocument != null || course.conference;

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

	private onJanusSessionError() {
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
		const speechConstraints = $deviceSettingsStore.getState();

		const constraints = {
			audio: {
				deviceId: speechConstraints.microphoneDeviceId ? { exact: speechConstraints.microphoneDeviceId } : undefined
			},
			video: {
				deviceId: speechConstraints.cameraDeviceId ? { exact: speechConstraints.cameraDeviceId } : undefined,
				width: { ideal: 1280 },
				height: { ideal: 720 },
				facingMode: "user"
			}
		};

		navigator.mediaDevices.getUserMedia(constraints)
			.then(stream => {
				this.showSpeechAcceptedModal(stream, speechConstraints, false);
			})
			.catch(error => {
				console.error(error.name);

				speechConstraints.cameraDeviceId = undefined;

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

	private showSpeechAcceptedModal(stream: MediaStream, deviceSettings: DeviceSettings, camBlocked: boolean) {
		if (this.speechRequestId) {
			const speechModal = new SpeechAcceptedModal();
			speechModal.stream = stream;
			speechModal.videoInputBlocked = camBlocked;
			speechModal.addEventListener("speech-accepted-canceled", () => {
				this.cancelSpeech();
			});
			speechModal.addEventListener("speech-accepted-start", () => {
				this.janusService.startSpeech(deviceSettings);
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