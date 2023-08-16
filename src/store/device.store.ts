import { makeAutoObservable } from "mobx";

class DeviceStore {

	microphoneDeviceId: string;
	microphoneMuteOnEntry: boolean;
	microphoneBlocked: boolean;

	speakerDeviceId: string;
	speakerVolume: number = 1.0;

	cameraDeviceId: string;
	cameraMuteOnEntry: boolean;
	cameraBlocked: boolean;


	constructor() {
		makeAutoObservable(this);

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
	}
}

export const deviceStore = new DeviceStore();