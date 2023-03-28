import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { JanusService } from '../../service/janus.service';

@customElement("stats-modal")
export class StatsModal extends Modal {

	janusService: JanusService;

	protected override render() {
		return html`
			<sl-dialog label="${t("stats.title")}">	
				<stream-stats .janusService="${this.janusService}"></stream-stats>
			</sl-dialog>
		`;
	}
}