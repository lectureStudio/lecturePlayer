import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";
import { runInAction } from "mobx";

import type { ParticipantView } from "./participant-view.js";
import "./participant-view.js";

import { CourseParticipant } from "../../model/participant.js";

/**
 * Creates a mock participant
 */
function createMockParticipant(overrides: Partial<CourseParticipant> = {}): CourseParticipant {
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
		screenStream: null,
		...overrides
	};
}

describe("ParticipantView", () => {
	let element: ParticipantView;
	let participant: CourseParticipant;

	beforeEach(async () => {
		participant = createMockParticipant();
		element = await fixture(html`
			<participant-view .participant="${participant}"></participant-view>
		`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("participant-view");
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

		it("renders participant name", async () => {
			runInAction(() => {
				participant.firstName = "Jane";
				participant.familyName = "Smith";
				element.participant = participant;
			});
			await elementUpdated(element);

			const nameSpan = element.shadowRoot!.querySelector(".name");
			expect(nameSpan).to.exist;
			expect(nameSpan!.textContent).to.include("Jane");
			expect(nameSpan!.textContent).to.include("Smith");
		});

		it("renders controls container", async () => {
			await elementUpdated(element);
			const controls = element.shadowRoot!.querySelector(".controls");
			expect(controls).to.exist;
		});

		it("renders audio element", async () => {
			await elementUpdated(element);
			const audio = element.shadowRoot!.querySelector("audio");
			expect(audio).to.exist;
			expect(audio!.autoplay).to.be.true;
		});

		it("renders video element", async () => {
			await elementUpdated(element);
			const video = element.shadowRoot!.querySelector("video");
			expect(video).to.exist;
			expect(video!.autoplay).to.be.true;
		});

		it("renders microphone icon", async () => {
			await elementUpdated(element);
			const micIcon = element.shadowRoot!.querySelector("sl-icon#mic-remote");
			expect(micIcon).to.exist;
		});
	});

	describe("micActive property", () => {
		it("defaults to false", () => {
			expect(element.micActive).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			runInAction(() => {
				element.participant.microphoneActive = true;
			});
			element.requestUpdate();
			await elementUpdated(element);
			expect(element.hasAttribute("micactive")).to.be.true;
		});

		it("updates from participant microphoneActive", async () => {
			runInAction(() => {
				participant.microphoneActive = true;
				element.participant = participant;
			});
			element.requestUpdate();
			await elementUpdated(element);
			expect(element.micActive).to.be.true;
		});
	});

	describe("camActive property", () => {
		it("defaults to false", () => {
			expect(element.camActive).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			runInAction(() => {
				element.participant.cameraActive = true;
			});
			element.requestUpdate();
			await elementUpdated(element);
			expect(element.hasAttribute("camactive")).to.be.true;
		});
	});

	describe("isVisible property", () => {
		it("defaults to true", () => {
			expect(element.isVisible).to.be.true;
		});

		it("reflects to attribute", () => {
			expect(element.hasAttribute("isvisible")).to.be.true;
		});
	});

	describe("isTalking property", () => {
		it("defaults to false", () => {
			expect(element.isTalking).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.isTalking = true;
			await elementUpdated(element);
			expect(element.hasAttribute("istalking")).to.be.true;
		});
	});

	describe("isConference property", () => {
		it("defaults to false", () => {
			expect(element.isConference).to.be.false;
		});
	});

	describe("isLocal property", () => {
		it("defaults to false", () => {
			expect(element.isLocal).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.isLocal = true;
			await elementUpdated(element);
			expect(element.hasAttribute("islocal")).to.be.true;
		});
	});

	describe("microphone icon", () => {
		it("shows muted icon when microphone inactive", async () => {
			runInAction(() => {
				participant.microphoneActive = false;
				element.participant = participant;
			});
			element.requestUpdate();
			await elementUpdated(element);

			const icon = element.shadowRoot!.querySelector("sl-icon#mic-remote") as any;
			expect(icon.name).to.equal("microphone-mute");
		});

		it("shows active icon when microphone active", async () => {
			runInAction(() => {
				participant.microphoneActive = true;
				element.participant = participant;
			});
			element.requestUpdate();
			await elementUpdated(element);

			const icon = element.shadowRoot!.querySelector("sl-icon#mic-remote") as any;
			expect(icon.name).to.equal("microphone");
		});
	});
});

