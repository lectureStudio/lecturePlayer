import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { participantBoxStyles } from './participant-box.styles';
import { participants } from '../../model/participants';
import { course } from '../../model/course';
import { PrivilegeService } from '../../service/privilege.service';

@customElement('participant-box')
export class ParticipantBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantBoxStyles
	];

	@property()
	privilegeService: PrivilegeService;

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

			if (participant.userId === course.userId) {
				name += ` (${t("course.participants.me")})`;
			}
			if (participant.participantType && participant.participantType !== "PARTICIPANT") {
				name += ` (${t("course.role." + participant.participantType.toLowerCase())})`;
			}

			templates.push(html`<div>${name}</div>`);
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