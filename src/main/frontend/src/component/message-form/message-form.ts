import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { CourseParticipant, CourseParticipantPresence } from '../../model/course-state';
import { I18nLitElement, t } from '../i18n-mixin';
import { messageFormStyles } from './message-form.styles';

@customElement('message-form')
export class MessageForm extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		messageFormStyles,
	];

	@state()
	participants: CourseParticipant[] = [];

	@state()
	userId: string;


	override connectedCallback() {
		super.connectedCallback()

		document.addEventListener("course-participants", this.setParticipants.bind(this), false);
		document.addEventListener("course-participant-presence", this.handleParticipantPresence.bind(this), false);
	}

	protected render() {
		const optionTemplates = [];

		for (const participant of this.participants) {
			optionTemplates.push(html`<option value="${participant.userId}">${participant.firstName} ${participant.familyName}</div>`);
		}

		return html`
			<form id="course-message-form">
				<div class="controls">
					<span>${t("course.feature.message.target")}</span>
					<select name="target" class="form-select form-select-sm" aria-label=".form-select-sm">
						<option value="public" selected>${t("course.feature.message.target.all")}</option>
						${optionTemplates}
					</select>
				</div>
				<div>
					<textarea name="text" rows="3" placeholder="${t("course.feature.message.placeholder")}"></textarea>
				</div>
			</form>
		`;
	}

	private setParticipants(event: CustomEvent) {
		this.participants = event.detail;
		this.requestUpdate();
	}

	private handleParticipantPresence(event: CustomEvent) {
		const participant: CourseParticipantPresence = event.detail.participant;

		// React only to events originated from other participants.
		if (participant.userId !== this.userId) {
			this.participants = event.detail.participants;
			this.requestUpdate();
		}
	}
}
