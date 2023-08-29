import { JanusService } from "../../service/janus.service";
import { courseStore } from "../../store/course.store";
import { uiStateStore } from "../../store/ui-state.store";
import { userStore } from "../../store/user.store";
import { HttpRequest } from "../../utils/http-request";
import { State } from "../../utils/state";
import { Utils } from "../../utils/utils";
import { VpnModal } from "../vpn-modal/vpn.modal";
import { ApplicationContext } from "./context";
import { Controller } from "./controller";
import { RootController } from "./root.controller";

export class StreamController extends Controller {

	private readonly janusService: JanusService;


	constructor(rootController: RootController, context: ApplicationContext) {
		super(rootController, context);

		this.janusService = new JanusService(`https://${window.location.hostname}:8089/janus`, this.context.eventEmitter);
		this.janusService.addEventListener("janus-connection-established", this.onJanusConnectionEstablished.bind(this));
		this.janusService.addEventListener("janus-connection-failure", this.onJanusConnectionFailure.bind(this));
		this.janusService.addEventListener("janus-session-error", this.onJanusSessionError.bind(this));

		this.eventEmitter.addEventListener("stream-stats-start", this.startStatsCapture.bind(this));
		this.eventEmitter.addEventListener("stream-stats-stop", this.stopStatsCapture.bind(this));
		this.eventEmitter.addEventListener("stream-receive-camera-feed", this.onReceiveCameraFeed.bind(this));
	}

	startSpeech(withCamera: boolean) {
		this.janusService.startSpeech(!withCamera);
	}

	stopSpeech() {
		this.janusService.stopSpeech();
	}

	connect() {
		this.janusService.setRoomId(courseStore.courseId);
		this.janusService.setUserId(userStore.userId);

		return this.janusService.connect();
	}

	reconnect() {
		this.janusService.reconnect();
	}

	disconnect() {
		this.janusService.disconnect();
	}

	testConnection() {
		return new HttpRequest({ timeout: 0 })
			.post<void>(`https://${window.location.hostname}:8089/janus`, { "janus": "keepalive" });
	}

	onPeerConnected(peerId: bigint, displayName: string) {
		this.janusService.addPeer(peerId, displayName);
	}

	private onJanusConnectionEstablished() {
		console.log("* on janus connected");

		this.setStreamState(State.CONNECTED);
	}

	private onJanusConnectionFailure() {
		this.setStreamState(State.DISCONNECTED);
	}

	private onJanusSessionError() {
		this.setStreamState(State.DISCONNECTED);

		const vpnModal = new VpnModal();

		this.modalController.registerModal("VpnModal", vpnModal);
	}

	private onReceiveCameraFeed() {
		// Toggle state.
		uiStateStore.setReceiveCameraFeed(!uiStateStore.receiveCameraFeed);

		this.janusService.setReceiveCameraFeed(uiStateStore.receiveCameraFeed);
	}

	private startStatsCapture() {
		this.janusService.startStatsCapture();
	}

	private stopStatsCapture() {
		this.janusService.stopStatsCapture();
	}

	private setStreamState(state: State) {
		uiStateStore.setStreamState(state);

		this.eventEmitter.dispatchEvent(Utils.createEvent("stream-connection-state", state));
	}
}