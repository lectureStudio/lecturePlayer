import { t } from "i18next";
import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Component } from "../../component/component";
import { I18nLitElement } from "../../component/i18n-mixin";
import styles from './not-found.css';

@customElement('not-found')
export class NotFound extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];


	protected override render() {
		return html`
			<div class="error-container">
				<span class="error-code">404</span>
				<span class="error-message">${t("page.error.404.message")}</span>
				<span class="error-description">${t("page.error.404.description")}</span>
				<sl-button @click="${this.goBack}" outline>${t("nav.back")}</sl-button>
			</div>
		`;
	}

	private goBack(): void {
		history.back();
	}
}
