import { course } from '../model/course';

export class PrivilegeService {

	static canUseChat(): boolean {
		return this.canReadMessages() || this.canWriteMessages();
	}

	static canWriteMessages(): boolean {
		return this.canWritePrivateMessages() || this.canWriteMessagesToAll() || this.canWriteMessagesToOrganisators();
	}

	static canReadMessages(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_READ") > -1;
	}

	static canWriteMessagesToAll(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE") > -1;
	}

	static canWritePrivateMessages(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE_PRIVATELY") > -1;
	}

	static canWriteMessagesToOrganisators(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE_TO_ORGANISATOR") > -1;
	}

	static canContributeBySpeech(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "SPEECH") > -1;
	}

	static canParticipateInQuiz(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "QUIZ_PARTICIPATION") > -1;
	}

	static canViewParticipants(): boolean {
		//return course.userPrivileges.findIndex(privilege => privilege.name === "PARTICIPANTS_VIEW") > -1;
		return true;
	}

	static canShareScreen(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "COURSE_STREAM") > -1;
	}

	static canShareDocuments(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "COURSE_STREAM") > -1;
	}
}