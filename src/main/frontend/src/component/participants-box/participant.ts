import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { course } from '../../model/course';
import { CourseParticipant } from '../../model/course-state';
import { participantStyles } from './participant.styles';

@customElement('course-participant')
export class ParticipantItem extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantStyles
	];

	@property()
	participant: CourseParticipant;


	protected render() {
		let name = `${this.participant.firstName} ${this.participant.familyName}`;

		if (this.participant.userId === course.userId) {
			name += ` (${t("course.participants.me")})`;
		}

		const initials = `${this.participant.firstName.charAt(0)}${this.participant.familyName.charAt(0)}`;

		return html`
			<sl-avatar shape="rounded" initials="${initials}" label="${name}"></sl-avatar>
			<span>${name}</span>
			${this.renderType()}
		`;
	}

	private renderType() {
		if (this.participant.participantType !== "PARTICIPANT") {
			const type = this.participant.participantType.toLowerCase();

			return html`
				<sl-tooltip content="${t("course.role." + type)}" trigger="hover">
					<span class="participant-type icon-${type}"></span>
				</sl-tooltip>
			`;
		}

		return null;
	}
}