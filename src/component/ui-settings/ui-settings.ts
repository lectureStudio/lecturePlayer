import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { SettingsBase } from "../settings-base/settings-base";

@customElement("ui-settings")
export class UiSettings extends SettingsBase {

	protected override render() {
		return html`
			<span>${t("settings.ui.language")}</span>
			<div class="content">
				<language-chooser></language-chooser>
			</div>
			<span>${t("settings.ui.theme")}</span>
			<div class="content">
				<theme-chooser></theme-chooser>
			</div>
			<span>${t("settings.ui.media.profile")}</span>
			<div class="content">
				<media-profile-settings></media-profile-settings>
			</div>
		`;
	}
}
