import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { PlayerControls } from "./player-controls.js";
import "./player-controls.js";

import { EventEmitter } from "../../utils/event-emitter.js";
import { privilegeStore } from "../../store/privilege.store.js";
import { featureStore } from "../../store/feature.store.js";

describe("PlayerControls", () => {
	let element: PlayerControls;
	let eventEmitter: EventEmitter;

	beforeEach(async () => {
		eventEmitter = new EventEmitter();
		// Reset stores
		privilegeStore.reset();
		featureStore.reset();
		element = await fixture(html`
			<player-controls .eventEmitter="${eventEmitter}"></player-controls>
		`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("player-controls");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("navigation columns", () => {
		it("renders nav-left column", async () => {
			await elementUpdated(element);
			const navLeft = element.shadowRoot!.querySelector(".nav-left");
			expect(navLeft).to.exist;
		});

		it("renders nav-center column", async () => {
			await elementUpdated(element);
			const navCenter = element.shadowRoot!.querySelector(".nav-center");
			expect(navCenter).to.exist;
		});

		it("renders nav-right column", async () => {
			await elementUpdated(element);
			const navRight = element.shadowRoot!.querySelector(".nav-right");
			expect(navRight).to.exist;
		});
	});

	describe("duration property", () => {
		it("defaults to undefined", () => {
			expect(element.duration).to.be.undefined;
		});

		it("displays formatted duration when set", async () => {
			element.duration = 3661000;
			await elementUpdated(element);

			const durationSpan = element.shadowRoot!.querySelector(".course-duration");
			expect(durationSpan).to.exist;
			// 3661000ms = 1:01:01
			expect(durationSpan!.textContent).to.equal("1:01:01");
		});

		it("displays empty string when duration is not set", async () => {
			await elementUpdated(element);
			const durationSpan = element.shadowRoot!.querySelector(".course-duration");
			expect(durationSpan!.textContent).to.equal("");
		});
	});

	describe("hasChat property", () => {
		it("defaults to false", () => {
			expect(element.hasChat).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.hasChat = true;
			await elementUpdated(element);
			expect(element.hasAttribute("haschat")).to.be.true;
		});
	});

	describe("hasQuiz property", () => {
		it("defaults to false", () => {
			expect(element.hasQuiz).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.hasQuiz = true;
			await elementUpdated(element);
			expect(element.hasAttribute("hasquiz")).to.be.true;
		});
	});

	describe("hasParticipants property", () => {
		it("defaults to false", () => {
			expect(element.hasParticipants).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.hasParticipants = true;
			await elementUpdated(element);
			expect(element.hasAttribute("hasparticipants")).to.be.true;
		});
	});

	describe("fullscreen property", () => {
		it("defaults to false", () => {
			expect(element.fullscreen).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.fullscreen = true;
			await elementUpdated(element);
			expect(element.hasAttribute("fullscreen")).to.be.true;
		});
	});

	describe("handUp property", () => {
		it("defaults to false", () => {
			expect(element.handUp).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.handUp = true;
			await elementUpdated(element);
			expect(element.hasAttribute("handup")).to.be.true;
		});
	});

	describe("chatVisible property", () => {
		it("defaults to false", () => {
			expect(element.chatVisible).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.chatVisible = true;
			await elementUpdated(element);
			expect(element.hasAttribute("chatvisible")).to.be.true;
		});
	});

	describe("participantsVisible property", () => {
		it("defaults to false", () => {
			expect(element.participantsVisible).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.participantsVisible = true;
			await elementUpdated(element);
			expect(element.hasAttribute("participantsvisible")).to.be.true;
		});
	});

	describe("settings button", () => {
		it("renders settings button", async () => {
			await elementUpdated(element);
			const settingsButton = element.shadowRoot!.querySelector("settings-button");
			expect(settingsButton).to.exist;
		});

		it("passes eventEmitter to settings button", async () => {
			await elementUpdated(element);
			const settingsButton = element.shadowRoot!.querySelector("settings-button") as any;
			expect(settingsButton.eventEmitter).to.equal(eventEmitter);
		});
	});

	describe("event emitter", () => {
		it("accepts event emitter via property", () => {
			expect(element.eventEmitter).to.equal(eventEmitter);
		});
	});

	describe("speech canceled event", () => {
		it("resets handUp when speech is canceled", async () => {
			element.handUp = true;
			await elementUpdated(element);

			expect(element.handUp).to.be.true;

			eventEmitter.dispatchEvent(new CustomEvent("lp-speech-canceled"));
			await elementUpdated(element);

			expect(element.handUp).to.be.false;
		});
	});
});

