import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';

@customElement("vpn-modal")
export class VpnModal extends Modal {

	protected render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("vpn.modal.title")}</span>
				</header>
				<article>
					<p>${t("vpn.modal.description")}</p>
					<ul>
						<li><a class="link-primary" href="https://www.hrz.tu-darmstadt.de/services/it_services/wlan/index.de.jsp" target="_blank" tabindex="-1">WLAN (eduroam)</a>: <span>${t("vpn.modal.description.wlan")}</span></li>
						<li><a class="link-primary" href="https://www.hrz.tu-darmstadt.de/support_und_anleitungen/hrz_anleitungen/tu_vpn/windows__macos_x_und_linux/index.de.jsp" target="_blank" tabindex="-1">TU VPN</a>: <span>${t("vpn.modal.description.vpn")}</span></li>
					</ul>
					<p>${t("vpn.modal.reconnect")}</p>
				</article>
			</web-dialog>
		`;
	}
}