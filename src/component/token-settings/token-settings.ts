import { CSSResultGroup, html, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { PersonalToken } from "../../model/personal-token";
import { uiStateStore } from "../../store/ui-state.store";
import { PersonalTokenApi } from "../../transport/personal-token-api";
import { I18nLitElement, t } from '../i18n-mixin';
import { Component } from "../component";
import styles from "./token-settings.css"

@customElement("token-settings")
export class TokenSettings extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];

	@state()
	accessor token: PersonalToken | undefined = undefined;

	@state()
	accessor generated: boolean = false;


	private loadToken() {
		PersonalTokenApi.getPersonalToken()
			.then(token => {
				this.token = token;
			});
	}

	private generateToken() {
		PersonalTokenApi.generatePersonalToken()
			.then(token => {
				this.token = token;
				this.generated = true;
			});
	}

	private deleteToken() {
		PersonalTokenApi.deletePersonalToken()
			.then(() => {
				this.token = undefined;
				this.generated = false;
			});
	}

	protected override firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);

		this.loadToken();
	}

	protected override render() {
		const lang = uiStateStore.language;

		return html`
			<span class="help-text">${t("settings.api.token.description")}</span>
			<sl-card>
				<div class="token-content">
					<span class="token-label">${t("settings.api.token.created")}</span>
					${when(!this.token || !this.token.dateCreated,
						() => html`
							<sl-badge variant="neutral">${t("settings.api.token.never.created")}</sl-badge>
						`,
						() => html`
							<sl-format-date date="${this.token?.dateCreated ?? ""}"
											.lang="${lang}"
											month="long" day="numeric" year="numeric"
											hour="numeric" minute="numeric" hour-format="24">
							</sl-format-date>
						`)}

					<span class="token-label">${t("settings.api.token.last.used")}</span>
					${when(!this.token || !this.token.dateLastUsed,
						() => html`
							<sl-badge variant="neutral">${t("settings.api.token.never.used")}</sl-badge>
						`,
						() => html`
							<sl-format-date .date="${this.token?.dateLastUsed ?? ""}"
											.lang="${lang}"
											month="long" day="numeric" year="numeric"
											hour="numeric" minute="numeric" hour-format="24">
							</sl-format-date>
						`)}
				</div>
			</sl-card>
			<sl-alert variant="primary" open>
				<sl-icon slot="icon" name="info-circle"></sl-icon>
				<span>${t("settings.api.token.warn")}</span>
			</sl-alert>

			${when(this.generated, () => html`
				<sl-alert variant="success" open>
					<sl-icon slot="icon" name="check2-circle"></sl-icon>
					<span>${t("settings.api.token.copy.note")}</span>
					<div class="token-container">
						<sl-input id="token" type="password" .value="${this.token?.token ?? ""}" size="small" filled disabled></sl-input>
						<sl-copy-button
							from="token.value"
							copy-label="${t("label.copy")}"
							success-label="${t("label.success")}"
							error-label="${t("label.error")}"
						>
						</sl-copy-button>
					</div>
				</sl-alert>
			`)}

			<div class="token-controls">
				<sl-button @click="${this.generateToken}" variant="neutral" size="small" outline>${t("settings.api.token.generate")}</sl-button>
				<sl-button @click="${this.deleteToken}" variant="danger" size="small" ?disabled="${!this.token}" outline>${t("settings.api.token.delete")}</sl-button>
			</div>
		`;
	}
}
