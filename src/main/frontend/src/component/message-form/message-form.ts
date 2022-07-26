import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { CourseParticipant, CoursePrivilege } from '../../model/course-state';
import { PrivilegeService } from '../../service/privilege.service';
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
	privilegeService: PrivilegeService;


	protected render() {
		const optionTemplates = [];

		if (this.privilegeService.canWritePrivateMessages()) {
			for (const participant of this.participants) {
				optionTemplates.push(html`<option value="${participant.userId}">${participant.firstName} ${participant.familyName}</div>`);
			}
		}

		return html`
			<form id="course-message-form">
				<div class="controls">
					<span>${t("course.feature.message.target")}</span>
					<select name="recipient" class="form-select form-select-sm" aria-label=".form-select-sm">
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
}
