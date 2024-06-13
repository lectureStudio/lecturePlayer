import { CourseContext } from "../context/course.context";
import { LpStreamCaptureStatsEvent, LpStreamConnectionStateEvent } from "../event";
import { LpPublisherPresenceEvent } from "../event/lp-publisher-presence.event";
import { JanusService } from "../service/janus.service";
import { courseStore } from "../store/course.store";
import { participantStore } from "../store/participants.store";
import { uiStateStore } from "../store/ui-state.store";
import { userStore } from "../store/user.store";
import { EventEmitter } from "../utils/event-emitter";
import { HttpRequest } from "../utils/http-request";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { Controller } from "./controller";

export class StreamController extends Controller {

	private readonly janusEndpoint = `https://${window.location.hostname}:8089/janus`;

	private readonly janusService: JanusService;


	constructor(context: CourseContext) {
		super(context.applicationContext);

		this.janusService = new JanusService(this.janusEndpoint, this.applicationContext.eventEmitter);
		this.janusService.addEventListener("lp-stream-connection-state", this.onStreamConnectionState.bind(this));
	}

	protected override initializeEvents(eventEmitter: EventEmitter) {
		eventEmitter.addEventListener("lp-stream-capture-stats", this.onCaptureStats.bind(this));
		eventEmitter.addEventListener("lp-receive-camera-feed", this.onReceiveCameraFeed.bind(this));
		eventEmitter.addEventListener("lp-publisher-presence", this.onPublisherPresence.bind(this));
	}

	public override dispose() {
		super.dispose();

		this.disconnect();
	}

	startSpeech(withCamera: boolean) {
		this.janusService.startSpeech(withCamera);
	}

	stopSpeech() {
		this.janusService.stopSpeech();
	}

	connect() {
		if (!courseStore.activeCourse) {
			throw new Error("Course is not set");
		}
		if (!userStore.userId) {
			throw new Error("User id is not set");
		}

		this.janusService.setRoomId(courseStore.activeCourse.id);
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
			.post<void, {}>(this.janusEndpoint, { "janus": "keepalive" });
	}

	onPeerConnected(peerId: bigint, displayName: string) {
		this.janusService.addPeer(peerId, displayName);
	}

	private onStreamConnectionState(event: LpStreamConnectionStateEvent) {
		const state = event.detail;

		switch (state) {
			case "connected":
				this.setStreamState(State.CONNECTED);
				break;
			case "disconnected":
			case "failed":
				this.setStreamState(State.DISCONNECTED);
				break;
		}
	}

	private onReceiveCameraFeed() {
		// Toggle state.
		uiStateStore.setReceiveCameraFeed(!uiStateStore.receiveCameraFeed);

		this.janusService.setReceiveCameraFeed(uiStateStore.receiveCameraFeed);
	}

	private onPublisherPresence(event: LpPublisherPresenceEvent) {
		if (event.detail.presence === "DISCONNECTED") {
			participantStore.setParticipantStreamState(event.detail.userId, State.DISCONNECTED);
		}
	}

	private onCaptureStats(event: LpStreamCaptureStatsEvent) {
		const capture = event.detail;

		if (capture) {
			this.janusService.startStatsCapture();
		}
		else {
			this.janusService.stopStatsCapture();
		}
	}

	private setStreamState(state: State) {
		uiStateStore.setStreamState(state);

		this.applicationContext.eventEmitter.dispatchEvent(Utils.createEvent("lp-stream-connection-state", state));
	}
}
