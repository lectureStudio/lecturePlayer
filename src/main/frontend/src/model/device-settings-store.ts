import { createEvent, createStore } from "effector";

export type DeviceSettings = {
	microphoneDeviceId: string;
	microphoneMuteOnEntry: boolean;
	microphoneBlocked: boolean;
	speakerDeviceId: string;
	cameraDeviceId: string;
	cameraMuteOnEntry: boolean;
	cameraBlocked: boolean;
}

export const setMicrophoneDeviceId = createEvent<string>();
export const setMicrophoneMuteOnEntry = createEvent<boolean>();
export const setMicrophoneBlocked = createEvent<boolean>();
export const setSpeakerDeviceId = createEvent<string>();
export const setCameraDeviceId = createEvent<string>();
export const setCameraMuteOnEntry = createEvent<boolean>();
export const setCameraBlocked = createEvent<boolean>();
export const setDeviceSettings = createEvent<DeviceSettings>();
export const resetDeviceSettings = createEvent();

export const persistDeviceSettings = (state: DeviceSettings) => {
	localStorage.setItem("audio.input", state.microphoneDeviceId);
	localStorage.setItem("audio.input.entry.mute", JSON.stringify(state.microphoneMuteOnEntry ? true : false));
	localStorage.setItem("audio.output", state.speakerDeviceId);
	localStorage.setItem("video.input", state.cameraDeviceId);
	localStorage.setItem("video.input.entry.mute", JSON.stringify(state.cameraMuteOnEntry ? true : false));

	if (state.microphoneDeviceId === "none") {
		localStorage.removeItem("audio.input");
	}
	if (state.speakerDeviceId === "none") {
		localStorage.removeItem("audio.output");
	}
	if (state.cameraDeviceId === "none") {
		localStorage.removeItem("video.input");
	}
};

const loadDeviceSettings = (): DeviceSettings => {
	return {
		microphoneDeviceId: localStorage.getItem("audio.input"),
		microphoneMuteOnEntry: localStorage.getItem("audio.input.entry.mute") === "true",
		microphoneBlocked: true,
		speakerDeviceId: localStorage.getItem("audio.output"),
		cameraDeviceId: localStorage.getItem("video.input"),
		cameraMuteOnEntry: localStorage.getItem("video.input.entry.mute") === "true",
		cameraBlocked: true
	}
};

const store = createStore<DeviceSettings>(loadDeviceSettings())
	.on(setMicrophoneDeviceId, (state: DeviceSettings, deviceId: string) => ({
		...state,
		microphoneDeviceId: deviceId,
	}))
	.on(setMicrophoneMuteOnEntry, (state: DeviceSettings, muteOnEntry: boolean) => ({
		...state,
		microphoneMuteOnEntry: muteOnEntry,
	}))
	.on(setMicrophoneBlocked, (state: DeviceSettings, blocked: boolean) => ({
		...state,
		microphoneBlocked: blocked,
	}))
	.on(setSpeakerDeviceId, (state: DeviceSettings, deviceId: string) => ({
		...state,
		speakerDeviceId: deviceId,
	}))
	.on(setCameraDeviceId, (state: DeviceSettings, deviceId: string) => ({
		...state,
		cameraDeviceId: deviceId,
	}))
	.on(setCameraMuteOnEntry, (state: DeviceSettings, muteOnEntry: boolean) => ({
		...state,
		cameraMuteOnEntry: muteOnEntry,
	}))
	.on(setCameraBlocked, (state: DeviceSettings, blocked: boolean) => ({
		...state,
		cameraBlocked: blocked,
	}))
	.on(setDeviceSettings, (state: DeviceSettings, settings: DeviceSettings) => ({
		...state,
		...settings,
	}))
	.reset(resetDeviceSettings);

store.updates.watch(settings => {
	persistDeviceSettings(settings);
});

export default store;