import { html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { Component } from "../component";
import { ColorScheme, uiStateStore } from "../../store/ui-state.store";

@customElement("theme-settings")
export class ThemeSettings extends Component {

	@query('sl-select')
	private select: HTMLSelectElement;


	protected render() {
		return html`
			<sl-select @sl-change="${this.onThemeChange}" .value="${uiStateStore.colorScheme}" name="theme" label="${t("settings.theme")}" size="small" hoist>
				<sl-option value="${ColorScheme.LIGHT}">${t("theme.light")}</sl-option>
				<sl-option value="${ColorScheme.DARK}">${t("theme.dark")}</sl-option>
				<sl-divider></sl-divider>
				<sl-option value="${ColorScheme.SYSTEM}">${t("theme.system")}</sl-option>
			</sl-select>
		`;
	}

	private onThemeChange() {
		uiStateStore.setColorScheme(this.select.value as ColorScheme);
	}
}