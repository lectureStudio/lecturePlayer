import { html } from "lit";
import { Modal } from "../modal/modal";
import { classMap } from "lit/directives/class-map.js";
import { customElement, property } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { t } from '../i18n-mixin';

@customElement("speech-accepted-modal")
export class SpeechAcceptedModal extends Modal {

	@property()
	videoInputBlocked: boolean;


	start() {
		this.dispatchEvent(Utils.createEvent("speech-accepted-start"));
		this.close();
	}

	cancel() {
		this.dispatchEvent(Utils.createEvent("speech-accepted-canceled"));
		this.close();
	}

	render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("course.speech.request.accepted")}</span>
				</header>
				<article>
					<label class="form-label">
						${t("course.speech.request.accepted.description")}
					</label>

					<div class="row alert alert-warning m-2 ${classMap({ "d-none": !this.videoInputBlocked })}" role="alert">
						<span>${t("devices.camera.blocked")}</span>
						<span>${t("course.speech.request.without.camera")}</span>
					</div>
				</article>
				<footer>
					<button type="button" @click="${this.cancel}" class="btn btn-outline-secondary btn-sm">
						${t("course.speech.request.cancel")}
					</button>
					<button type="button" @click="${this.start}" class="btn btn-outline-primary btn-sm">
						${t("course.speech.request.start")}
					</button>
				</footer>
			</web-dialog>
		`;
	}
}