import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { settingsModalStyles } from './settings-modal.styles';
import "web-dialog/index";

@customElement("settings-modal")
export class SettingsModal extends I18nLitElement {

	// static styles = [
	// 	settingsModalStyles,
	// ];

	@property({ type: Boolean, reflect: true })
	show: boolean = false;

	@property({ type: String, reflect: true })
	title: string;


	close() {
		this.show = false;
	}

	handleClick() {
		this.dispatchEvent(new CustomEvent("button-click"));
		this.close();
	}

	render() {
		console.log("render SettingsModal");

		return html`
			<web-dialog center open>
				<header>
					<h3>The standard Lorem Ipsum passage</h3>
				</header>
				<article>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing...</p>
				</article>
				<footer>
					<button>Okay...</button>
				</footer>
			</web-dialog>
		`;
	}
}