import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { t } from "../i18n-mixin";
import { SettingsBase } from "../settings-base/settings-base";

@customElement("api-settings")
export class ApiSettings extends SettingsBase {

	protected override render() {
		return html`
			<span>${t("settings.api.token")}</span>
			<div class="content">
				<token-settings></token-settings>
			</div>
		`;
	}
}
