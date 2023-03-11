import { Janus, JanusRoomParticipant, PluginHandle } from "janus-gateway";
import { JanusPublisher } from "./janus-publisher";
import { JanusSubscriber } from "./janus-subscriber";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { StreamActionProcessor } from "../action/stream-action-processor";
import { DeviceSettings, Settings } from "../utils/settings";
import { DocumentType } from "../model/document.type";
import { CourseStateDocument } from "../model/course-state-document";
import { StreamDocumentCreatedAction } from "../action/stream.document.created.action";
import { StreamDocumentSelectedAction } from "../action/stream.document.selected.action";

export class JanusService extends EventTarget {

	private readonly statsIntervalMs = 1000;

	private readonly serverUrl: string;

	private readonly actionProcessor: StreamActionProcessor;

	private janus: Janus;

	private myPublisher: JanusPublisher;

	private publishers: JanusPublisher[];

	private subscribers: JanusSubscriber[];

	private roomId: number;

	private opaqueId: string;

	private intervalId: number;

	private userName: string;


	constructor(serverUrl: string, actionProcessor: StreamActionProcessor) {
		super();

		this.serverUrl = serverUrl;
		this.actionProcessor = actionProcessor;
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

	setUserName(userName: string) {
		this.userName = userName;
	}

	connect(isConference: boolean) {
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

					this.createSession(isConference, resolve, reject);
				}
			});
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

		this.attachToPublisher({ id: Number(peerId) });
	}

	startSpeech(deviceSettings: DeviceSettings) {
		const publisher = new JanusPublisher(this.janus, this.roomId, this.opaqueId, this.userName);
		publisher.setDeviceSettings(deviceSettings);
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

	attachAsPublisher() {
		const publisher = new JanusPublisher(this.janus, this.roomId, this.opaqueId, this.userName);
		publisher.setDeviceSettings(Settings.getDeviceSettings());
		publisher.addEventListener("janus-participant-error", this.onPublisherError.bind(this));
		publisher.addEventListener("janus-participant-state", this.onPublisherState.bind(this));
		publisher.addEventListener("janus-participant-destroyed", this.onPublisherDestroyed.bind(this));
		publisher.addEventListener("janus-participant-joined", this.onPublisherJoined.bind(this));
		publisher.addEventListener("janus-participant-left", this.onPublisherLeft.bind(this));
		publisher.connect();

		this.myPublisher = publisher;
	}

	sendDocumentCreated(stateDoc: CourseStateDocument) {
		if (this.myPublisher) {
			const action = new StreamDocumentCreatedAction(stateDoc.documentId, DocumentType.PDF, stateDoc.documentName, stateDoc.documentFile);

			this.myPublisher.sendData(action.toBuffer());
		}
	}

	sendDocumentSelected(stateDoc: CourseStateDocument) {
		if (this.myPublisher) {
			const action = new StreamDocumentSelectedAction(stateDoc.documentId, DocumentType.PDF, stateDoc.documentName, stateDoc.documentFile);

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

	private createSession(isConference: boolean, resolve: () => void, reject: (reason?: any) => void) {
		this.janus = new Janus({
			server: this.serverUrl,
			destroyOnUnload: true,
			success: () => {
				if (this.janus.getSessionId()) {
					this.attach(isConference, resolve, reject);
				}
			},
			error: reject,
			destroyed: () => {
				Janus.log("Janus destroyed");
			}
		});
	}

	private attach(isConference: boolean, resolve: () => void, reject: (reason?: any) => void) {
		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: (pluginHandle: PluginHandle) => {
				try {
					if (isConference) {
						this.attachAsPublisher();
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
			success: (res: any) => {
				const canJoin = res.participants && res.participants.length > 0;

				if (canJoin) {
					for (let i in res.participants) {
						const publisher: JanusRoomParticipant = res.participants[i];
						this.attachToPublisher(publisher);
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
			document.dispatchEvent(Utils.createEvent("speech-canceled"));
		}

		document.dispatchEvent(Utils.createEvent("participant-state", event.detail));
	}

	private onPublisherDestroyed(event: CustomEvent) {
		const publisher: JanusPublisher = event.detail.participant;

		this.publishers = this.publishers.filter(pub => pub !== publisher);
	}

	private attachToPublisher(publisher: JanusRoomParticipant) {
		const foundSubscriber = this.subscribers.find(sub => sub.getPublisherId() === publisher.id);

		if (foundSubscriber) {
			// Do not subscribe to already subscribed publisher.
			// Update subscribed streams.
			foundSubscriber.updateStreams(publisher.streams);
			return;
		}

		const subscriber = new JanusSubscriber(this.janus, publisher.id, publisher.display, this.roomId, this.opaqueId);
		subscriber.setDeviceSettings(Settings.getDeviceSettings());
		subscriber.addEventListener("janus-participant-connection-connected", this.onParticipantConnectionConnected.bind(this));
		subscriber.addEventListener("janus-participant-connection-disconnected", this.onParticipantConnectionDisconnected.bind(this));
		subscriber.addEventListener("janus-participant-connection-failure", this.onParticipantConnectionFailure.bind(this));
		subscriber.addEventListener("janus-participant-error", this.onSubscriberError.bind(this));
		subscriber.addEventListener("janus-participant-state", this.onSubscriberState.bind(this));
		subscriber.addEventListener("janus-participant-destroyed", this.onSubscriberDestroyed.bind(this));
		subscriber.addEventListener("janus-participant-data", this.onSubscriberData.bind(this));
		subscriber.connect();
	}

	private onParticipantConnectionConnected(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		this.dispatchEvent(Utils.createEvent("janus-connection-established"));
	}

	private onParticipantConnectionDisconnected(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		this.dispatchEvent(Utils.createEvent("janus-connection-failure"));
	}

	private onParticipantConnectionFailure(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		this.dispatchEvent(Utils.createEvent("janus-connection-failure"));
	}

	private onSubscriberError(event: CustomEvent) {
		console.error(event.detail.error);

		const subscriber: JanusSubscriber = event.detail.participant;

		this.stopSpeech();
	}

	private onSubscriberState(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.subscribers.push(subscriber);
		}
		if (state === State.DISCONNECTED) {
			// Remove subscriber from registry.
			this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
		}

		document.dispatchEvent(Utils.createEvent("participant-state", event.detail));
	}

	private onSubscriberDestroyed(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
	}

	private onSubscriberData(event: CustomEvent) {
		const subscriber: JanusSubscriber = event.detail.participant;

		this.actionProcessor.processData(event.detail.data);
	}

	private onPublisherJoined(event: CustomEvent) {
		const publisher: JanusRoomParticipant = event.detail;

		this.attachToPublisher(publisher);
	}

	private onPublisherLeft(event: CustomEvent) {
		const publisher: JanusRoomParticipant = event.detail;
		const subscriber = this.subscribers.find(sub => sub.getPublisherId() === publisher.id);

		if (subscriber) {
			subscriber.disconnect();
		}
	}
}
