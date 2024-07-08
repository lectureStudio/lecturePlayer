import { action, autorun, observable } from "mobx";
import { deviceStore } from "../store/device.store";

export class EchoTest {

	private readonly audioContext: AudioContext;

	private stream: MediaStream;

	private micNode: MediaStreamAudioSourceNode;

	@observable
	private accessor started: boolean = false;


	constructor() {
		this.audioContext = new AudioContext();

		if ("setSinkId" in AudioContext.prototype) {
			autorun(() => {
				// Pass empty string for default devices.
				const devId = deviceStore.speakerDeviceId === "default" ? "" : deviceStore.speakerDeviceId;

				this.audioContext.setSinkId(devId)
					.catch(reason => console.error(reason));
			})
		}
	}

	public setMediaStream(stream: MediaStream) {
		this.stream = stream;
	}

	public isStarted() {
		return this.started;
	}

	public async start() {
		if (this.started) {
			return;
		}
		if (!this.stream) {
			throw new Error("No stream was found.");
		}

		await this.audioContext.resume();

		const synthDelay = this.audioContext.createDelay();
		synthDelay.delayTime.value = 1;

		this.micNode = this.audioContext.createMediaStreamSource(this.stream);

		this.micNode.connect(synthDelay);
		synthDelay.connect(this.audioContext.destination);

		this.setStarted(true);
	}

	public async stop() {
		await this.audioContext.suspend();

		if (this.micNode) {
			this.micNode.disconnect();
		}

		this.setStarted(false);
	}

	@action
	private setStarted(started: boolean) {
		this.started = started;
	}
}
