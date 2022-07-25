import { html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';
import { CourseParticipant, CourseParticipantPresence } from '../../model/course-state';
import { I18nLitElement, t } from '../i18n-mixin';
import { participantBoxStyles } from './participant-box.styles';

@customElement('participant-box')
export class ParticipantBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantBoxStyles
	];

	@state()
	participants: CourseParticipant[] = [];

	@state()
	userId: string;

	@query(".participant-log")
	participantContainer: HTMLElement;


	override connectedCallback() {
		super.connectedCallback()

		document.addEventListener("course-participants", this.setParticipants.bind(this), false);
		document.addEventListener("course-participant-presence", this.handleParticipantPresence.bind(this), false);
	}

	protected render() {
		return html`
			<header>
				${t("course.participants")} (${this.participants.length})
			</header>
			<section>
				<div class="participants">
					<div class="participant-log">
					${repeat(this.participants, (participant) => participant.firstName, (participant, index) => html`
						<div>${participant.firstName} ${participant.familyName} ${when(participant.userId === this.userId, () => html`(${t("course.participants.me")})`, () => '')}</div>
					`)}
					</div>
				</div>
			</section>
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