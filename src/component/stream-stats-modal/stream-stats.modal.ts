import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';

@customElement("stream-stats-modal")
export class StreamStatsModal extends Modal {

	protected override render() {
		return html`
			<sl-dialog label="${t("stats.title")}">
				<stream-stats></stream-stats>
				<div slot="footer">
					<sl-button @click="${this.close}" variant="default" size="small">${t("settings.close")}</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}