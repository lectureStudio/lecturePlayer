import { makeAutoObservable } from "mobx";

class UserStore {

	userId: string;


	constructor() {
		makeAutoObservable(this);
	}
}

export const userStore = new UserStore();