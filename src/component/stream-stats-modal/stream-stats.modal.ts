import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { EventEmitter } from '../../utils/event-emitter';

@customElement("stream-stats-modal")
export class StreamStatsModal extends Modal {

	eventEmitter: EventEmitter;


	protected override render() {
		return html`
			<sl-dialog label="${t("stats.title")}">
				<stream-stats .eventEmitter="${this.eventEmitter}"></stream-stats>
				<div slot="footer">
					<sl-button @click="${this.close}" variant="default" size="small">${t("settings.close")}</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}