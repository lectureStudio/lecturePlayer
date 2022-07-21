import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { chatMessageStyles } from './chat-message.styles';

@customElement('chat-message')
export class ChatMessage extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		chatMessageStyles,
	];

	timestamp: string;

	content: string;

	originator: string;

	@property({ type: Boolean, reflect: true })
	myself: boolean;

	@property({ type: Boolean, reflect: true })
	private: boolean;


	protected render() {
		const fromUser = this.myself ? t("course.feature.message.me") : this.originator;

		return html`
			<div class="message-head">
				<span class="message-time">${this.timestamp}</span>
				<span class="message-originator">${fromUser}</span>

				${this.private ? html`
				<span class="message-private">${t("course.feature.message.privately")}</span>
				` : ''}
			</div>
			<div class="chat-message-boxed">
				<div class="chat-message-content">
					${this.content}
				</div>
			</div>
		`;
	}
}