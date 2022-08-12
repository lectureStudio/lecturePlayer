import { Janus, PluginHandle } from "janus-gateway";
import { JanusPublisher } from "./janus-publisher";
import { JanusSubscriber } from "./janus-subscriber";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { StreamActionProcessor } from "../action/stream-action-processor";

export class JanusService extends EventTarget {

	private readonly serverUrl: string;

	private readonly actionProcessor: StreamActionProcessor;

	private janus: Janus;

	private publishers: JanusPublisher[];

	private subscribers: JanusSubscriber[];

	private roomId: number;

	private opaqueId: string;

	private deviceConstraints: any;


	constructor(serverUrl: string, actionProcessor: StreamActionProcessor) {
		super();

		this.serverUrl = serverUrl;
		this.actionProcessor = actionProcessor;
		this.publishers = [];
		this.subscribers = [];

		this.opaqueId = "user-" + Janus.randomString(42);
	}

	setDeviceConstraints(deviceConstraints: any): void {
		this.deviceConstraints = deviceConstraints;
	}

	setUserId(userId: string) {
		this.opaqueId = userId;
	}

	setRoomId(roomId: number) {
		this.roomId = roomId;
	}

	connect() {
		// Initialize the library (all console debuggers enabled).
		Janus.init({
			// debug: "all",
			callback: () => {
				// Make sure the browser supports WebRTC.
				if (!Janus.isWebrtcSupported()) {
					console.error("No WebRTC support...");
					return;
				}

				this.createSession();
			}
		});
	}

	disconnect() {
		for (const participant of this.publishers) {
			participant.disconnect();
		}
		for (const participant of this.subscribers) {
			participant.disconnect();
		}

		this.publishers.slice(0);
		this.subscribers.slice(0);
	}

	addPeer(peerId: bigint) {
		if (this.publishers.some(pub => pub.getPublisherId() === peerId)) {
			// Do not subscribe to our own publisher.
			return;
		}

		this.attachToPublisher({ id: Number(peerId) }, false);
	}

	startSpeech(speechConstraints: any) {
		const publisher = new JanusPublisher(this.janus, this.roomId, this.opaqueId);
		publisher.setDeviceConstraints(speechConstraints);
		publisher.addEventListener("janus-participant-error", this.onPublisherError.bind(this));
		publisher.addEventListener("janus-participant-state", this.onPublisherState.bind(this));
		publisher.addEventListener("janus-participant-destroyed", this.onPublisherDestroyed.bind(this));
		publisher.connect();
	}

	stopSpeech() {
		this.publishers.forEach(publisher => {
			publisher.disconnect();
		});
	}

	private createSession() {
		this.janus = new Janus({
			server: this.serverUrl,
			destroyOnUnload: true,
			success: () => {
				if (this.janus.getSessionId()) {
					this.attach();
				}
			},
			error: (cause: any) => {
				console.error(cause);
			},
			destroyed: () => {
				Janus.log("Janus destroyed");
			}
		});
	}

	private attach() {
		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: (pluginHandle: PluginHandle) => {
				Janus.log("Plugin attached! (" + pluginHandle.getPlugin() + ", id=" + pluginHandle.getId() + ")");

				this.getParticipants(pluginHandle);
			},
			error: (cause: any) => {
				console.error("Error attaching plugin", cause);
			}
		});
	}

	private getParticipants(pluginHandle: PluginHandle) {
		const list = {
			request: "listparticipants",
			room: this.roomId,
		};

		pluginHandle.send({
			message: list,
			success: (res: any) => {
				const canJoin = res.participants && res.participants.length > 0;

				if (canJoin) {
					for (let i in res.participants) {
						const publisher = res.participants[i];

						this.attachToPublisher(publisher, !publisher.display);
					}
				}
				else {
					Janus.error("Requested feed is not available anymore");
				}

				pluginHandle.detach();
			}
		});
	}

	private onPublisherError(event: CustomEvent) {
		console.error(event.detail.error);

		const publisher: JanusPublisher = event.detail.participant;
	}

	private onPublisherState(event: CustomEvent) {
		const publisher: JanusPublisher = event.detail.participant;
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.publishers.push(publisher);
		}
		else if (state === State.DISCONNECTED) {
			console.log("publisher disconnected");
		}

		document.dispatchEvent(Utils.createEvent("participant-state", event.detail));
	}

	private onPublisherDestroyed(event: CustomEvent) {
		const publisher: JanusPublisher = event.detail.participant;

		this.publishers = this.publishers.filter(pub => pub !== publisher);
	}

	private attachToPublisher(publisher: any, isPrimary: boolean) {
		const subscriber = new JanusSubscriber(this.janus, publisher.id, this.roomId, this.opaqueId);
		subscriber.setDeviceConstraints(this.deviceConstraints);
		subscriber.addEventListener("janus-participant-connection-connected", this.onParticipantConnectionConnected.bind(this));
		subscriber.addEventListener("janus-participant-connection-disconnected", this.onParticipantConnectionDisconnected.bind(this));
		subscriber.addEventListener("janus-participant-connection-failure", this.onParticipantConnectionFailure.bind(this));
		subscriber.addEventListener("janus-participant-error", this.onSubscriberError.bind(this));
		subscriber.addEventListener("janus-participant-state", this.onSubscriberState.bind(this));
		subscriber.addEventListener("janus-participant-destroyed", this.onSubscriberDestroyed.bind(this));
		subscriber.addEventListener("janus-participant-data", this.onSubscriberData.bind(this));
		subscriber.isPrimary = isPrimary;
		subscriber.connect();
	}

	private onParticipantConnectionConnected(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		if (subscriber.isPrimary) {
			this.dispatchEvent(Utils.createEvent("janus-connection-established"));
		}
	}

	private onParticipantConnectionDisconnected(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		if (subscriber.isPrimary) {
			this.dispatchEvent(Utils.createEvent("janus-connection-failure"));
		}
	}

	private onParticipantConnectionFailure(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		if (subscriber.isPrimary) {
			this.dispatchEvent(Utils.createEvent("janus-connection-failure"));
		}
	}

	private onSubscriberError(event: CustomEvent) {
		console.error(event.detail.error);

		const subscriber: JanusSubscriber = event.detail.participant;

		if (subscriber.isPrimary) {
			this.stopSpeech();
		}
	}

	private onSubscriberState(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.subscribers.push(subscriber);
		}
		if (subscriber.isPrimary && state === State.DISCONNECTED) {
			this.stopSpeech();
		}

		document.dispatchEvent(Utils.createEvent("participant-state", event.detail));
	}

	private onSubscriberDestroyed(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		this.subscribers = this.subscribers.filter(sub => sub !== subscriber);

		if (subscriber.isPrimary) {
			this.stopSpeech();
			this.janus.destroy({
				cleanupHandles: false,
				unload: true,
				notifyDestroyed: false
			});
		}
	}

	private onSubscriberData(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		if (subscriber.isPrimary) {
			this.actionProcessor.processData(event.detail.data);
		}
	}
}
