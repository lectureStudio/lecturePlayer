import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property, query } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { t } from '../i18n-mixin';
import { Devices } from "../../utils/devices";
import speechAcceptedModalStyles from "./speech-accepted.modal.css";

@customElement("speech-accepted-modal")
export class SpeechAcceptedModal extends Modal {

	static override styles = [
		Modal.styles,
		speechAcceptedModalStyles
	];

	@query('video')
	accessor video: HTMLVideoElement;

	@query('#meter')
	accessor meterCanvas: HTMLCanvasElement;

	@property({ type: Boolean, reflect: true })
	accessor cameraBlocked: boolean;

	stream: MediaStream;


	protected override firstUpdated() {
		this.video.srcObject = this.stream;
		this.video.muted = true;

		if (this.stream.getVideoTracks().length < 1) {
			// No camera selected for the speech.
			this.video.style.display = "none";
		}

		const audioTrack = this.stream.getAudioTracks()[0];

		if (audioTrack) {
			//Devices.getAudioLevel(audioTrack, this.meterCanvas);
		}

		super.firstUpdated();
	}

	protected startSpeech() {
		this.dispatchEvent(Utils.createEvent("speech-accepted-start"));
		this.close();
	}

	protected cancelSpeech() {
		this.dispatchEvent(Utils.createEvent("speech-accepted-canceled"));
		this.close();
	}

	override close() {
		Devices.stopMediaTracks(this.stream);

		super.close();
	}

	protected override render() {
		return html`
			<sl-dialog label="${t("course.speech.request.accepted")}">
				<article>
					<label>
						${t("course.speech.request.accepted.description")}
					</label>
					<sl-alert variant="warning" .open="${this.cameraBlocked}">
						<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
						<strong>${t("devices.camera.blocked")}</strong>
						<strong>${t("course.speech.request.without.camera")}</strong>
					</sl-alert>

					<div class="video-container">
						<video id="camera-preview" playsinline autoplay muted></video>
					</div>
					<div>
						<canvas id="meter" width="220" height="5"></canvas>
					</div>
				</article>
				<div slot="footer">
					<sl-button @click="${this.cancelSpeech}" size="small">
						${t("course.speech.request.cancel")}
					</sl-button>
					<sl-button @click="${this.startSpeech}" variant="primary" size="small">
						${t("course.speech.request.start")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}
