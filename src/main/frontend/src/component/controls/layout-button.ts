import { html, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { layoutButtonStyles } from './layout-button.styles';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';

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
							<span slot="prefix" class="icon-layout"></span>
						</sl-button>
					</sl-tooltip>
				</div>
				<sl-menu @sl-select="${this.onLayoutSelected}">
					<sl-menu-item type="checkbox" value="Gallery" checked="" @click="${this.onSelectGalleryLayout}">${t("layout.gallery")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationTop" @click="${this.onSelectPresentationTopLayout}">${t("layout.presentation.top")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationRight" @click="${this.onSelectPresentationRightLayout}">${t("layout.presentation.right")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationBottom" @click="${this.onSelectPresentationBottomLayout}">${t("layout.presentation.bottom")}</sl-menu-item>
					<sl-menu-item type="checkbox" value="PresentationLeft" @click="${this.onSelectPresentationLeftLayout}">${t("layout.presentation.left")}</sl-menu-item>
				</sl-menu>
			</sl-dropdown>
		`;
	}

	private onButton() {
		this.tooltip.hide();
	}

	private onSelectGalleryLayout() {
		this.dispatchEvent(Utils.createEvent("lect-select-layout", {
			layout: "Gallery"
		}));
	}

	private onSelectPresentationTopLayout() {
		this.dispatchEvent(Utils.createEvent("lect-select-layout", {
			layout: "PresentationTop"
		}));
	}

	private onSelectPresentationRightLayout() {
		this.dispatchEvent(Utils.createEvent("lect-select-layout", {
			layout: "PresentationRight"
		}));
	}

	private onSelectPresentationBottomLayout() {
		this.dispatchEvent(Utils.createEvent("lect-select-layout", {
			layout: "PresentationBottom"
		}));
	}

	private onSelectPresentationLeftLayout() {
		this.dispatchEvent(Utils.createEvent("lect-select-layout", {
			layout: "PresentationLeft"
		}));
	}

	private onLayoutSelected(event: CustomEvent) {
		console.log("layout selected", event)
		const selectedItem: SlMenuItem = event.detail.item;

		// Keep selected item checked, e.g. when double-checked.
		selectedItem.checked = true;

		for (let item of this.menu.getAllItems()) {
			// Uncheck all items, except the selected one.
			if (item.value !== selectedItem.value) {
				item.checked = false;
			}
		}
	}
}