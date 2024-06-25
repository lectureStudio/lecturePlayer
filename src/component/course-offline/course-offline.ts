import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { courseStore } from '../../store/course.store';
import { Component } from '../component';
import { uiStateStore } from '../../store/ui-state.store';
import styles from './course-offline.css';

@customElement('course-offline')
export class CourseOffline extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];


	protected override render() {
		return html`
			<div>
				<sl-icon name="${uiStateStore.streamProbeFailed ? 'shield-exclamation' : 'calendar-x'}"></sl-icon>

				${when(!uiStateStore.streamProbeFailed, () => html`
					<strong>${t("course.unavailable")}</strong>
				`)}

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
					${unsafeHTML(courseStore.activeCourse?.description)}
				</small>
			</div>
		`;
	}
}
