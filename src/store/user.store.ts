import { makeAutoObservable } from "mobx";
import { ParticipantType } from "../model/participant";

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

	reset() {
		this.userId = null;
		this.firstName = null;
		this.lastName = null;
		this.participantType = null;
	}
}

export const userStore = new UserStore();