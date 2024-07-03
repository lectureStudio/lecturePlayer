import { autorun } from "mobx";
import { ColorScheme } from "../model/ui-state";
import { uiStateStore } from "../store/ui-state.store";

export class ColorSchemeService {

	private colorSchemeQuery: MediaQueryList;


	constructor() {
		this.observeColorScheme();

		autorun(() => {
			this.applyColorScheme();
		});
	}

	private applyColorScheme() {
		if (!document.body) {
			return;
		}

		const isDark = uiStateStore.isSystemAndUserDark();

		if (isDark) {
			document.body.classList.add("sl-theme-dark");
		}
		else {
			document.body.classList.remove("sl-theme-dark");
		}
	}

	private observeColorScheme() {
		if (window.matchMedia) {
			this.colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
			this.colorSchemeQuery.addEventListener("change", event => {
				uiStateStore.setSystemColorScheme(event.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
			});

			uiStateStore.setSystemColorScheme(this.colorSchemeQuery.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
		}
	}
}
