export class VolumeMeter {

	private readonly audioContext: AudioContext;

	private readonly meterCanvas: HTMLCanvasElement;

	private micNode: MediaStreamAudioSourceNode;


	constructor(audioContext: AudioContext, meterCanvas: HTMLCanvasElement) {
		this.audioContext = audioContext;
		this.meterCanvas = meterCanvas;
	}

	public async start(stream: MediaStream) {
		const meterContext = this.meterCanvas.getContext("2d");
		if (meterContext == null) {
			return;
		}

		await this.audioContext.resume();

		this.micNode = this.audioContext.createMediaStreamSource(stream);

		const volumeMeterNode = new AudioWorkletNode(this.audioContext, "volume-meter");
		volumeMeterNode.port.onmessage = ({ data }) => {
			const { clientWidth, clientHeight } = this.meterCanvas;

			meterContext.save();
			const region = new Path2D();
			region.rect(0, 0, 10, clientHeight);
			region.rect(15, 0, 10, clientHeight);
			region.rect(30, 0, 10, clientHeight);
			region.rect(45, 0, 10, clientHeight);
			meterContext.clip(region, "evenodd");

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
