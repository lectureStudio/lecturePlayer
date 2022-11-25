import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { playerTabsStyles } from './tabs.styles';

@customElement('player-tabs')
export class PlayerTabs extends I18nLitElement {

	static styles = [
		playerTabsStyles,
	];

	private _tabs: HTMLElement[];

	private _panels: HTMLElement[];


	constructor() {
		super();

		this._tabs = Array.from(this.querySelectorAll("[slot=tab]"));
		this._panels = Array.from(this.querySelectorAll("[slot=panel]"));

		this.selectTab(0);
	}

	selectTab(index: number) {
		this._tabs.forEach((tab) => tab.removeAttribute("selected"));
		this._tabs[index].setAttribute("selected", "");
		this._panels.forEach((panel) => panel.removeAttribute("selected"));
		this._panels[index].setAttribute("selected", "");
	}

	handleSelect(e: Event) {
		const index = this._tabs.indexOf(e.target as HTMLElement);

		this.selectTab(index);
	}

	render() {
		return html`
			<nav>
				<slot name="tab" @click=${this.handleSelect}></slot>
			</nav>
			<slot name="panel"></slot>
		`;
	}
}