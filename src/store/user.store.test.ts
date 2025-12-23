import { expect } from "@open-wc/testing";
import { userStore } from "./user.store.js";

describe("UserStore", () => {
	beforeEach(() => {
		userStore.reset();
	});

	afterEach(() => {
		userStore.reset();
	});

	describe("setUserId", () => {
		it("sets user ID", () => {
			userStore.setUserId("user-123");
			expect(userStore.userId).to.equal("user-123");
		});
	});

	describe("setName", () => {
		it("sets first and last name", () => {
			userStore.setName("John", "Doe");

			expect(userStore.firstName).to.equal("John");
			expect(userStore.lastName).to.equal("Doe");
		});
	});

	describe("setParticipantType", () => {
		it("sets participant type", () => {
			userStore.setParticipantType("ORGANIZER" as any);
			expect(userStore.participantType).to.equal("ORGANIZER");
		});
	});

	describe("reset", () => {
		it("resets all fields to null", () => {
			userStore.setUserId("user-123");
			userStore.setName("John", "Doe");
			userStore.setParticipantType("PARTICIPANT" as any);

			userStore.reset();

			expect(userStore.userId).to.be.null;
			expect(userStore.firstName).to.be.null;
			expect(userStore.lastName).to.be.null;
			expect(userStore.participantType).to.be.null;
		});
	});
});

