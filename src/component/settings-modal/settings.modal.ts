import { CSSResultGroup, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { Utils } from '../../utils/utils';
import { SlTab, SlTabPanel } from '@shoelace-style/shoelace';
import styles from "./settings.modal.css";

@customElement("settings-modal")
export class SettingsModal extends Modal {

	static override styles = <CSSResultGroup>[
		Modal.styles,
		styles
	];

	@property()
	accessor section: string = "audio";

	@query('camera-settings')
	accessor cameraSettings: any;

	@query('sound-settings')
	accessor soundSettings: any;


	save() {
		// TODO

		this.dispatchEvent(Utils.createEvent("device-settings-saved"));
		this.close();
	}

	cancel() {
		this.dispatchEvent(Utils.createEvent("device-settings-canceled"));
		this.close();
	}

	protected override firstUpdated(): void {
		super.firstUpdated();

		// Select and show the desired settings content/section.
		if (this.section && this.shadowRoot) {
			const tab: SlTab | null = this.shadowRoot.querySelector(`sl-tab[panel=${this.section}]`);
			const tabPanel: SlTabPanel | null = this.shadowRoot.querySelector(`sl-tab-panel[name=${this.section}]`);

			if (tab && tabPanel) {
				tab.active = true;
				tabPanel.active = true;

				this.onTab(tabPanel.name);
			}
		}
	}

	protected override render() {
		return html`
			<sl-dialog label="${t("settings.title")}">
				<sl-tab-group @sl-tab-show="${(event: CustomEvent) => { this.onTab(event.detail.name) }}">
					<sl-tab slot="nav" panel="audio">${t("settings.audio")}</sl-tab>
					<sl-tab slot="nav" panel="video">${t("settings.camera")}</sl-tab>

					<sl-tab-panel name="audio">
						<sound-settings></sound-settings>
					</sl-tab-panel>
					<sl-tab-panel name="video">
						<camera-settings></camera-settings>
					</sl-tab-panel>
				</sl-tab-group>
				<div slot="footer">
					<sl-button @click="${this.cancel}" variant="default" size="small">${t("settings.close")}</sl-button>
				</div>
			</sl-dialog>
		`;
	}

	private onTab(name: string) {
		if (name === "audio") {
			this.soundSettings.queryDevices();
		}
		else if (name === "video") {
			this.cameraSettings.queryDevices();
		}
	}
}
