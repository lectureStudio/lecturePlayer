import { Utils } from "./utils";

export interface DeviceSettings {

	audioInput: string;
	audioInputMuteOnEntry: boolean;
	audioOutput: string;
	videoInput: string;
	videoInputMuteOnEntry: boolean;

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

	static getMicrophoneMuteOnEntry(): boolean {
		return localStorage.getItem("audio.input.entry.mute") === "true";
	}

	static setMicrophoneMuteOnEntry(mute: boolean): void {
		localStorage.setItem("audio.input.entry.mute", JSON.stringify(mute));
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

	static getCameraMuteOnEntry(): boolean {
		return localStorage.getItem("video.input.entry.mute") === "true";
	}

	static setCameraMuteOnEntry(mute: boolean): void {
		localStorage.setItem("video.input.entry.mute", JSON.stringify(mute));
	}

	static clearCameraId() {
		localStorage.removeItem("video.input");
	}

	static clearDeviceChoice() {
		Settings.clearMicrophoneId();
		Settings.clearSpeakerId();
		Settings.clearCameraId();
	}

	static getDeviceSettings(): DeviceSettings {
		return {
			audioInput: this.getMicrophoneId(),
			audioInputMuteOnEntry: this.getMicrophoneMuteOnEntry(),
			audioOutput: this.getSpeakerId(),
			videoInput: this.getCameraId(),
			videoInputMuteOnEntry: this.getCameraMuteOnEntry()
		};
	}

	static saveDeviceChoice(devices: DeviceSettings) {
		Settings.setCameraMuteOnEntry(devices.videoInputMuteOnEntry ? true : false);
		Settings.setMicrophoneMuteOnEntry(devices.audioInputMuteOnEntry ? true : false);

		if (devices.audioInput) {
			if (devices.audioInput === "none") {
				Settings.clearMicrophoneId();
			}
			else {
				Settings.setMicrophoneId(devices.audioInput);
			}

			document.dispatchEvent(Utils.createEvent("microphone-setting-changed"));
		}
		if (devices.audioOutput) {
			if (devices.audioOutput === "none") {
				Settings.clearSpeakerId();
			}
			else {
				Settings.setSpeakerId(devices.audioOutput);
			}

			document.dispatchEvent(Utils.createEvent("speaker-setting-changed"));
		}
		if (devices.videoInput) {
			if (devices.videoInput === "none") {
				Settings.clearCameraId();
			}
			else {
				Settings.setCameraId(devices.videoInput);
			}

			document.dispatchEvent(Utils.createEvent("camera-setting-changed"));
		}
	}
}