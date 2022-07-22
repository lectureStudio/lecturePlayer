import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { messageFormStyles } from './message-form.styles';

@customElement('message-form')
export class MessageForm extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		messageFormStyles,
	];


	render() {
		return html`
			<form id="course-message-form">
				<div class="controls">
					<span>${t("course.feature.message.target")}</span>
					<select name="target" class="form-select form-select-sm" aria-label=".form-select-sm">
						<option value="public" selected>${t("course.feature.message.target.all")}</option>
					</select>
				</div>
				<div>
					<textarea name="text" rows="3" placeholder="${t("course.feature.message.placeholder")}"></textarea>
				</div>
			</form>
		`;
	}
}
