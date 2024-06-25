import { Router } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { Component } from '../component';
import { t } from "i18next";
import style from './course-no-access.css';

@customElement('course-no-access')
export class CourseNoAccess extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		style,
	];


	private home() {
		// Navigate to the home page.
		Router.go("/")
	}

	protected override render() {
		return html`
			<div>
				<sl-icon name="shield-x"></sl-icon>
				<strong>${t("course.no_access.title")}</strong>
				<p>${t("course.no_access.description")}</p>
				<sl-button @click="${this.home}" variant="default">${t("course.overview")}</sl-button>
			</div>
		`;
	}
}
