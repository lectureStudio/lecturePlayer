import { deviceStore } from "../store/device.store";
import { Utils } from "./utils";

export interface DeviceInfo {

	devices: MediaDeviceInfo[];
	stream?: MediaStream;
	constraints?: MediaStreamConstraints;

}

export class Devices {

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

	static enumerateAudioDevices(useSettings: boolean): Promise<DeviceInfo> {
		const constraints: MediaStreamConstraints = {};

		if (useSettings) {
			const audioSource = deviceStore.microphoneDeviceId;

			if (audioSource) {
				constraints.audio = {
					deviceId: { exact: audioSource }
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

	/**
	 * Enumerates all media devices without requesting permission.
	 * Device labels may be empty if permission has not been granted,
	 * but device IDs will still be available for output devices (speakers).
	 */
	static enumerateDevices(): Promise<DeviceInfo> {
		return new Promise<DeviceInfo>((resolve, reject) => {
			return navigator.mediaDevices.enumerateDevices()
				.then(devices => {
					resolve({ devices: devices });
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
								devices: devices,
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

	static getAudioLevel(audioTrack: MediaStreamTrack, canvas: HTMLCanvasElement) {
		const meterContext = canvas.getContext("2d");

		if (meterContext == null) {
			return;
		}

		Devices.pollAudioLevel(audioTrack, (level: number) => {
			meterContext.fillStyle = getComputedStyle(canvas).getPropertyValue("background-color");
			meterContext.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
			meterContext.fillStyle = getComputedStyle(canvas).getPropertyValue("fill");
			meterContext.fillRect(0, 0, level * canvas.clientWidth, canvas.clientHeight);
		});
	}

	static async pollAudioLevel(track: MediaStreamTrack, onLevelChanged: (value: number) => void) {
		const audioContext = new AudioContext();
	
		// Due to browsers' autoplay policy.
		await audioContext.resume();
	
		const analyser = audioContext.createAnalyser();
		analyser.minDecibels = -127;
		analyser.maxDecibels = 0;
		analyser.fftSize = 1024;
		analyser.smoothingTimeConstant = 0.5;
	
		const stream = new MediaStream([track]);
		const source = audioContext.createMediaStreamSource(stream);
		source.connect(analyser);
	
		const samples = new Uint8Array(analyser.frequencyBinCount);
	
		function rootMeanSquare(samples: Uint8Array) {
			const sumSq = samples.reduce((sumSq, sample) => sumSq + sample, 0);
			return sumSq / samples.length;
		}
	
		requestAnimationFrame(function checkLevel() {
			analyser.getByteFrequencyData(samples);
	
			const level = rootMeanSquare(samples) / 255;
	
			onLevelChanged(Math.max(Math.min(level, 1), 0));
	
			// Continue calculating the level only if the audio track is live.
			if (track.readyState === "live") {
				requestAnimationFrame(checkLevel);
			}
			else {
				requestAnimationFrame(() => onLevelChanged(0));
			}
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
			// In firefox this feature is behind the 'media.setsinkid.enabled' preferences (needs to be set to true).
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