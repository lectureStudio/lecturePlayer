import { deviceStore } from "../store/device.store";
import { Utils } from "./utils";

export interface DeviceInfo {

	devices: MediaDeviceInfo[];
	stream?: MediaStream;
	constraints?: MediaStreamConstraints;

}

export class Devices {

	static noPermission(error: Error) {
		return (error.name == "NotAllowedError" || error.name == "PermissionDeniedError");
	}

	static notReadable(error: Error) {
		return error.name == "NotReadableError";
	}

	static cameraErrorHandler(error: unknown) {
		if (error instanceof Error) {
			if (error.name === "NotAllowedError") {
				document.dispatchEvent(Utils.createEvent("lect-camera-not-allowed"));
			}
			else if (error.name === "NotReadableError") {
				document.dispatchEvent(Utils.createEvent("lect-camera-not-readable"));
			}
			else {
				console.error("Camera error", error.name, error);
			}
		}
	}

	static screenErrorHandler(error: unknown) {
		if (error instanceof Error) {
			if (error.name === "NotAllowedError") {
				// User aborted the dialog or permission not granted.
				document.dispatchEvent(Utils.createEvent("lect-screen-share-not-allowed"));
			}
			else {
				console.error("Screen error", error.name, error);
			}
		}
	}

	static async getScreenStream() {
		const constraints = {
			video: true,
			audio: false
		};

		return await navigator.mediaDevices.getDisplayMedia(constraints);
	}

	static async getVideoStream() {
		const videoSource = deviceStore.cameraDeviceId;
		const constraints = {
			video: {
				deviceId: videoSource ? { exact: videoSource } : undefined,
				width: { ideal: 1280 },
				height: { ideal: 720 },
				facingMode: "user"
			}
		};

		return await navigator.mediaDevices.getUserMedia(constraints);
	}

	static getDefaultDevice(devices: MediaDeviceInfo[]) {
		// Find a device with the default id.
		for (const dev of devices) {
			if (dev.deviceId === "default") {
				return dev;
			}
		}

		// If no default one found, return the first available device.
		return devices[0];
	}

	static filterByGroupId(devices: MediaDeviceInfo[]) {
		const filtered = devices.filter((dev1, index, arr) =>
			arr.findIndex(dev2 => (dev2.groupId === dev1.groupId && dev2.kind === dev1.kind)) === index,
		);

		return filtered.sort((dev1, dev2) => dev1.label.localeCompare(dev2.label));
	}

	static enumerateAudioDevices(useSettings: boolean, constraints: MediaStreamConstraints = {}): Promise<DeviceInfo> {
		if (useSettings) {
			const audioSource = deviceStore.microphoneDeviceId;

			if (audioSource) {
				constraints.audio = {
					deviceId: { exact: audioSource },
					...constraints.audio
				}
			}
		}
		if (!constraints.audio) {
			constraints.audio = true;
		}

		return this.getUserMedia(constraints);
	}

	static enumerateVideoDeviceNames() {
		return new Promise<DeviceInfo>((resolve, reject) => {
			return navigator.mediaDevices.enumerateDevices()
				.then(devices => {
					const result = {
						devices: devices
					};

					resolve(result);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	static enumerateVideoDevices(): Promise<DeviceInfo> {
		const constraints: MediaStreamConstraints = {};

		const videoSource = deviceStore.cameraDeviceId;

		if (videoSource && videoSource !== "none") {
			constraints.video = {
				deviceId: { exact: videoSource },
				width: { ideal: 1280 },
				height: { ideal: 720 },
				facingMode: "user"
			}
		}
		else {
			constraints.video = {
				width: { ideal: 1280 },
				height: { ideal: 720 },
				facingMode: "user"
			}
		}

		if (!constraints.video) {
			constraints.video = {
				width: { ideal: 1280 },
				height: { ideal: 720 },
				facingMode: "user"
			}
		}

		return this.getUserMedia(constraints);
	}

	static getUserMedia(constraints: MediaStreamConstraints): Promise<DeviceInfo> {
		return new Promise<DeviceInfo>((resolve, reject) => {
			navigator.mediaDevices.getUserMedia(constraints)
				.then(stream => {
					return navigator.mediaDevices.enumerateDevices()
						.then(devices => {
							const result = {
								devices: this.filterByGroupId(devices),
								stream: stream,
								constraints: constraints
							};

							resolve(result);
						})
						.catch(error => {
							reject(error);
						});
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	static removeHwId(label: string) {
		const matches = label.match(/\s\([a-zA-Z0-9]{4}:[a-zA-Z0-9]{4}\)/g);
		let hwId = null;
	
		if (matches && matches.length > 0) {
			hwId = matches[0];
		}
	
		return hwId ? label.replace(hwId, "") : label;
	}
	
	static stopAudioTracks(stream: MediaStream | null) {
		if (stream) {
			stream.getAudioTracks().forEach(track => {
				track.stop();
			});
		}
	}
	
	static stopVideoTracks(stream: MediaStream | null) {
		if (stream) {
			stream.getVideoTracks().forEach(track => {
				track.stop();
			});
		}
	}
	
	static stopMediaTracks(stream: MediaStream | null | undefined) {
		if (stream) {
			stream.getTracks().forEach(track => {
				track.stop();
			});
		}
	}

	static setAudioSink(mediaElement: HTMLMediaElement, sinkId: string) {
		if (!deviceStore.canSelectSpeaker) {
			// In Firefox, this feature is behind the 'media.setsinkid.enabled' preferences (needs to be set to true).
			return;
		}

		mediaElement.setSinkId(sinkId)
			.catch(error => {
				console.error(error);
			});
	}

	static attachMediaStream(mediaElement: HTMLMediaElement, stream: MediaStream | null) {
		try {
			mediaElement.srcObject = stream;
		}
		catch (e) {
			console.error("Error attaching stream to element", e);
		}
	}
}
