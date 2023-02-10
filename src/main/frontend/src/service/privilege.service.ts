import { course } from '../model/course';

export class PrivilegeService {

	canUseChat(): boolean {
		return this.canReadMessages() || this.canWriteMessages();
	}

	canWriteMessages(): boolean {
		return this.canWritePrivateMessages() || this.canWriteMessagesToAll() || this.canWriteMessagesToOrganisators();
	}

	canReadMessages(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_READ") > -1;
	}

	canWriteMessagesToAll(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE") > -1;
	}

	canWritePrivateMessages(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE_PRIVATELY") > -1;
	}

	canWriteMessagesToOrganisators(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE_TO_ORGANISATOR") > -1;
	}

	canContributeBySpeech(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "SPEECH") > -1;
	}

	canParticipateInQuiz(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "QUIZ_PARTICIPATION") > -1;
	}

	canViewParticipants(): boolean {
		//return course.userPrivileges.findIndex(privilege => privilege.name === "PARTICIPANTS_VIEW") > -1;
		return true;
	}
}