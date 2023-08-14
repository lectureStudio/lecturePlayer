import { Component } from '../component';
import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { ChatRecipientType } from '../../service/message.service';
import { privilegeStore } from '../../store/privilege.store';
import { participantStore } from '../../store/participants.store';
import { userStore } from '../../store/user.store';
import messageFormStyles from './message-form.scss';

@customElement('message-form')
export class MessageForm extends Component {

	static styles = [
		I18nLitElement.styles,
		messageFormStyles,
	];

	@query('#recipients')
	private recipientSelect: HTMLSelectElement;

	private selectedRecipient: string;


	override connectedCallback() {
		super.connectedCallback()
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
			const recipient = participantStore.findByUserId(this.selectedRecipient);

			this.recipientSelect.value = recipient ? this.selectedRecipient : null;
		}
	}

	protected override render() {
		const canWriteToAll = privilegeStore.canWriteMessagesToAll();
		const canWriteToOrga = privilegeStore.canWriteMessagesToOrganisators();
		const optionTemplates = [];

		if (privilegeStore.canWritePrivateMessages()) {
			for (const participant of participantStore.participants) {
				if (participant.userId !== userStore.userId) {
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
				<div class="message-container">
					<sl-textarea name="text" placeholder="${t("course.feature.message.placeholder")}" rows="2" resize="none" size="small"></sl-textarea>
					<slot name="right-pane"></slot>
				</div>
			</form>
		`;
	}

	private onRecipient() {
		// Save recipient due to re-rendering of the selection component.
		this.selectedRecipient = this.recipientSelect.value;
	}
}
