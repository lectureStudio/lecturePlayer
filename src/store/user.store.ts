import { makeAutoObservable } from "mobx";
import { ParticipantType } from "../model/course-state";

class UserStore {

	userId: string;

	firstName: string;

	lastName: string;

	participantType: ParticipantType;


	constructor() {
		makeAutoObservable(this);
	}

	setUserId(id: string) {
		this.userId = id;
	}

	setName(firstName: string, lastName: string) {
		this.firstName = firstName;
		this.lastName = lastName;
	}

	setParticipantType(type: ParticipantType) {
		this.participantType = type;
	}
}

export const userStore = new UserStore();