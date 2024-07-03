import { SlSelect } from "@shoelace-style/shoelace";
import { html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { ColorScheme } from "../../model/ui-state";
import { t } from '../i18n-mixin';
import { Component } from "../component";
import { uiStateStore } from "../../store/ui-state.store";

@customElement("theme-chooser")
export class ThemeChooser extends Component {

	@query('sl-select')
	private accessor select: SlSelect;


	protected override render() {
		if (this.select) {
			// This is required to keep the selected label up to date when the current locale changes.
			this.select.updateComplete.then(() => {
				this.select.displayLabel = this.select.selectedOptions[0].getTextLabel();
			});
		}

		return html`
			<sl-select @sl-change="${this.onThemeChange}" .value="${uiStateStore.colorScheme}" name="theme" size="small" hoist>
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
