import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { ScreenView } from "./screen-view.js";
import "./screen-view.js";

import { CourseParticipant } from "../../model/participant.js";

/**
 * Creates a mock participant
 */
function createMockParticipant(): CourseParticipant {
	return {
		odataType: "participant",
		odataContext: "",
		odataId: "",
		userId: "user-1",
		firstName: "John",
		familyName: "Doe",
		participantType: "PARTICIPANT",
		microphoneActive: false,
		cameraActive: false,
		screenActive: false,
		avatarImageData: undefined,
		microphoneStream: null,
		cameraStream: null,
		screenStream: null
	};
}

describe("ScreenView", () => {
	let element: ScreenView;
	let participant: CourseParticipant;

	beforeEach(async () => {
		participant = createMockParticipant();
		element = await fixture(html`
			<screen-view .participant="${participant}"></screen-view>
		`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("screen-view");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("structure", () => {
		it("renders container element", async () => {
			await elementUpdated(element);
			const container = element.shadowRoot!.querySelector(".container");
			expect(container).to.exist;
		});

		it("renders video element", async () => {
			await elementUpdated(element);
			const video = element.shadowRoot!.querySelector("video");
			expect(video).to.exist;
		});

		it("video has autoplay attribute", async () => {
			await elementUpdated(element);
			const video = element.shadowRoot!.querySelector("video") as HTMLVideoElement;
			expect(video.autoplay).to.be.true;
		});

		it("video has playsInline attribute", async () => {
			await elementUpdated(element);
			const video = element.shadowRoot!.querySelector("video") as HTMLVideoElement;
			// Firefox may not expose playsInline as a property, check attribute instead
			expect(video.hasAttribute("playsinline") || video.playsInline === true).to.be.true;
		});
	});

	describe("hasVideo property", () => {
		it("defaults to false", () => {
			expect(element.hasVideo).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.hasVideo = true;
			await elementUpdated(element);
			expect(element.hasAttribute("hasvideo")).to.be.true;
		});
	});

	describe("participant property", () => {
		it("accepts participant via property", () => {
			expect(element.participant.userId).to.equal("user-1");
		});
	});
});

