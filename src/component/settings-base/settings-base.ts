import { CSSResultGroup } from "lit";
import { Component } from "../component";
import { I18nLitElement } from "../i18n-mixin";
import styles from './settings-base.css';

export abstract class SettingsBase extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];


	constructor() {
		super();
	}
}
