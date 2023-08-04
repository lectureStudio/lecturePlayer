import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { CourseParticipant } from '../../model/course-state';
import { participantStyles } from './participant.styles';
import { userStore } from '../../store/user.store';

@customElement('course-participant')
export class ParticipantItem extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantStyles
	];

	@property()
	participant: CourseParticipant;


	protected render() {
		return html`
			<sl-avatar shape="rounded" initials="${ParticipantItem.getInitials(this.participant)}"></sl-avatar>
			<span>${ParticipantItem.getName(this.participant)}</span>
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

	static getInitials(participant: CourseParticipant) {
		return `${participant.firstName.charAt(0)}${participant.familyName.charAt(0)}`;
	}

	static getName(participant: CourseParticipant) {
		let name = `${participant.firstName} ${participant.familyName}`;

		if (participant.userId === userStore.userId) {
			name += ` (${t("course.participants.me")})`;
		}

		return name;
	}
}