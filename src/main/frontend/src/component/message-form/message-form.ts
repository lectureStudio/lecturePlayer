import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
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
		const optionTemplates = [];

		if (PrivilegeService.canWritePrivateMessages()) {
			for (const participant of participants.participants) {
				if (participant.userId !== course.userId) {
					optionTemplates.push(html`<sl-option value="${participant.userId}">${participant.firstName} ${participant.familyName}</sl-option>`);
				}
			}
		}

		const allOption = PrivilegeService.canWriteMessagesToAll()
			? html`<sl-option value="${ChatRecipientType.Public}">${t("course.feature.message.target.all")}</sl-option>`
			: '';

		const organisatorsOption = PrivilegeService.canWriteMessagesToOrganisators()
			? html`<sl-option value="${ChatRecipientType.Organisers}">${t("course.feature.message.target.organisers")}</sl-option>`
			: '';

		return html`
			<form id="course-message-form">
				<div class="controls">
					<span>${t("course.feature.message.target")}</span>
					<sl-select @sl-change=${this.onRecipient} name="recipient" id="recipients" size="small" placement="top">
						${allOption}
						${organisatorsOption}
						${optionTemplates}
					</sl-select>
				</div>
				<div>
					<sl-textarea name="text" rows="3" resize="none" placeholder="${t("course.feature.message.placeholder")}"></sl-textarea>
				</div>
			</form>
		`;
	}

	private onRecipient() {
		// Save recipient due to re-rendering of the selection component.
		this.selectedRecipient = this.recipientSelect.value;
	}
}
