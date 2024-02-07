import {CSSResultGroup, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {I18nLitElement} from '../i18n-mixin';
import {Component} from '../component';
import style from './no-access.css';
import {t} from "i18next";

@customElement('player-no-access')
export class PlayerNoAccess extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		style,
	];


	private home() {
		// Use location to navigate to the home page.
		location.assign("/")
	}

	protected override render() {
		return html`
			<div>
				<sl-icon name="shield-x"></sl-icon>
				<h1>${t("course.no_access.title")}</h1>
				<p>${t("course.no_access.description")}</p>
				<sl-button @click="${this.home}" variant="default">${t("course.overview")}</sl-button>
			</div>
		`;
	}
}
