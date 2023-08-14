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

		if (!json) {
			return;
		}

		const settings: any = JSON.parse(json);
		const propertyNames = Object.getOwnPropertyNames(this);

		for (const name of propertyNames) {
			if (settings.hasOwnProperty(name)) {
				Object.defineProperty(this, name, settings[name]);
			}
		}
	}
}

export const deviceStore = new DeviceStore();