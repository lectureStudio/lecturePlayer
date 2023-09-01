import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';

@customElement("vpn-modal")
export class VpnModal extends Modal {

	protected override render() {
		return html`
			<sl-dialog label="${t("vpn.required.title")}">
				<article>
					<p>${t("vpn.required.description")}</p>
					<ul>
						<li><a class="link-primary" href="https://www.hrz.tu-darmstadt.de/services/it_services/wlan/index.de.jsp" target="_blank" tabindex="-1">WLAN (eduroam)</a>: <span>${t("vpn.required.description.wlan")}</span></li>
						<li><a class="link-primary" href="https://www.hrz.tu-darmstadt.de/support_und_anleitungen/hrz_anleitungen/tu_vpn/windows__macos_x_und_linux/index.de.jsp" target="_blank" tabindex="-1">TU VPN</a>: <span>${t("vpn.required.description.vpn")}</span></li>
					</ul>
					<p>${t("vpn.required.reconnect")}</p>
				</article>
			</sl-dialog>
		`;
	}
}