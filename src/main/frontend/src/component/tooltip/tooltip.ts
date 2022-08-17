import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { tooltipStyles } from './tooltip.styles';
import tippy from 'tippy.js';

@customElement('ui-tooltip')
export class PlayerLoading extends I18nLitElement {

	static styles = [
		tooltipStyles,
	];

	@property({ attribute: true, reflect: true })
	for: string;


	protected override firstUpdated() {
		let target;

		if (this.parentElement.id == this.for) {
			target = this.parentElement;
		}
		else if (this.previousElementSibling.id == this.for) {
			target = this.previousElementSibling;
		}

		tippy(target, {
			content: this.textContent,
			allowHTML: false,
			arrow: true,
			animation: 'shift-away-subtle',
			trigger: 'mouseenter',
			interactive: true,
		});
	}
}