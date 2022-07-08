export interface DeviceSettings {

	audioInput: string;
	audioOutput: string;
	videoInput: string;

}

export enum MediaProfile {

	Classroom = "classroom",
	Home = "home"

}

export class Settings {

	static getMediaProfile(): MediaProfile {
		return localStorage.getItem("media.profile") as MediaProfile;
	}

	static getMicrophoneId(): string {
		return localStorage.getItem("audio.input");
	}

	static setMicrophoneId(deviceId: string): void {
		localStorage.setItem("audio.input", deviceId);
	}

	static clearMicrophoneId() {
		localStorage.removeItem("audio.input");
	}

	static getSpeakerId(): string {
		return localStorage.getItem("audio.output");
	}

	static setSpeakerId(deviceId: string): void {
		localStorage.setItem("audio.output", deviceId);
	}

	static clearSpeakerId() {
		localStorage.removeItem("audio.output");
	}

	static getCameraId(): string {
		return localStorage.getItem("video.input");
	}

	static setCameraId(deviceId: string): void {
		localStorage.setItem("video.input", deviceId);
	}

	static clearCameraId() {
		localStorage.removeItem("video.input");
	}

	static clearDeviceChoice() {
		Settings.clearMicrophoneId();
		Settings.clearSpeakerId();
		Settings.clearCameraId();
	}

	static saveDeviceChoice(devices: DeviceSettings) {
		if (devices.audioInput) {
			if (devices.audioInput === "none") {
				Settings.clearMicrophoneId();
			}
			else {
				Settings.setMicrophoneId(devices.audioInput);
			}
		}
		if (devices.audioOutput) {
			if (devices.audioOutput === "none") {
				Settings.clearSpeakerId();
			}
			else {
				Settings.setSpeakerId(devices.audioOutput);
			}
		}
		if (devices.videoInput) {
			if (devices.videoInput === "none") {
				Settings.clearCameraId();
			}
			else {
				Settings.setCameraId(devices.videoInput);
			}
		}
	}
}