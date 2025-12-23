import { expect } from "@open-wc/testing";
import { Utils } from "./utils.js";

describe("Utils", () => {
	describe("isFirefox", () => {
		it("returns boolean", () => {
			const result = Utils.isFirefox();
			expect(typeof result).to.equal("boolean");
		});
	});

	describe("createEvent", () => {
		it("creates CustomEvent with type", () => {
			const event = Utils.createEvent("test-event");

			expect(event).to.be.instanceOf(CustomEvent);
			expect(event.type).to.equal("test-event");
		});

		it("creates event with payload in detail", () => {
			const payload = { message: "hello", value: 42 };
			const event = Utils.createEvent("test-event", payload);

			expect(event.detail).to.deep.equal(payload);
		});

		it("creates bubbling event", () => {
			const event = Utils.createEvent("test-event");
			expect(event.bubbles).to.be.true;
		});

		it("creates composed event", () => {
			const event = Utils.createEvent("test-event");
			expect(event.composed).to.be.true;
		});

		it("handles undefined payload", () => {
			const event = Utils.createEvent("test-event");
			// CustomEvent sets detail to null when not provided
			expect(event.detail).to.be.null;
		});

		it("handles null payload", () => {
			const event = Utils.createEvent("test-event", null);
			expect(event.detail).to.be.null;
		});

		it("handles array payload", () => {
			const payload = [1, 2, 3];
			const event = Utils.createEvent("test-event", payload);

			expect(event.detail).to.deep.equal([1, 2, 3]);
		});

		it("handles string payload", () => {
			const event = Utils.createEvent("test-event", "hello");
			expect(event.detail).to.equal("hello");
		});
	});
});

