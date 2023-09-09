import Janus from "janus-gateway";
import { JanusPublisher } from "./janus-publisher";
import { JanusSubscriber } from "./janus-subscriber";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { DocumentType } from "../model/document.type";
import { StreamDocumentCreatedAction } from "../action/stream.document.created.action";
import { StreamDocumentSelectedAction } from "../action/stream.document.selected.action";
import { StreamPageSelectedAction } from "../action/stream.page.selected.action";
import { StreamAction } from "../action/stream.action";
import { SlideDocument } from "../model/document";
import { participantStore } from "../store/participants.store";
import { userStore } from "../store/user.store";
import { EventEmitter } from "../utils/event-emitter";
import { TypedEventTarget } from "typescript-event-target";
import { LpParticipantConnectionStateEvent, LpParticipantDataEvent, LpParticipantDestroyedEvent, LpParticipantErrorEvent, LpParticipantJoinedEvent, LpParticipantLeftEvent, LpParticipantStateEvent, ParticipantData } from "../event";

export class JanusService extends TypedEventTarget<DocumentEventMap> {

	private readonly statsIntervalMs = 1000;

	private readonly serverUrl: string;

	private readonly eventEmitter: EventEmitter;

	private janus: Janus;

	private myPublisher: JanusPublisher;

	private publishers: JanusPublisher[];

	private subscribers: JanusSubscriber[];

	private roomId: number;

	private opaqueId: string;

	private isConference: boolean;

	private intervalId: number;


	constructor(serverUrl: string, eventEmitter: EventEmitter) {
		super();

		this.serverUrl = serverUrl;
		this.eventEmitter = eventEmitter;
		this.publishers = [];
		this.subscribers = [];

		this.opaqueId = "user-" + Janus.randomString(42);
	}

	setUserId(userId: string) {
		this.opaqueId = userId;
	}

	setRoomId(roomId: number) {
		this.roomId = roomId;
	}

	setConference(isConference: boolean) {
		this.isConference = isConference;
	}

	setReceiveCameraFeed(receive: boolean) {
		for (const participant of this.subscribers) {
			participant.setReceiveCameraFeed(receive);
		}
	}

	connect() {
		return new Promise<void>((resolve, reject) => {
			// Initialize the library (all console debuggers enabled).
			Janus.init({
				// debug: "all",
				callback: () => {
					// Make sure the browser supports WebRTC.
					if (!Janus.isWebrtcSupported()) {
						console.error("No WebRTC support...");
						return;
					}

					this.createSession(resolve, reject);
				}
			});
		});
	}

	reconnect() {
		const connected = this.janus.isConnected();

		console.log("~ called janus reconnect, is connected:", connected);

		// Try to reconnect individual participants.
		for (const participant of this.publishers) {
			connected ? participant.reconnect() : participant.disconnect();
		}
		for (const participant of this.subscribers) {
			connected ? participant.reconnect() : participant.disconnect();
		}

		if (!connected) {
			// Janus session closed/expired. Establish a new connection.
			this.janus.destroy({
				cleanupHandles: true,
				notifyDestroyed: false,
				unload: false,
				success: () => {
					console.log("~ janus destroyed")

					this.connect();
				},
				error: (error: string) => console.error(error)
			});
		}
	}

	disconnect() {
		for (const participant of this.publishers) {
			participant.disconnect();
		}
		for (const participant of this.subscribers) {
			participant.disconnect();
		}

		this.publishers = [];
		this.subscribers = [];
	}

	addPeer(peerId: bigint, displayName: string) {
		if (this.publishers.some(pub => pub.getPublisherId() === peerId)) {
			// Do not subscribe to our own publisher.
			return;
		}

		this.attachToPublisher({
			id: BigInt(peerId),
			display: displayName
		});
	}

	startSpeech(camEnabled: boolean) {
		const publisher = new JanusPublisher(this.janus, this.roomId, this.opaqueId, this.eventEmitter);
		publisher.addEventListener("lp-participant-error", this.onPublisherError.bind(this));
		publisher.addEventListener("lp-participant-state", this.onPublisherState.bind(this));
		publisher.addEventListener("lp-participant-destroyed", this.onPublisherDestroyed.bind(this));
		publisher.setCameraEnabled(camEnabled);
		publisher.connect();
	}

	stopSpeech() {
		this.publishers.forEach(publisher => {
			publisher.disconnect();
		});
	}

	attachAsPublisher() {
		const publisher = new JanusPublisher(this.janus, this.roomId, this.opaqueId, this.eventEmitter);
		publisher.addEventListener("lp-participant-error", this.onPublisherError.bind(this));
		publisher.addEventListener("lp-participant-state", this.onPublisherState.bind(this));
		publisher.addEventListener("lp-participant-destroyed", this.onPublisherDestroyed.bind(this));
		publisher.addEventListener("lp-participant-joined", this.onPublisherJoined.bind(this));
		publisher.addEventListener("lp-participant-left", this.onPublisherLeft.bind(this));
		publisher.connect();

		this.myPublisher = publisher;
	}

	sendDocumentCreated(doc: SlideDocument) {
		if (this.myPublisher) {
			this.sendStreamAction(new StreamDocumentCreatedAction(doc.getDocumentId(), DocumentType.PDF, doc.getDocumentName(), doc.getDocumentFile()));
		}
	}

	sendDocumentSelected(doc: SlideDocument) {
		if (this.myPublisher) {
			this.sendStreamAction(new StreamDocumentSelectedAction(doc.getDocumentId(), DocumentType.PDF, doc.getDocumentName(), doc.getDocumentFile()));
		}
	}

	sendPageSelected(documentId: bigint, pageNumber: number) {
		if (this.myPublisher) {
			this.sendStreamAction(new StreamPageSelectedAction(documentId, pageNumber));
		}
	}

	sendStreamAction(action: StreamAction) {
		if (this.myPublisher) {
			this.myPublisher.sendData(action.toBuffer());
		}
	}

	startStatsCapture() {
		// First round is instant.
		this.getStats();

		this.intervalId = window.setInterval(this.getStats.bind(this), this.statsIntervalMs);
	}

	stopStatsCapture() {
		window.clearInterval(this.intervalId);
	}

	private getStats() {
		for (const participant of this.publishers) {
			participant.getStats();
		}
		for (const participant of this.subscribers) {
			participant.getStats();
		}
	}

	private createSession(resolve: () => void, reject: (reason?: unknown) => void) {
		this.janus = new Janus({
			server: this.serverUrl,
			destroyOnUnload: true,
			success: () => {
				if (this.janus.getSessionId()) {
					this.attach(resolve, reject);
				}
			},
			error: reject,
			destroyed: () => {
				Janus.log("Janus destroyed");
			}
		});
	}

	private attach(resolve: () => void, reject: (reason?: unknown) => void) {
		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: (pluginHandle: PluginHandle) => {
				try {
					if (this.isConference) {
						this.attachAsPublisher();

						// addStreamAction.watch(streamAction => {
						// 	this.sendStreamAction(streamAction);
						// });
					}

					this.getParticipants(pluginHandle);
				}
				catch (cause) {
					reject(cause);
					return;
				}

				resolve();
			},
			error: reject
		});
	}

	private getParticipants(pluginHandle: PluginHandle) {
		const list = {
			request: "listparticipants",
			room: this.roomId,
		};

		pluginHandle.send({
			message: list,
			success: (response: VideoRoomParticipantsResponse) => {
				const canJoin = response.participants && response.participants.length > 0;

				if (canJoin) {
					// console.log("publishers", res.participants);

					for (const i in response.participants) {
						const publisher = response.participants[i];

						if (publisher.publisher) {
							this.attachToPublisher(publisher);
						}
					}
				}
				else {
					Janus.error("Requested feed is not available anymore");
				}

				pluginHandle.detach();
			}
		});
	}

	private onPublisherError(event: LpParticipantErrorEvent) {
		console.error(event.detail.cause);

		// const publisher: JanusPublisher = event.detail.participant;
	}

	private onPublisherState(event: LpParticipantStateEvent) {
		const publisher = event.detail.participant as JanusPublisher;
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.publishers.push(publisher);
		}
		else if (state === State.DISCONNECTED) {
			this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-speech-canceled"));
		}

		if (userStore.userId) {
			participantStore.setParticipantStreamState(userStore.userId, state);
		}
	}

	private onPublisherDestroyed(event: LpParticipantDestroyedEvent) {
		const publisher = event.detail as JanusPublisher;

		this.publishers = this.publishers.filter(pub => pub !== publisher);
	}

	private attachToPublisher(publisher: VideoRoomParticipant) {
		const foundSubscriber = this.subscribers.find(sub => sub.getPublisherId() === publisher.id);

		if (foundSubscriber) {
			// Do not subscribe to already subscribed publisher.
			// Update subscribed streams.
			foundSubscriber.updateStreams(publisher.streams);
			return;
		}

		if (!publisher.id || !publisher.display) {
			throw new Error("Invalid publisher: " + publisher);
		}

		const subscriber = new JanusSubscriber(this.janus, publisher.id, publisher.display, this.roomId, this.opaqueId, this.eventEmitter);
		subscriber.addEventListener("lp-participant-connection-state", this.onParticipantConnectionState.bind(this));
		subscriber.addEventListener("lp-participant-error", this.onSubscriberError.bind(this));
		subscriber.addEventListener("lp-participant-state", this.onSubscriberState.bind(this));
		subscriber.addEventListener("lp-participant-destroyed", this.onSubscriberDestroyed.bind(this));
		subscriber.addEventListener("lp-participant-data", this.onSubscriberData.bind(this));
		subscriber.connect();
	}

	private onParticipantConnectionState(event: LpParticipantConnectionStateEvent) {
		// const subscriber: JanusSubscriber = event.detail.participant;

		this.dispatchEvent(Utils.createEvent("lp-stream-connection-state", event.detail.state));
	}

	private onSubscriberError(event: LpParticipantErrorEvent) {
		console.error(event.detail.cause);

		// const subscriber: JanusSubscriber = event.detail.participant;

		this.stopSpeech();
	}

	private onSubscriberState(event: LpParticipantStateEvent) {
		const subscriber = event.detail.participant as JanusSubscriber;
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.subscribers.push(subscriber);
		}
		if (state === State.DISCONNECTED) {
			// Remove subscriber from registry.
			this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
		}

		participantStore.setParticipantStreamState(subscriber.getPublisherUserId(), state);
	}

	private onSubscriberDestroyed(event: LpParticipantDestroyedEvent) {
		const subscriber = event.detail as JanusSubscriber;

		this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
	}

	private onSubscriberData(event: LpParticipantDataEvent) {
		this.eventEmitter.dispatchEvent(Utils.createEvent<ParticipantData>("lp-participant-data", {
			participant: event.detail.participant,
			data: event.detail.data
		}));
	}

	private onPublisherJoined(event: LpParticipantJoinedEvent) {
		const publisher = event.detail;

		this.attachToPublisher(publisher);
	}

	private onPublisherLeft(event: LpParticipantLeftEvent) {
		const publisher = event.detail;
		const subscriber = this.subscribers.find(sub => sub.getPublisherId() === publisher.id);

		if (subscriber) {
			subscriber.disconnect();
		}
	}
}
