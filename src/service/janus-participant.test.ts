import { expect } from "@open-wc/testing";

import { JanusStreamType } from "./janus-participant.js";

describe("JanusStreamType", () => {
	describe("enum values", () => {
		it("has audio type", () => {
			expect(JanusStreamType.audio).to.equal("audio");
		});

		it("has video type", () => {
			expect(JanusStreamType.video).to.equal("video");
		});

		it("has screen type", () => {
			expect(JanusStreamType.screen).to.equal("screen");
		});

		it("has data type", () => {
			expect(JanusStreamType.data).to.equal("data");
		});
	});
});

// Note: JanusParticipant is an abstract class that requires Janus instance
// Testing the concrete implementations (JanusPublisher, JanusSubscriber) 
// would require mocking the Janus library and WebRTC connections

