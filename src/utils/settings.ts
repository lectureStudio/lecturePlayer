export enum MediaProfile {

	Classroom = "classroom",
	Home = "home"

}

export class Settings {

	static getMediaProfile(): MediaProfile {
		return localStorage.getItem("media.profile") as MediaProfile;
	}

}