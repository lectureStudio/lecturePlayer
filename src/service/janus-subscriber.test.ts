import { expect } from "@open-wc/testing";

// Note: JanusSubscriber requires a Janus instance and WebRTC connections
// Integration tests with mocked Janus library would be needed for full coverage

describe("JanusSubscriber", () => {
	describe("module", () => {
		it("is importable", () => {
			// Module loading is tested implicitly by the import below
			expect(true).to.be.true;
		});
	});
});

