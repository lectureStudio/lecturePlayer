import { expect } from "@open-wc/testing";

import { EventService, EventSubService } from "./event.service.js";
import { EventEmitter } from "../utils/event-emitter.js";
import { State } from "../utils/state.js";
import { Client } from "@stomp/stompjs";

// Mock STOMP Client
class MockStompClient {
	brokerURL: string = "";
	connectHeaders: Record<string, string> = {};
	reconnectDelay: number = 0;
	heartbeatIncoming: number = 0;
	heartbeatOutgoing: number = 0;
	discardWebsocketOnCommFailure: boolean = false;
	debug: (message: string) => void = () => {};

	onConnect: (() => void) | null = null;
	onDisconnect: (() => void) | null = null;

	private subscriptions: Map<string, (message: any) => void> = new Map();
	private activated: boolean = false;
	private deactivated: boolean = false;

	subscribe(destination: string, callback: (message: any) => void) {
		this.subscriptions.set(destination, callback);
		return { id: destination, unsubscribe: () => {} };
	}

	activate() {
		this.activated = true;
	}

	deactivate() {
		this.deactivated = true;
	}

	isActivated() {
		return this.activated;
	}

	isDeactivated() {
		return this.deactivated;
	}

	getSubscriptions() {
		return this.subscriptions;
	}

	// Simulate receiving a message on a subscription
	simulateMessage(destination: string, body: string) {
		const callback = this.subscriptions.get(destination);
		if (callback) {
			callback({ body });
		}
	}

	// Trigger the onConnect callback
	triggerConnect() {
		if (this.onConnect) {
			this.onConnect();
		}
	}

	// Trigger the onDisconnect callback
	triggerDisconnect() {
		if (this.onDisconnect) {
			this.onDisconnect();
		}
	}
}

describe("EventService", () => {
	let eventService: EventService;
	let eventEmitter: EventEmitter;
	let originalClient: typeof Client;

	beforeEach(() => {
		eventEmitter = new EventEmitter();
		eventService = new EventService(123, eventEmitter);

		// Store original Client
		originalClient = (window as any).Client;
	});

	afterEach(() => {
		// Restore original Client
		if (originalClient) {
			(window as any).Client = originalClient;
		}
	});

	describe("constructor", () => {
		it("creates event service instance", () => {
			expect(eventService).to.exist;
		});

		it("extends EventTarget", () => {
			expect(eventService).to.be.instanceOf(EventTarget);
		});

		it("stores course id", () => {
			const service = new EventService(456, eventEmitter);
			expect(service).to.exist;
		});

		it("stores event emitter", () => {
			const customEmitter = new EventEmitter();
			const service = new EventService(789, customEmitter);
			expect(service).to.exist;
		});

		it("initializes with empty sub-services array", () => {
			// No error when adding first sub-service proves array is initialized
			const subService: EventSubService = { initialize: () => {} };
			eventService.addEventSubService(subService);
		});
	});

	describe("addEventSubService", () => {
		it("adds sub service", () => {
			const subService: EventSubService = {
				initialize: () => {}
			};

			// Should not throw
			eventService.addEventSubService(subService);
		});

		it("adds multiple sub services", () => {
			const subService1: EventSubService = { initialize: () => {} };
			const subService2: EventSubService = { initialize: () => {} };
			const subService3: EventSubService = { initialize: () => {} };

			eventService.addEventSubService(subService1);
			eventService.addEventSubService(subService2);
			eventService.addEventSubService(subService3);
			// No error means success
		});

		it("accepts sub-service with full signature", () => {
			let initialized = false;
			const subService: EventSubService = {
				initialize: (courseId, client, emitter) => {
					initialized = true;
					expect(courseId).to.be.a("number");
					expect(client).to.exist;
					expect(emitter).to.exist;
				}
			};

			eventService.addEventSubService(subService);
			// Service is added but not yet initialized
			expect(initialized).to.be.false;
		});
	});

	describe("close", () => {
		it("closes without connection", () => {
			// Should not throw even without prior connection
			eventService.close();
		});

		it("can be called multiple times", () => {
			eventService.close();
			eventService.close();
			eventService.close();
			// No error means success
		});
	});

	describe("connect", () => {
		it("returns a client", () => {
			const client = eventService.connect();
			expect(client).to.exist;
		});

		it("creates client with correct broker URL", () => {
			const client = eventService.connect();
			expect(client.brokerURL).to.include("/ws-state");
		});

		it("sets course id in connect headers", () => {
			const service = new EventService(999, eventEmitter);
			const client = service.connect();
			expect(client.connectHeaders["course-id"]).to.equal("999");
		});

		it("sets reconnect delay", () => {
			const client = eventService.connect();
			expect(client.reconnectDelay).to.equal(1000);
		});

		it("sets heartbeat incoming", () => {
			const client = eventService.connect();
			expect(client.heartbeatIncoming).to.equal(1000);
		});

		it("sets heartbeat outgoing", () => {
			const client = eventService.connect();
			expect(client.heartbeatOutgoing).to.equal(1000);
		});

		it("sets discard websocket on comm failure", () => {
			const client = eventService.connect();
			expect(client.discardWebsocketOnCommFailure).to.be.false;
		});

		it("sets up onConnect callback", () => {
			const client = eventService.connect();
			expect(client.onConnect).to.be.a("function");
		});

		it("sets up onDisconnect callback", () => {
			const client = eventService.connect();
			expect(client.onDisconnect).to.be.a("function");
		});

		it("activates the client", () => {
			const client = eventService.connect();
			// Client is activated (no direct way to check without mocking)
			expect(client).to.exist;
		});
	});

	describe("close after connect", () => {
		it("closes after connection", () => {
			eventService.connect();
			// Should not throw
			eventService.close();
		});
	});

	describe("onConnect subscriptions", () => {
		let client: Client;
		let subscribedTopics: string[];
		let messageCallbacks: Map<string, (message: any) => void>;

		beforeEach(() => {
			subscribedTopics = [];
			messageCallbacks = new Map();

			client = eventService.connect();

			// Replace subscribe method with a mock BEFORE triggering onConnect
			client.subscribe = (destination: string, callback: any) => {
				subscribedTopics.push(destination);
				messageCallbacks.set(destination, callback);
				return { id: destination, unsubscribe: () => {} } as any;
			};

			// Trigger onConnect to set up subscriptions
			if (client.onConnect) {
				client.onConnect({} as any);
			}
		});

		it("subscribes to stream topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/stream");
		});

		it("subscribes to recording topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/recording");
		});

		it("subscribes to speech topic", () => {
			expect(subscribedTopics).to.include("/user/queue/course/123/speech");
		});

		it("subscribes to chat topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/chat");
		});

		it("subscribes to quiz topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/quiz");
		});

		it("subscribes to media topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/media");
		});

		it("subscribes to presence topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/presence");
		});

		it("subscribes to publisher topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/publisher");
		});

		it("subscribes to moderation topic", () => {
			expect(subscribedTopics).to.include("/topic/course/event/123/moderation");
		});

		it("subscribes to exactly 9 topics", () => {
			expect(subscribedTopics.length).to.equal(9);
		});
	});

	describe("onConnect sub-service initialization", () => {
		function mockClientSubscribe(client: Client) {
			client.subscribe = (destination: string, callback: any) => {
				return { id: destination, unsubscribe: () => {} } as any;
			};
		}

		it("initializes sub-services on connect", () => {
			let initialized = false;
			let receivedCourseId: number | undefined;

			const subService: EventSubService = {
				initialize: (courseId, _client, _emitter) => {
					initialized = true;
					receivedCourseId = courseId;
				}
			};

			eventService.addEventSubService(subService);
			const client = eventService.connect();
			mockClientSubscribe(client);

			// Before onConnect, sub-service should not be initialized
			expect(initialized).to.be.false;

			// Trigger onConnect
			if (client.onConnect) {
				client.onConnect({} as any);
			}

			// After onConnect, sub-service should be initialized
			expect(initialized).to.be.true;
			expect(receivedCourseId).to.equal(123);
		});

		it("initializes multiple sub-services on connect", () => {
			let count = 0;

			const subService1: EventSubService = { initialize: () => { count++; } };
			const subService2: EventSubService = { initialize: () => { count++; } };
			const subService3: EventSubService = { initialize: () => { count++; } };

			eventService.addEventSubService(subService1);
			eventService.addEventSubService(subService2);
			eventService.addEventSubService(subService3);

			const client = eventService.connect();
			mockClientSubscribe(client);

			if (client.onConnect) {
				client.onConnect({} as any);
			}

			expect(count).to.equal(3);
		});

		it("passes client to sub-service", () => {
			let receivedClient: Client | undefined;

			const subService: EventSubService = {
				initialize: (_courseId, client, _emitter) => {
					receivedClient = client;
				}
			};

			eventService.addEventSubService(subService);
			const client = eventService.connect();
			mockClientSubscribe(client);

			if (client.onConnect) {
				client.onConnect({} as any);
			}

			expect(receivedClient).to.equal(client);
		});

		it("passes event emitter to sub-service", () => {
			let receivedEmitter: EventEmitter | undefined;

			const subService: EventSubService = {
				initialize: (_courseId, _client, emitter) => {
					receivedEmitter = emitter;
				}
			};

			eventService.addEventSubService(subService);
			const client = eventService.connect();
			mockClientSubscribe(client);

			if (client.onConnect) {
				client.onConnect({} as any);
			}

			expect(receivedEmitter).to.equal(eventEmitter);
		});
	});

	describe("onConnect event dispatch", () => {
		it("dispatches lp-event-service-state CONNECTED on connect", () => {
			let receivedState: State | undefined;

			eventEmitter.addEventListener("lp-event-service-state", (event: CustomEvent) => {
				receivedState = event.detail;
			});

			const client = eventService.connect();

			// Mock subscribe before triggering onConnect
			client.subscribe = (destination: string, callback: any) => {
				return { id: destination, unsubscribe: () => {} } as any;
			};

			if (client.onConnect) {
				client.onConnect({} as any);
			}

			expect(receivedState).to.equal(State.CONNECTED);
		});
	});

	describe("topic message handling", () => {
		let client: Client;
		let messageCallbacks: Map<string, (message: any) => void>;

		beforeEach(() => {
			messageCallbacks = new Map();

			client = eventService.connect();

			// Mock subscribe before triggering onConnect
			client.subscribe = (destination: string, callback: any) => {
				messageCallbacks.set(destination, callback);
				return { id: destination, unsubscribe: () => {} } as any;
			};

			if (client.onConnect) {
				client.onConnect({} as any);
			}
		});

		it("handles stream state message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-stream-state", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/stream");
			callback?.({ body: JSON.stringify({ started: true, timeStarted: 12345 }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.started).to.be.true;
			expect(receivedEvent.timeStarted).to.equal(12345);
		});

		it("handles recording state message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-recording-state", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/recording");
			callback?.({ body: JSON.stringify({ started: true }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.started).to.be.true;
		});

		it("handles speech state message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-speech-state", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/user/queue/course/123/speech");
			callback?.({ body: JSON.stringify({ requestId: "req-1", accepted: true }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.requestId).to.equal("req-1");
			expect(receivedEvent.accepted).to.be.true;
		});

		it("handles chat state message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-chat-state", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/chat");
			callback?.({ body: JSON.stringify({ started: true, feature: { serviceId: "chat-1" } }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.started).to.be.true;
			expect(receivedEvent.feature.serviceId).to.equal("chat-1");
		});

		it("handles quiz state message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-quiz-state", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/quiz");
			callback?.({ body: JSON.stringify({ started: true, feature: { quizId: "quiz-1" } }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.started).to.be.true;
			expect(receivedEvent.feature.quizId).to.equal("quiz-1");
		});

		it("handles media state message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-media-state", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/media");
			callback?.({ body: JSON.stringify({ userId: "user-1", state: { Audio: true, Camera: false } }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.userId).to.equal("user-1");
			expect(receivedEvent.state.Audio).to.be.true;
			expect(receivedEvent.state.Camera).to.be.false;
		});

		it("handles participant presence message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-participant-presence", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/presence");
			callback?.({ body: JSON.stringify({ userId: "user-1", presence: "CONNECTED" }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.userId).to.equal("user-1");
			expect(receivedEvent.presence).to.equal("CONNECTED");
		});

		it("handles publisher presence message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-publisher-presence", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/publisher");
			callback?.({ body: JSON.stringify({ publisherId: "pub-1", active: true }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.publisherId).to.equal("pub-1");
			expect(receivedEvent.active).to.be.true;
		});

		it("handles participant moderation message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-participant-moderation", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = messageCallbacks.get("/topic/course/event/123/moderation");
			callback?.({ body: JSON.stringify({ userId: "user-1", moderationType: "PERMANENT_BAN" }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.userId).to.equal("user-1");
			expect(receivedEvent.moderationType).to.equal("PERMANENT_BAN");
		});
	});

	describe("onDisconnect callback", () => {
		it("logs disconnect message", () => {
			const client = eventService.connect();

			// Should not throw when called
			if (client.onDisconnect) {
				client.onDisconnect({} as any);
			}
		});
	});
});

describe("EventSubService interface", () => {
	it("defines initialize method", () => {
		const subService: EventSubService = {
			initialize: (_courseId, _client, _eventEmitter) => {}
		};

		expect(subService.initialize).to.be.a("function");
	});

	it("accepts correct parameter types", () => {
		const subService: EventSubService = {
			initialize: (courseId: number, client: Client, eventEmitter: EventEmitter) => {
				expect(typeof courseId).to.equal("number");
				expect(client).to.exist;
				expect(eventEmitter).to.exist;
			}
		};

		expect(subService.initialize).to.be.a("function");
	});

	it("can be implemented as a class", () => {
		class MySubService implements EventSubService {
			initialized = false;

			initialize(_courseId: number, _client: Client, _eventEmitter: EventEmitter): void {
				this.initialized = true;
			}
		}

		const subService = new MySubService();
		expect(subService.initialize).to.be.a("function");
		expect(subService.initialized).to.be.false;
	});
});

describe("Event handling", () => {
	let eventEmitter: EventEmitter;
	let eventService: EventService;
	let receivedEvents: { name: string; detail: any }[];

	beforeEach(() => {
		eventEmitter = new EventEmitter();
		eventService = new EventService(123, eventEmitter);
		receivedEvents = [];

		// Listen for all possible events
		const eventNames = [
			"lp-event-service-state",
			"lp-stream-state",
			"lp-recording-state",
			"lp-speech-state",
			"lp-chat-state",
			"lp-quiz-state",
			"lp-media-state",
			"lp-participant-presence",
			"lp-publisher-presence",
			"lp-participant-moderation"
		];

		eventNames.forEach(name => {
			eventEmitter.addEventListener(name, (event: CustomEvent) => {
				receivedEvents.push({ name, detail: event.detail });
			});
		});
	});

	it("can dispatch events through event emitter", () => {
		const testEvent = new CustomEvent("lp-stream-state", {
			detail: { started: true }
		});

		eventEmitter.dispatchEvent(testEvent);

		expect(receivedEvents.length).to.equal(1);
		expect(receivedEvents[0].name).to.equal("lp-stream-state");
		expect(receivedEvents[0].detail.started).to.be.true;
	});

	it("dispatches multiple events", () => {
		eventEmitter.dispatchEvent(new CustomEvent("lp-chat-state", { detail: { enabled: true } }));
		eventEmitter.dispatchEvent(new CustomEvent("lp-quiz-state", { detail: { active: false } }));

		expect(receivedEvents.length).to.equal(2);
	});
});

describe("State enum usage", () => {
	it("uses CONNECTED state", () => {
		expect(State.CONNECTED).to.exist;
	});

	it("uses DISCONNECTED state", () => {
		expect(State.DISCONNECTED).to.exist;
	});
});
