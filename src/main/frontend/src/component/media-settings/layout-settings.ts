import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { SlMenu, SlMenuItem } from '@shoelace-style/shoelace';
import { MediaSettings } from './media-settings';
import { ContentLayout, setContentLayout } from '../../model/presentation-store';
import { Utils } from '../../utils/utils';

@customElement("layout-settings")
export class LayoutSettings extends I18nLitElement {

	static styles = [
		I18nLitElement.styles
	];

	@query('sl-menu')
	menu: SlMenu;

	override connectedCallback() {
		super.connectedCallback()
	}

	protected render() {
		return html`
		<sl-menu @sl-select="${this.onLayoutSelected}">
			<sl-menu-item class="conference-control" type="checkbox" value="PresentationTop" checked="">${t("layout.presentation.top")}</sl-menu-item>
			<sl-menu-item class="conference-control" type="checkbox" value="PresentationRight">${t("layout.presentation.right")}</sl-menu-item>
			<sl-menu-item class="conference-control" type="checkbox" value="PresentationBottom">${t("layout.presentation.bottom")}</sl-menu-item>
			<sl-menu-item class="conference-control" type="checkbox" value="PresentationLeft">${t("layout.presentation.left")}</sl-menu-item>
		</sl-menu>
		`;
	}

	private onLayoutSelected(event: CustomEvent) {
		const selectedItem: SlMenuItem = event.detail.item;
		const value = selectedItem.value;

		document.dispatchEvent(Utils.createEvent("settings-layout", value));

		// Keep selected item checked, e.g. when double-checked.
		if (selectedItem.type === "checkbox") {
			selectedItem.checked = true;
		
			for (let item of this.menu.getAllItems()) {
				// Uncheck all items, except the selected one.
				if (item.value !== selectedItem.value && item.type === "checkbox") {
					item.checked = false;
				}
			}

			
			
		} 
	}
}