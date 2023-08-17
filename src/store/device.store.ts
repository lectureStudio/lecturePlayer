import { makeAutoObservable } from "mobx";

class DeviceStore {

	canSelectSpeaker: boolean;
	canSetSpeakerVolume: boolean;

	microphoneDeviceId: string;
	microphoneMuteOnEntry: boolean;
	microphoneBlocked: boolean;

	speakerDeviceId: string;
	speakerVolume: number = 1.0;

	cameraDeviceId: string;
	cameraMuteOnEntry: boolean;
	cameraBlocked: boolean;


	constructor() {
		makeAutoObservable(this, {
			canSelectSpeaker: false,
			canSetSpeakerVolume: false
		});

		this.loadDeviceSettings();
	}

	persistDeviceSettings() {
		localStorage.setItem("device.store", JSON.stringify(this));
	}

	loadDeviceSettings() {
		const json = localStorage.getItem("device.store");

		if (json) {
			Object.assign(this, JSON.parse(json));
		}

		this.canSelectSpeaker = this.selectSpeakerEnabled();
		this.canSetSpeakerVolume = this.setSpeakerVolumeEnabled();
	}

	private selectSpeakerEnabled() {
		return 'sinkId' in HTMLMediaElement.prototype;
	}

	private setSpeakerVolumeEnabled() {
		var is_ios = /iP(ad|od|hone)/i.test(window.navigator.userAgent),
			is_safari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/),
			is_ipad = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;

		return !((is_ios || is_ipad) && is_safari);
	}
}

export const deviceStore = new DeviceStore();