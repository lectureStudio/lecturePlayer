import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { JanusPublisher } from "./janus-publisher";
import { JanusSubscriber } from "./janus-subscriber";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";

export class JanusService extends EventTarget {

	private readonly serverUrl: string;

	private janus: Janus;

	private publishers: JanusPublisher[];

	private subscribers: JanusSubscriber[];

	private myroom: number;

	private opaqueId: string;

	private deviceConstraints: any;

	private dataCallback: (data: ArrayBuffer | Blob) => void;

	private errorCallback: (data: any) => void;


	constructor(serverUrl: string) {
		super();

		this.serverUrl = serverUrl;
		this.janus = null;
		this.dataCallback = null;
		this.publishers = [];
		this.subscribers = [];

		this.opaqueId = "course-" + Janus.randomString(12);
	}

	setDeviceConstraints(deviceConstraints: any): void {
		this.deviceConstraints = deviceConstraints;
	}

	setUserId(userId: string) {
		this.opaqueId = userId;
	}

	setRoomId(roomId: number) {
		this.myroom = roomId;
	}

	setOnData(consumer: (data: ArrayBuffer | Blob) => void) {
		Utils.checkFunction(consumer);

		this.dataCallback = consumer;
	}

	setOnError(consumer: (data: any) => void) {
		Utils.checkFunction(consumer);

		this.errorCallback = consumer;
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

	addPeer(peerId: BigInt) {
		if (this.publishers.some(pub => pub.getPublisherId() === peerId)) {
			// Do not subscribe to our own publisher.
			return;
		}

		this.attachToPublisher({ id: peerId }, false);
	}

	startSpeech(speechConstraints: any) {
		const publisher = new JanusPublisher(this.janus, this.myroom, this.opaqueId);
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
			success: () => {
				this.attach();
			},
			error: (cause: any) => {
				Janus.error(cause);

				if (this.errorCallback) {
					this.errorCallback(cause);
				}
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
			onmessage: (message: any, jsep?: JSEP) => {
				console.log("init handler", message);
			},
			error: (cause: any) => {
				console.error("  -- Error attaching plugin...", cause);
			},
			ondetached: () => {
				console.log("detached main...");
			}
		});
	}

	private getParticipants(pluginHandle: PluginHandle) {
		const list = {
			request: "listparticipants",
			room: this.myroom,
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
		const subscriber = new JanusSubscriber(this.janus, publisher.id, this.myroom, this.opaqueId);
		subscriber.setDeviceConstraints(this.deviceConstraints);
		subscriber.addEventListener("janus-participant-error", this.onSubscriberError.bind(this));
		subscriber.addEventListener("janus-participant-state", this.onSubscriberState.bind(this));
		subscriber.addEventListener("janus-participant-destroyed", this.onSubscriberDestroyed.bind(this));
		subscriber.addEventListener("janus-participant-data", this.onSubscriberData.bind(this));
		subscriber.isPrimary = isPrimary;
		subscriber.connect();
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
				cleanupHandles: true,
				unload: false,
			});
		}
	}

	private onSubscriberData(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		if (subscriber.isPrimary) {
			this.dataCallback(event.detail.data);
		}
	}
}
