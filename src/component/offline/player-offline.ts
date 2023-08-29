import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { courseStore } from '../../store/course.store';
import { Component } from '../component';
import { uiStateStore } from '../../store/ui-state.store';
import playerOfflineStyles from './player-offline.scss';

@customElement('player-offline')
export class PlayerOffline extends Component {

	static styles = [
		I18nLitElement.styles,
		playerOfflineStyles,
	];


	protected render() {
		return html`
			<div>
				<sl-icon name="course-not-available"></sl-icon>
				<strong class="text-muted py-2">${t("course.unavailable")}</strong>

				<sl-alert variant="warning" .open="${uiStateStore.streamProbeFailed}">
					<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
					<article>
						<p>${t("vpn.required.description")}</p>
						<ul>
							<li><a href="https://www.hrz.tu-darmstadt.de/services/it_services/wlan/index.de.jsp" target="_blank" tabindex="-1">WLAN (eduroam)</a>: <span>${t("vpn.required.description.wlan")}</span></li>
							<li><a href="https://www.hrz.tu-darmstadt.de/support_und_anleitungen/hrz_anleitungen/tu_vpn/windows__macos_x_und_linux/index.de.jsp" target="_blank" tabindex="-1">TU VPN</a>: <span>${t("vpn.required.description.vpn")}</span></li>
						</ul>
						<p>${t("vpn.required.reconnect")}</p>
					</article>
				</sl-alert>

				<sl-divider></sl-divider>
				<small>
					${unsafeHTML(courseStore.description)}
				</small>
			</div>
		`;
	}
}