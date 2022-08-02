import { course } from '../model/course';

export class PrivilegeService {

	canReadMessages(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_READ") > -1;
	}

	canWriteMessages(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE") > -1;
	}

	canWritePrivateMessages(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "CHAT_WRITE_PRIVATELY") > -1;
	}

	canContributeBySpeech(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "SPEECH") > -1;
	}

	canParticipateInQuiz(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "QUIZ_PARTICIPATION") > -1;
	}

	canViewParticipants(): boolean {
		return course.userPrivileges.findIndex(privilege => privilege.name === "PARTICIPANTS_VIEW") > -1;
	}
}