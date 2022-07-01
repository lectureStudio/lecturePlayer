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
				<input type="hidden" name="serviceId" value="${this.feature?.featureId}" />
				<textarea name="text" rows="3" placeholder="${t("course.feature.message.placeholder")}"></textarea>
			</form>
		`;
	}
}
