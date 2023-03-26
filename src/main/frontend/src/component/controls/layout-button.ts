import { html} from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { layoutButtonStyles } from './layout-button.styles';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { ContentLayout, setContentLayout } from '../../model/presentation-store';
import { Utils } from '../../utils/utils';
import { course } from '../../model/course';
import { State } from '../../utils/state';

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

	@property({ type: Boolean, reflect: true })
	isSharing: boolean = false;

	@property({ type: Boolean })
	speakerMode: boolean = false;

	@property({ type: Boolean })
	isGallery: boolean = true;

	@property({ type: Boolean })
	isSpeaker: boolean = false;

	@property({ type: Boolean, reflect: true })
	isConference: boolean = false;

	override connectedCallback() {
		super.connectedCallback()
	}

	protected override firstUpdated(): void {
		// Register listeners.
		document.addEventListener("participant-screen-stream", (e: CustomEvent) => {
			this.isSharing = e.detail.state === State.CONNECTED;
		});

		this.isConference = course.conference;
	}

	protected render() {
		return html`
			<sl-dropdown placement="top-start">
				<div slot="trigger">
					<sl-tooltip content="${t("controls.settings")}" trigger="hover">
						<sl-button @click="${this.onButton}">
							<sl-icon slot="prefix" library="lect-icons" name="settings"></sl-icon>
						</sl-button>
					</sl-tooltip>
				</div>
				<sl-menu @sl-select="${this.onLayoutSelected}">
					<sl-menu-item value="settings" @click="${this.onSettings}">${t("controls.settings")}</sl-menu-item>
					<sl-menu-item value="stats" @click="${this.onStats}">${t("stats.title")}</sl-menu-item>
					<sl-menu-item class="conference-control" type="checkbox" value="Gallery" checked="" id="gallery-item">${t("layout.gallery")}</sl-menu-item>
					<sl-menu-item class="conference-control" type="checkbox" value="Speaker"id="speaker-item">${t("layout.speaker")}</sl-menu-item>
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

		// if speaker layout is selected
		if (value === "Speaker" && !this.isSpeaker) {
			this.isSpeaker = true;
			setContentLayout(ContentLayout.PresentationLeft);
			this.dispatchEvent(Utils.createEvent("speaker-view", this.isSpeaker));
		}
		else if (value === "Gallery") {
			this.isSpeaker = false;
			setContentLayout(ContentLayout.Gallery);
			this.dispatchEvent(Utils.createEvent("speaker-view", this.isSpeaker));
		}

		// Keep selected item checked, e.g. when double-checked.
		if (selectedItem.type === "checkbox") {
			selectedItem.checked = true;
		
		
			for (let item of this.menu.getAllItems()) {
				// Uncheck all items, except the selected one.
				if (item.value !== selectedItem.value && item.type === "checkbox") {
					item.checked = false;
				}
			}

			//setContentLayout(ContentLayout[value as keyof typeof ContentLayout]);
			
		}
	}

	private onSettings(): void {
		this.dispatchEvent(Utils.createEvent("player-settings"));
	}

	private onStats(): void {
		this.dispatchEvent(Utils.createEvent("player-stats"));
	}
}