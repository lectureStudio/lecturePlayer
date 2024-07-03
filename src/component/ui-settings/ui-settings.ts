import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { SettingsBase } from "../settings-base/settings-base";

@customElement("ui-settings")
export class UiSettings extends SettingsBase {

	protected override render() {
		return html`
			<span>${t("settings.ui.language")}</span>
			<language-chooser></language-chooser>
			<span>${t("settings.ui.theme")}</span>
			<theme-chooser></theme-chooser>
			<span><span>${t("settings.ui.media.profile")}</span></span>
			<media-profile-settings></media-profile-settings>
		`;
	}
}
