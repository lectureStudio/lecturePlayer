import { Results, SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { VirtualBackgroundProcessor, VirtualBackgroundProcessorOptions } from "@shiguredo/virtual-background";

export class VirtualBackground {

	private selfieSegmentation: SelfieSegmentation;

	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D | null;

	private stream: MediaStream;

	private lastRequestTime: number;

	private requestID: number;


	constructor() {
		this.initialize();
	}

	public setCanvas(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");

		if (!this.context) {
			throw new Error("Failed to get canvas context");
		}
	}

	public setVideoStream(stream: MediaStream) {
		this.stream = stream;
	}

	public async start(): Promise<MediaStreamVideoTrack> {
		this.lastRequestTime = 0;

		// this.getFrames();

		const assetsPath = "https://cdn.jsdelivr.net/npm/@shiguredo/virtual-background@latest/dist";
		const processor = new VirtualBackgroundProcessor(assetsPath);

		const track = this.stream.getVideoTracks()[0];

		const options: VirtualBackgroundProcessorOptions = {
			blurRadius: 15,
			segmentationModel: "selfie-landscape"
		};

		return processor.startProcessing(track, options);
	}

	public stop() {
		// cancelAnimationFrame(this.requestID);

		// this.selfieSegmentation.reset();
	}

	private async initialize() {
		// this.selfieSegmentation = new SelfieSegmentation({
		// 	locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${ file }`,
		// })
		// this.selfieSegmentation.setOptions({
		// 	modelSelection: 1,
		// 	selfieMode: true,
		// })
		// this.selfieSegmentation.onResults(this.onResults.bind(this));
	}

	private onResults(results: Results) {
		// const bg = "none";
		//
		// // Prepare the new frame
		// this.context.save();
		// this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// this.context.drawImage(results.segmentationMask, 0, 0, this.canvas.width, this.canvas.height);
		//
		// if (bg === "blur") {
		// 	// No background selected, just draw the segmented background (and maybe blur).
		// 	if (bg === "blur") {
		// 		this.context.filter = 'blur(10px)';
		// 	}
		//
		// 	this.context.globalCompositeOperation = "source-out";
		// 	this.context.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
		//
		// 	if (bg === "blur") {
		// 		this.context.filter = "blur(0px)";
		// 	}
		// }
		// else {
		// 	// Draw the image as the new background, and the segmented video on top of that
		// 	// this.context.globalCompositeOperation = "source-out";
		// 	// this.context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.canvas.width, this.canvas.height);
		//
		// 	this.context.globalCompositeOperation = "source-out"
		// 	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
		// 	this.context.globalCompositeOperation = "destination-atop"
		// 	this.context.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height)
		// }
		//
		// this.context.globalCompositeOperation = "destination-atop";
		// this.context.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
		// this.context.restore();
	}

	private async getFrames() {
		// const now = this.stream.getVideoTracks()[0].urrentTime;
		// if (now > this.lastRequestTime) {
		// 	await this.selfieSegmentation.send({ image: this.videoElement });
		// }
		// this.lastRequestTime = now;
		//
		// this.requestID = requestAnimationFrame(this.getFrames.bind(this));
	}
}
