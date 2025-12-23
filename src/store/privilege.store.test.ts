import { expect } from "@open-wc/testing";
import { privilegeStore } from "./privilege.store.js";

describe("PrivilegeStore", () => {
	beforeEach(() => {
		privilegeStore.reset();
	});

	afterEach(() => {
		privilegeStore.reset();
	});

	describe("addPrivilege", () => {
		it("adds a privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			expect(privilegeStore.privileges).to.have.length(1);
			expect(privilegeStore.privileges[0].name).to.equal("CHAT_READ");
		});

		it("adds multiple privileges", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			privilegeStore.addPrivilege({ name: "CHAT_WRITE" });
			expect(privilegeStore.privileges).to.have.length(2);
		});
	});

	describe("removePrivilege", () => {
		it("removes a privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			privilegeStore.addPrivilege({ name: "CHAT_WRITE" });

			privilegeStore.removePrivilege({ name: "CHAT_READ" });

			expect(privilegeStore.privileges).to.have.length(1);
			expect(privilegeStore.privileges[0].name).to.equal("CHAT_WRITE");
		});
	});

	describe("setPrivileges", () => {
		it("replaces all privileges", () => {
			privilegeStore.addPrivilege({ name: "OLD" });

			privilegeStore.setPrivileges([
				{ name: "NEW1" },
				{ name: "NEW2" },
			]);

			expect(privilegeStore.privileges).to.have.length(2);
			expect(privilegeStore.privileges[0].name).to.equal("NEW1");
		});
	});

	describe("clear", () => {
		it("clears all privileges", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			privilegeStore.clear();
			expect(privilegeStore.privileges).to.have.length(0);
		});
	});

	describe("canReadMessages", () => {
		it("returns false without CHAT_READ privilege", () => {
			expect(privilegeStore.canReadMessages()).to.be.false;
		});

		it("returns true with CHAT_READ privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			expect(privilegeStore.canReadMessages()).to.be.true;
		});
	});

	describe("canWriteMessagesToAll", () => {
		it("returns false without CHAT_WRITE privilege", () => {
			expect(privilegeStore.canWriteMessagesToAll()).to.be.false;
		});

		it("returns true with CHAT_WRITE privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_WRITE" });
			expect(privilegeStore.canWriteMessagesToAll()).to.be.true;
		});
	});

	describe("canWritePrivateMessages", () => {
		it("returns false without CHAT_WRITE_PRIVATELY privilege", () => {
			expect(privilegeStore.canWritePrivateMessages()).to.be.false;
		});

		it("returns true with CHAT_WRITE_PRIVATELY privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_WRITE_PRIVATELY" });
			expect(privilegeStore.canWritePrivateMessages()).to.be.true;
		});
	});

	describe("canWriteMessagesToOrganisators", () => {
		it("returns false without privilege", () => {
			expect(privilegeStore.canWriteMessagesToOrganisators()).to.be.false;
		});

		it("returns true with CHAT_WRITE_TO_ORGANISATOR privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_WRITE_TO_ORGANISATOR" });
			expect(privilegeStore.canWriteMessagesToOrganisators()).to.be.true;
		});
	});

	describe("canWriteMessages", () => {
		it("returns false without write privileges", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			expect(privilegeStore.canWriteMessages()).to.be.false;
		});

		it("returns true with CHAT_WRITE privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_WRITE" });
			expect(privilegeStore.canWriteMessages()).to.be.true;
		});

		it("returns true with CHAT_WRITE_PRIVATELY privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_WRITE_PRIVATELY" });
			expect(privilegeStore.canWriteMessages()).to.be.true;
		});

		it("returns true with CHAT_WRITE_TO_ORGANISATOR privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_WRITE_TO_ORGANISATOR" });
			expect(privilegeStore.canWriteMessages()).to.be.true;
		});
	});

	describe("canUseChat", () => {
		it("returns false without any chat privileges", () => {
			expect(privilegeStore.canUseChat()).to.be.false;
		});

		it("returns true with read privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			expect(privilegeStore.canUseChat()).to.be.true;
		});

		it("returns true with write privilege", () => {
			privilegeStore.addPrivilege({ name: "CHAT_WRITE" });
			expect(privilegeStore.canUseChat()).to.be.true;
		});
	});

	describe("canContributeBySpeech", () => {
		it("returns false without SPEECH privilege", () => {
			expect(privilegeStore.canContributeBySpeech()).to.be.false;
		});

		it("returns true with SPEECH privilege", () => {
			privilegeStore.addPrivilege({ name: "SPEECH" });
			expect(privilegeStore.canContributeBySpeech()).to.be.true;
		});
	});

	describe("canParticipateInQuiz", () => {
		it("returns false without privilege", () => {
			expect(privilegeStore.canParticipateInQuiz()).to.be.false;
		});

		it("returns true with QUIZ_PARTICIPATION privilege", () => {
			privilegeStore.addPrivilege({ name: "QUIZ_PARTICIPATION" });
			expect(privilegeStore.canParticipateInQuiz()).to.be.true;
		});
	});

	describe("canViewParticipants", () => {
		it("returns false without privilege", () => {
			expect(privilegeStore.canViewParticipants()).to.be.false;
		});

		it("returns true with PARTICIPANTS_VIEW privilege", () => {
			privilegeStore.addPrivilege({ name: "PARTICIPANTS_VIEW" });
			expect(privilegeStore.canViewParticipants()).to.be.true;
		});
	});

	describe("canShareScreen", () => {
		it("returns false without privilege", () => {
			expect(privilegeStore.canShareScreen()).to.be.false;
		});

		it("returns true with COURSE_STREAM privilege", () => {
			privilegeStore.addPrivilege({ name: "COURSE_STREAM" });
			expect(privilegeStore.canShareScreen()).to.be.true;
		});
	});

	describe("canShareDocuments", () => {
		it("returns false without privilege", () => {
			expect(privilegeStore.canShareDocuments()).to.be.false;
		});

		it("returns true with COURSE_STREAM privilege", () => {
			privilegeStore.addPrivilege({ name: "COURSE_STREAM" });
			expect(privilegeStore.canShareDocuments()).to.be.true;
		});
	});

	describe("canBanParticipants", () => {
		it("returns false without privilege", () => {
			expect(privilegeStore.canBanParticipants()).to.be.false;
		});

		it("returns true with PARTICIPANTS_BAN privilege", () => {
			privilegeStore.addPrivilege({ name: "PARTICIPANTS_BAN" });
			expect(privilegeStore.canBanParticipants()).to.be.true;
		});
	});

	describe("reset", () => {
		it("clears all privileges", () => {
			privilegeStore.addPrivilege({ name: "CHAT_READ" });
			privilegeStore.addPrivilege({ name: "SPEECH" });

			privilegeStore.reset();

			expect(privilegeStore.privileges).to.have.length(0);
		});
	});
});

