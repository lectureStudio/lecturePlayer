import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { messageFormStyles } from './message-form.styles';

@customElement('message-form')
export class MessageForm extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		messageFormStyles,
	];

	@property()
	courseId: number;

	@property()
	featureId: string;


	render() {
		return html`
			<form id="course-message-form" action="/course/message/post/${this.courseId}" method="post">
				<input type="hidden" name="serviceId" value="${this.featureId}" />
				<textarea name="text" rows="3" placeholder="${t("course.feature.message.placeholder")}"></textarea>
			</form>
		`;
	}
}
