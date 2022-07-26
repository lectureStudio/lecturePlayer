import { CoursePrivilege } from "../model/course-state";

export class PrivilegeService {

	userPrivileges: CoursePrivilege[] = [];


	canReadMessages(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "COURSE_MESSENGER_READ_PRIVILEGE") > -1;
	}

	canWriteMessages(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "COURSE_MESSENGER_WRITE_PRIVILEGE") > -1;
	}

	canWritePrivateMessages(): boolean {
		return this.userPrivileges.findIndex(privilege => privilege.name === "COURSE_MESSENGER_WRITE_DIRECT_PRIVILEGE") > -1;
	}
}