import {CSSResultGroup, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {I18nLitElement} from '../i18n-mixin';
import {Component} from '../component';
import {t} from "i18next";
import style from './course-list.css';

@customElement('course-list')
export class CourseList extends Component {

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
				<sl-details summary="Toggle Me">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
					aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</sl-details>
			</div>
		`;
	}
}
