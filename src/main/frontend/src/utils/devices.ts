import { Settings } from "./settings";

export interface DeviceInfo {

	devices: MediaDeviceInfo[];
	stream: MediaStream;
	constraints: any;

}

export class Devices {

	static enumerateDevices(useVideo: boolean, useSettings: boolean): Promise<DeviceInfo> {
		let constraints: any;
	
		if (useSettings) {
			const audioSource = Settings.getMicrophoneId();
			const videoSource = Settings.getCameraId();

			constraints = {
				audio: {
					deviceId: audioSource ? { exact: audioSource } : undefined
				},
				video: {
					deviceId: videoSource ? { exact: videoSource } : undefined,
					width: 1280,
					height: 720,
					facingMode: "user"
				}
			};
		
			if (!useVideo) {
				delete constraints.video;
			}
		}
		else {
			constraints = {
				audio: true,
				video: {
					width: 1280,
					height: 720
				}
			};
		}

		return new Promise((resolve, reject) => {
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
			return;
		}

		mediaElement.setSinkId(sinkId)
			.catch(error => {
				console.error(error);
			});
	}
}