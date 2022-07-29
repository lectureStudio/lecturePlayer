import { CoursePrivilege } from "../model/course-state";

export class PrivilegeService {

	userPrivileges: CoursePrivilege[] = [];


	canReadMessages(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "CHAT_READ") > -1;
	}

	canWriteMessages(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE") > -1;
	}

	canWritePrivateMessages(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE_PRIVATELY") > -1;
	}

	canContributeBySpeech(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "SPEECH") > -1;
	}

	canParticipateInQuiz(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "QUIZ_PARTICIPATION") > -1;
	}
}