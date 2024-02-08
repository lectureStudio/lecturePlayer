import { CoursePrivilege } from "../model/course-state";
import { makeAutoObservable } from "mobx";

class PrivilegeStore {

	privileges: CoursePrivilege[] = [];


	constructor() {
		makeAutoObservable(this);
	}

	addPrivilege(privilege: CoursePrivilege) {
		this.privileges = [...this.privileges, privilege];
	}

	removePrivilege(privilege: CoursePrivilege) {
		this.privileges = this.privileges.filter((p) => p.name !== privilege.name);
	}

	setPrivileges(privileges: CoursePrivilege[]) {
		this.privileges = privileges;
	}

	clear() {
		this.privileges = [];
	}

	canUseChat(): boolean {
		return this.canReadMessages() || this.canWriteMessages();
	}

	canWriteMessages(): boolean {
		return this.canWritePrivateMessages() || this.canWriteMessagesToAll() || this.canWriteMessagesToOrganisators();
	}

	canReadMessages(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "CHAT_READ") > -1;
	}

	canWriteMessagesToAll(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "CHAT_WRITE") > -1;
	}

	canWritePrivateMessages(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "CHAT_WRITE_PRIVATELY") > -1;
	}

	canWriteMessagesToOrganisators(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "CHAT_WRITE_TO_ORGANISATOR") > -1;
	}

	canContributeBySpeech(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "SPEECH") > -1;
	}

	canParticipateInQuiz(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "QUIZ_PARTICIPATION") > -1;
	}

	canViewParticipants(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "PARTICIPANTS_VIEW") > -1;
	}

	canShareScreen(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "COURSE_STREAM") > -1;
	}

	canShareDocuments(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "COURSE_STREAM") > -1;
	}

	canBanParticipants(): boolean {
		return this.privileges.findIndex(privilege => privilege.name === "PARTICIPANTS_BAN") > -1;
	}

	reset() {
		this.privileges = [];
	}
}

export const privilegeStore = new PrivilegeStore();
