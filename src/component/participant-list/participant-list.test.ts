import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { ParticipantList } from "./participant-list.js";
import "./participant-list.js";

import { participantStore, ParticipantSortProperty } from "../../store/participants.store.js";
import { uiStateStore } from "../../store/ui-state.store.js";
import { SortOrder } from "../../utils/sort.js";

describe("ParticipantList", () => {
	let element: ParticipantList;

	beforeEach(async () => {
		// Reset stores
		participantStore.reset();
		uiStateStore.setParticipantsSortProperty(ParticipantSortProperty.LastName);
		uiStateStore.setParticipantsSortOrder(SortOrder.Ascending);
		element = await fixture(html`<participant-list></participant-list>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("participant-list");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("structure", () => {
		it("renders header element", async () => {
			await elementUpdated(element);
			const header = element.shadowRoot!.querySelector("header");
			expect(header).to.exist;
		});

		it("renders title with participant count", async () => {
			await elementUpdated(element);
			const title = element.shadowRoot!.querySelector(".title");
			expect(title).to.exist;
			expect(title!.textContent).to.include("(0)");
		});

		it("renders control buttons", async () => {
			await elementUpdated(element);
			const controlButtons = element.shadowRoot!.querySelector(".control-buttons");
			expect(controlButtons).to.exist;
		});

		it("renders sort order button", async () => {
			await elementUpdated(element);
			const sortButton = element.shadowRoot!.querySelector("#iconSortAsc");
			expect(sortButton).to.exist;
		});

		it("renders sort dropdown", async () => {
			await elementUpdated(element);
			const dropdown = element.shadowRoot!.querySelector("sl-dropdown");
			expect(dropdown).to.exist;
		});

		it("renders section element", async () => {
			await elementUpdated(element);
			const section = element.shadowRoot!.querySelector("section");
			expect(section).to.exist;
		});

		it("renders participants container", async () => {
			await elementUpdated(element);
			const participantsDiv = element.shadowRoot!.querySelector(".participants");
			expect(participantsDiv).to.exist;
		});

		it("renders participant log", async () => {
			await elementUpdated(element);
			const participantLog = element.shadowRoot!.querySelector(".participant-log");
			expect(participantLog).to.exist;
		});
	});

	describe("sort menu", () => {
		it("renders sort menu with items", async () => {
			await elementUpdated(element);
			const menu = element.shadowRoot!.querySelector("#custom-sort-menu");
			expect(menu).to.exist;
		});

		it("renders first name sort option", async () => {
			await elementUpdated(element);
			const option = element.shadowRoot!.querySelector("sl-menu-item[value='FirstName']");
			expect(option).to.exist;
		});

		it("renders last name sort option", async () => {
			await elementUpdated(element);
			const option = element.shadowRoot!.querySelector("sl-menu-item[value='LastName']");
			expect(option).to.exist;
		});

		it("renders affiliation sort option", async () => {
			await elementUpdated(element);
			const option = element.shadowRoot!.querySelector("sl-menu-item[value='Affiliation']");
			expect(option).to.exist;
		});
	});

	describe("sortProperty state", () => {
		it("defaults to LastName", () => {
			expect(element.sortProperty).to.equal(ParticipantSortProperty.LastName);
		});
	});

	describe("sortConfig state", () => {
		it("initializes with ascending order", () => {
			expect(element.sortConfig.order).to.equal(SortOrder.Ascending);
		});

		it("initializes comparators", () => {
			expect(element.sortConfig.comparators).to.not.be.empty;
		});
	});

	describe("moderation service", () => {
		it("accepts moderation service via property", () => {
			const mockService = { kickUser: () => {} };
			element.moderationService = mockService as any;
			expect(element.moderationService).to.equal(mockService);
		});
	});

	describe("sort order button click", () => {
		it("toggles sort order on click", async () => {
			await elementUpdated(element);

			expect(element.sortConfig.order).to.equal(SortOrder.Ascending);

			const button = element.shadowRoot!.querySelector("#iconSortAsc") as HTMLElement;
			button.click();
			await elementUpdated(element);

			expect(element.sortConfig.order).to.equal(SortOrder.Descending);
		});
	});
});

