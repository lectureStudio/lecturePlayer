import { deviceStore } from "../store/device.store";
import { Utils } from "./utils";

export interface DeviceInfo {

	devices: MediaDeviceInfo[];
	stream: MediaStream;
	constraints: any;

}

export class Devices {

	static cameraErrorHandler(error: Error) {
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

	static screenErrorHandler(error: Error) {
		if (error.name === "NotAllowedError") {
			// User aborted the dialog or permission not granted.
			document.dispatchEvent(Utils.createEvent("lect-screen-share-not-allowed"));
		}
		else {
			console.error("Screen error", error.name, error);
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

	static enumerateAudioDevices(useSettings: boolean): Promise<DeviceInfo> {
		let constraints: MediaStreamConstraints = {};

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

	static enumerateVideoDevices(): Promise<DeviceInfo> {
		let constraints: MediaStreamConstraints = {};

		const videoSource = deviceStore.cameraDeviceId;

		if (videoSource) {
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
	
		Devices.pollAudioLevel(audioTrack, (level: number) => {
			meterContext.fillStyle = "lightgrey";
			meterContext.fillRect(0, 0, canvas.width, canvas.height);
			meterContext.fillStyle = "#0d6efd";
			meterContext.fillRect(0, 0, level * canvas.width, canvas.height);
		});
	}
	
	static createAudioMeter(audioContext: AudioContext, clipLevel: number, averaging: number, clipLag: number) {
		const processor: ScriptProcessorNode = audioContext.createScriptProcessor(512);
		processor.clipping = false;
		processor.lastClip = 0;
		processor.volume = 0;
		processor.clipLevel = clipLevel || 0.98;
		processor.averaging = averaging || 0.95;
		processor.clipLag = clipLag || 750;
		processor.onaudioprocess = function(event) {
			const inputBuffer = event.inputBuffer;
			let rmsSum = 0;
		
			for (let c = 0; c < inputBuffer.numberOfChannels; c++) {
				const inputData = inputBuffer.getChannelData(c);
				const bufLength = inputData.length;
				let sum = 0;
				let x;
		
				for (var i = 0; i < bufLength; i++) {
					x = inputData[i];
		
					if (Math.abs(x) >= this.clipLevel) {
						this.clipping = true;
						this.lastClip = window.performance.now();
					}
		
					sum += x * x;
				}
		
				rmsSum += Math.sqrt(sum / bufLength);
			}
		
			this.volume = Math.max(rmsSum / 2, this.volume * this.averaging);
		};
		processor.checkClipping = function() {
			if (!this.clipping) {
				return false;
			}
			if ((this.lastClip + this.clipLag) < window.performance.now()) {
				this.clipping = false;
			}
	
			return this.clipping;
		};
		processor.shutdown = function() {
			this.disconnect();
			this.onaudioprocess = null;
		};
	
		return processor;
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
	
	static stopAudioTracks(stream: MediaStream) {
		if (stream) {
			stream.getAudioTracks().forEach(track => {
				track.stop();
			});
		}
	}
	
	static stopVideoTracks(stream: MediaStream) {
		if (stream) {
			stream.getVideoTracks().forEach(track => {
				track.stop();
			});
		}
	}
	
	static stopMediaTracks(stream: MediaStream) {
		if (stream) {
			stream.getTracks().forEach(track => {
				track.stop();
			});
		}
	}
	
	static setAudioSink(mediaElement: HTMLMediaElement, sinkId: string) {
		if (!('sinkId' in HTMLMediaElement.prototype)) {
			// In firefox this feature is behind the 'media.setsinkid.enabled' preferences (needs to be set to true).
			return;
		}

		mediaElement.setSinkId(sinkId)
			.catch(error => {
				console.error(error);
			});
	}

	static attachMediaStream(mediaElement: HTMLMediaElement, stream: MediaStream) {
		try {
			mediaElement.srcObject = stream;
		}
		catch (e) {
			console.error("Error attaching stream to element", e);
		}
	}
}