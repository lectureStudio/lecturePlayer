import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Modal } from "../modal/modal";
import { startModalStyles } from './start.modal.styles';
import { t } from '../i18n-mixin';
import { Utils } from "../../utils/utils";

@customElement("start-modal")
export class startModal extends Modal {
	
	static styles = [
		Modal.styles,
		startModalStyles
	]

	@property()
	permissionBlocked: boolean;

	@property()
	audioInputBlocked: boolean;

	@property({ type: String })
	type: "audio"

	private abort() {
		this.dispatchEvent(Utils.createEvent("start-modal-abort"));

		super.close();
	}

	override open(): void {
		super.open();

		navigator.mediaDevices.enumerateDevices()
			.then((deviceInfo: MediaDeviceInfo[]) => {
				if (!(deviceInfo.some((device) => device.kind === "audioinput"))) this.audioInputBlocked = true;
			})

		navigator.mediaDevices.getUserMedia({
			audio:true,
			video:true
		})
		.then(() => {
			if (!this.audioInputBlocked) this.abort();
		})
		.catch(error => {
			if (error.name == "NotReadableError") {
				this.permissionBlocked = true;
			}
			else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
				this.permissionBlocked = true;
			}
		})
	}

	protected render() {
		return html`
			<sl-dialog label="${t("start.title")}">
				<article>
					<span>${t("start.description")}</span>
				</article>
				<sl-alert variant="warning" .open="${this.permissionBlocked}">
					<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
					<strong>${t("start.permission")}</strong>
				</sl-alert>
				<sl-alert variant="warning" .open="${this.audioInputBlocked}">
					<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
					<strong>${t("start.error.audioInput")}</strong>
				</sl-alert>
			</sl-dialog>
		`;
	}
}