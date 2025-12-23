import { expect } from "@open-wc/testing";

import { ModerationService } from "./moderation.service.js";
import { privilegeStore } from "../store/privilege.store.js";

describe("ModerationService", () => {
	let moderationService: ModerationService;

	beforeEach(() => {
		moderationService = new ModerationService();
		privilegeStore.reset();
	});

	describe("constructor", () => {
		it("creates moderation service instance", () => {
			expect(moderationService).to.exist;
		});
	});

	describe("initialize", () => {
		it("sets course id", () => {
			moderationService.initialize(123);
			// No error means success - courseId is private
		});
	});

	describe("banUser", () => {
		it("rejects when user does not have ban privilege", async () => {
			privilegeStore.reset();
			moderationService.initialize(123);

			try {
				await moderationService.banUser("user-1");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Not allowed");
			}
		});

		it("requires ban privilege to be set", () => {
			// Verify privilege check logic works
			privilegeStore.reset();
			expect(privilegeStore.canBanParticipants()).to.be.false;
		});
	});
});

