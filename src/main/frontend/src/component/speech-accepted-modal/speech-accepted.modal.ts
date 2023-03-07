import { html } from "lit";
import { Modal } from "../modal/modal";
import { classMap } from "lit/directives/class-map.js";
import { customElement, property, query } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { t } from '../i18n-mixin';
import { Devices } from "../../utils/devices";
import { speechAcceptedModalStyles } from "./speech-accepted.modal.styles";

@customElement("speech-accepted-modal")
export class SpeechAcceptedModal extends Modal {

	static styles = [
		Modal.styles,
		speechAcceptedModalStyles
	];

	@query('#camera-preview')
	video: HTMLVideoElement;

	@query('#meter')
	meterCanvas: HTMLCanvasElement;

	@property()
	videoInputBlocked: boolean;

	stream: MediaStream;


	protected firstUpdated() {
		this.video.srcObject = this.stream;
		this.video.muted = true;

		const audioTrack = this.stream.getAudioTracks()[0];

		if (audioTrack) {
			Devices.getAudioLevel(audioTrack, this.meterCanvas);
		}
	}

	protected start() {
		this.dispatchEvent(Utils.createEvent("speech-accepted-start"));
		this.close();
	}

	protected cancel() {
		this.dispatchEvent(Utils.createEvent("speech-accepted-canceled"));
		this.close();
	}

	override close() {
		Devices.stopMediaTracks(this.stream);

		super.close();
	}

	protected render() {
		return html`
			<wsl-dialog label="${t("course.speech.request.accepted")}">
				<article>
					<label class="form-label pb-2">
						${t("course.speech.request.accepted.description")}
					</label>
					<div class="row alert alert-warning m-2 ${classMap({ "d-none": !this.videoInputBlocked })}" role="alert">
						<span>${t("devices.camera.blocked")}</span>
						<span>${t("course.speech.request.without.camera")}</span>
					</div>
					<div class="d-flex justify-content-center">
						<video id="camera-preview" playsinline autoplay muted></video>
					</div>
					<div>
						<canvas id="meter" width="220" height="5"></canvas>
					</div>
				</article>
				<div slot="footer">
					<sl-button @click="${this.cancel}" size="small">
						${t("course.speech.request.cancel")}
					</sl-button>
					<sl-button @click="${this.start}" variant="primary" size="small">
						${t("course.speech.request.start")}
					</sl-button>
				</div>
			</wsl-dialog>
		`;
	}
}