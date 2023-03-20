import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { layoutButtonStyles } from './layout-button.styles';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { ConferenceLayout } from '../conference-view/conference-view';
import { course } from '../../model/course';

@customElement('layout-button')
export class LayoutButton extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		layoutButtonStyles,
	];

	@query('sl-menu')
	menu: SlMenu;

	@query('sl-tooltip')
	tooltip: SlTooltip;


	override connectedCallback() {
		super.connectedCallback()
	}

	protected render() {
		return html`
			<sl-dropdown placement="top-start">
				<div slot="trigger">
					<sl-tooltip content="${t("controls.layout")}" trigger="hover">
						<sl-button @click="${this.onButton}">
							<sl-icon slot="prefix" library="lect-icons" name="layout"></sl-icon>
						</sl-button>
					</sl-tooltip>
				</div>
				<sl-menu @sl-select="${this.onLayoutSelected}">
					<sl-menu-item type="checkbox" value="Gallery" checked="">${t("layout.gallery")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationTop">${t("layout.presentation.top")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationRight">${t("layout.presentation.right")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationBottom">${t("layout.presentation.bottom")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationLeft">${t("layout.presentation.left")}</sl-menu-item>
				</sl-menu>
			</sl-dropdown>
		`;
	}

	private onButton() {
		this.tooltip.hide();
	}

	private onLayoutSelected(event: CustomEvent) {
		const selectedItem: SlMenuItem = event.detail.item;
		const value = selectedItem.value;

		// Keep selected item checked, e.g. when double-checked.
		selectedItem.checked = true;

		for (let item of this.menu.getAllItems()) {
			// Uncheck all items, except the selected one.
			if (item.value !== selectedItem.value) {
				item.checked = false;
			}
		}

		course.layout = ConferenceLayout[value as keyof typeof ConferenceLayout];
	}
}