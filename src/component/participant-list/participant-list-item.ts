import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { CourseParticipant, Participant } from '../../model/participant';
import { Component } from '../component';
import { observable } from 'mobx';
import participantStyles from './participant-list-item.css';

@customElement('participant-list-item')
export class ParticipantListItem extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		participantStyles
	];

	@property()
	@observable
	participant: CourseParticipant;


	protected override render() {
		return html`
			<sl-avatar shape="rounded" initials="${Participant.getInitials(this.participant)}"></sl-avatar>
			<span>${Participant.getFullName(this.participant)}</span>
			${this.renderType()}
		`;
	}

	private renderType() {
		if (this.participant.participantType !== "PARTICIPANT") {
			const type = this.participant.participantType.toLowerCase();

			return html`
				<sl-tooltip content="${t("course.role." + type)}" trigger="hover">
					<sl-icon name="${type}"></sl-icon>
				</sl-tooltip>
			`;
		}

		return null;
	}
}