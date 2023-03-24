import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { participantBoxStyles } from './participants-box.styles';
import { participants } from '../../model/participants';
import { course } from '../../model/course';

@customElement('participants-box')
export class ParticipantsBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantBoxStyles
	];

	@query(".participant-log")
	participantContainer: HTMLElement;


	override connectedCallback() {
		super.connectedCallback()

		participants.addEventListener("all", () => { this.requestUpdate() }, false);
		participants.addEventListener("added", () => { this.requestUpdate() }, false);
		participants.addEventListener("removed", () => { this.requestUpdate() }, false);
		participants.addEventListener("cleared", () => { this.requestUpdate() }, false);
	}

	protected render() {
		const templates = [];

		for (const participant of participants.participants) {
			let name = `${participant.firstName} ${participant.familyName}`;
			let type;

			if (participant.userId === course.userId) {
				name += ` (${t("course.participants.me")})`;
			}

			switch (participant.participantType) {
				case 'ORGANISATOR':
				case 'CO_ORGANISATOR':
					const lower = participant.participantType.toLowerCase();

					type = html`
						<sl-tooltip content="${t("course.role." + lower)}" trigger="hover">
							<sl-icon library="lect-icons" name="${lower}" id="participant-type"></sl-icon>
						</sl-tooltip>
					`;
					break;
			}

			templates.push(html`
				<div class="participant">
					<span>${name}</span>
					${type}
				</div>
			`);
		}

		return html`
			<header>
				${t("course.participants")} (${participants.participants.length})
			</header>
			<section>
				<div class="participants">
					<div class="participant-log">
						${templates}
					</div>
				</div>
			</section>
		`;
	}
}