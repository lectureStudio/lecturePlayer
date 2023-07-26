import { html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { PrivilegeService } from '../../service/privilege.service';
import { I18nLitElement, t } from '../i18n-mixin';
import { messageFormStyles } from './message-form.styles';
import { participants } from '../../model/participants';
import { course } from '../../model/course';
import { ChatRecipientType } from '../../service/message.service';

@customElement('message-form')
export class MessageForm extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		messageFormStyles,
	];

	@state()
	privilegeService: PrivilegeService;

	@query('#recipients')
	private recipientSelect: HTMLSelectElement;

	private selectedRecipient: string;


	override connectedCallback() {
		super.connectedCallback()

		participants.addEventListener("all", () => { this.requestUpdate() }, false);
		participants.addEventListener("added", () => { this.requestUpdate() }, false);
		participants.addEventListener("removed", () => { this.requestUpdate() }, false);
		participants.addEventListener("cleared", () => { this.requestUpdate() }, false);
	}

	protected override updated() {
		// Keep the previous recipient selected.
		if (!this.selectedRecipient || this.selectedRecipient === ChatRecipientType.Public) {
			this.recipientSelect.value = ChatRecipientType.Public;
		}
		else if (this.selectedRecipient === ChatRecipientType.Organisers) {
			this.recipientSelect.value = ChatRecipientType.Organisers;
		}
		else {
			const recipient = participants.participants.find(participant => participant.userId === this.selectedRecipient);

			this.recipientSelect.value = recipient ? this.selectedRecipient : null;
		}
	}

	protected override render() {
		const canWriteToAll = this.privilegeService.canWriteMessagesToAll();
		const canWriteToOrga = this.privilegeService.canWriteMessagesToOrganisators();
		const optionTemplates = [];

		if (this.privilegeService.canWritePrivateMessages()) {
			for (const participant of participants.participants) {
				if (participant.userId !== course.userId) {
					optionTemplates.push(html`<sl-option value="${participant.userId}">${participant.firstName} ${participant.familyName}</sl-option>`);
				}
			}
		}

		const allOption = canWriteToAll
			? html`<sl-option value="${ChatRecipientType.Public}">${t("course.feature.message.target.all")}</sl-option>`
			: '';

		const organisatorsOption = canWriteToOrga
			? html`<sl-option value="${ChatRecipientType.Organisers}">${t("course.feature.message.target.organisers")}</sl-option>`
			: '';

		if (optionTemplates.length > 0 && (canWriteToAll || canWriteToOrga)) {
			optionTemplates.unshift(html`<sl-divider></sl-divider>`);
		}

		return html`
			<form id="course-message-form">
				<div class="recipient-container">
					<span>${t("course.feature.message.target")}</span>
					<sl-select @sl-change=${this.onRecipient} name="recipient" id="recipients" size="small" hoist>
						${allOption}
						${organisatorsOption}
						${optionTemplates}
					</sl-select>
				</div>
				<sl-textarea name="text" placeholder="${t("course.feature.message.placeholder")}" rows="2" resize="none" size="small"></sl-textarea>
			</form>
		`;
	}

	private onRecipient() {
		// Save recipient due to re-rendering of the selection component.
		this.selectedRecipient = this.recipientSelect.value;
	}
}
