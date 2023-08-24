import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { courseStore } from '../../store/course.store';
import { Component } from '../component';
import playerOfflineStyles from './player-offline.scss';

@customElement('player-offline')
export class PlayerOffline extends Component {

	static styles = [
		I18nLitElement.styles,
		playerOfflineStyles,
	];


	protected render() {
		return html`
			<div>
				<sl-icon name="course-not-available"></sl-icon>
				<strong class="text-muted py-2">${t("course.unavailable")}</strong>
				<sl-divider></sl-divider>
				<small>
					${unsafeHTML(courseStore.description)}
				</small>
			</div>
		`;
	}
}