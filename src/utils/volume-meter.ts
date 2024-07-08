export class VolumeMeter {

	private readonly audioContext: AudioContext;

	private readonly meterCanvas: HTMLCanvasElement;

	private stream: MediaStream;

	private micNode: MediaStreamAudioSourceNode;


	constructor(meterCanvas: HTMLCanvasElement) {
		this.meterCanvas = meterCanvas;

		this.audioContext = new AudioContext();
		this.audioContext.audioWorklet.addModule("/js/volume-meter.worklet.js");
	}

	public setMediaStream(stream: MediaStream) {
		this.stream = stream;
	}

	public async start() {
		if (!this.stream) {
			throw new Error("No stream found.");
		}

		const meterContext = this.meterCanvas.getContext("2d");
		if (meterContext == null) {
			throw new Error("Canvas context not found.");
		}

		await this.audioContext.resume();

		this.micNode = this.audioContext.createMediaStreamSource(this.stream);

		const volumeMeterNode = new AudioWorkletNode(this.audioContext, "volume-meter");
		volumeMeterNode.port.onmessage = ({ data }) => {
			const { clientWidth, clientHeight } = this.meterCanvas;

			meterContext.fillStyle = getComputedStyle(this.meterCanvas).getPropertyValue("background-color");
			meterContext.fillRect(0, 0, clientWidth, clientHeight);
			meterContext.fillStyle = getComputedStyle(this.meterCanvas).getPropertyValue("fill");
			meterContext.fillRect(0, 0, data * clientWidth, clientHeight);
			meterContext.restore();
		};

		this.micNode
			.connect(volumeMeterNode)
			.connect(this.audioContext.destination);
	}

	public async stop() {
		await this.audioContext.suspend();

		if (this.micNode) {
			this.micNode.disconnect();
		}
	}
}
