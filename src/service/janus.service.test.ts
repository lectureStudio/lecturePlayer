import { expect } from "@open-wc/testing";

import { JanusService } from "./janus.service.js";
import { EventEmitter } from "../utils/event-emitter.js";

describe("JanusService", () => {
	let janusService: JanusService;
	let eventEmitter: EventEmitter;

	beforeEach(() => {
		eventEmitter = new EventEmitter();
		janusService = new JanusService("wss://test.example.com/janus", eventEmitter);
	});

	describe("constructor", () => {
		it("creates janus service instance", () => {
			expect(janusService).to.exist;
		});

		it("extends TypedEventTarget", () => {
			expect(janusService.addEventListener).to.be.a("function");
			expect(janusService.removeEventListener).to.be.a("function");
			expect(janusService.dispatchEvent).to.be.a("function");
		});
	});

	describe("setUserId", () => {
		it("sets user id", () => {
			// Should not throw
			janusService.setUserId("user-123");
		});
	});

	describe("setRoomId", () => {
		it("sets room id", () => {
			// Should not throw
			janusService.setRoomId(456);
		});
	});

	describe("setConference", () => {
		it("sets conference mode", () => {
			// Should not throw
			janusService.setConference(true);
		});

		it("unsets conference mode", () => {
			// Should not throw
			janusService.setConference(false);
		});
	});

	describe("setReceiveCameraFeed", () => {
		it("sets receive camera feed without subscribers", () => {
			// Should not throw even without subscribers
			janusService.setReceiveCameraFeed(true);
		});

		it("unsets receive camera feed without subscribers", () => {
			// Should not throw even without subscribers
			janusService.setReceiveCameraFeed(false);
		});
	});

	// Note: Most methods require actual Janus WebRTC connection
	// Integration tests with mocked Janus library would be needed
	// for full coverage of connect(), reconnect(), disconnect(), etc.
});

