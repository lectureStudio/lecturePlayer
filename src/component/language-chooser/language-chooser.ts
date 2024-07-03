import { consume } from "@lit/context";
import { html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { applicationContext, ApplicationContext } from "../../context/application.context";
import { uiStateStore } from "../../store/ui-state.store";
import { Component } from "../component";

@customElement("language-chooser")
export class LanguageChooser extends Component {

	@consume({ context: applicationContext })
	accessor applicationContext: ApplicationContext;

	@query('sl-select')
	private accessor select: HTMLSelectElement;


	protected override render() {
		return html`
			<sl-select @sl-change="${this.onLanguageChange}" .value="${uiStateStore.language}" name="language" size="small" hoist>
				${this.applicationContext.languageService.getLocales().map((lang) =>
					html`<sl-option value="${lang.tag}">${lang.displayName}</sl-option>`
				)}
			</sl-select>
		`;
	}

	private onLanguageChange() {
		uiStateStore.setLanguage(this.select.value);
	}
}
