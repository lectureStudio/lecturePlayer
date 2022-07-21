import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MessageFeature } from '../../model/course-feature';
import { I18nLitElement, t } from '../i18n-mixin';
import { messageFormStyles } from './message-form.styles';

@customElement('message-form')
export class MessageForm extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		messageFormStyles,
	];

	@property()
	feature: MessageFeature;


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
					<input type="hidden" name="serviceId" value="${this.feature?.featureId}" />
					<textarea name="text" rows="3" placeholder="${t("course.feature.message.placeholder")}"></textarea>
				</div>
			</form>
		`;
	}
}
