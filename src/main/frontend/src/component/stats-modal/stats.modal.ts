import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { Utils } from '../../utils/utils';
import { statsModalStyles } from './stats.modal.styles';
import { JanusService } from '../../service/janus.service';

@customElement("stats-modal")
export class StatsModal extends Modal {

	static styles = [
		Modal.styles,
		statsModalStyles
	];

	janusService: JanusService;

	protected override render() {
		return html`
			<sl-dialog label="${t("stats.title")}">	
				<stream-stats .janusService="${this.janusService}"></stream-stats>
			</sl-dialog>
		`;
	}
}