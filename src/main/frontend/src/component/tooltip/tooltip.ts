import { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { tooltipStyles } from './tooltip.styles';
import tippy, { Instance, Props, sticky } from 'tippy.js';

@customElement('ui-tooltip')
export class PlayerTooltip extends I18nLitElement {

	static styles = [
		tooltipStyles,
	];

	private props: Instance<Props>;

	@property({ attribute: true })
	sticky: boolean = false;

	@property({ attribute: true })
	for: string;

	@property({ attribute: true })
	text: string;

	newText: string;


	protected override firstUpdated() {
		let target;

		if (this.parentElement && this.parentElement.id == this.for) {
			target = this.parentElement;
		}
		else if (this.previousElementSibling && this.previousElementSibling.id == this.for) {
			target = this.previousElementSibling;
		}

		this.props = tippy(target, {
			content: this.text ? this.text : this.textContent,
			allowHTML: false,
			arrow: true,
			animation: 'shift-away-subtle',
			trigger: 'mouseenter',
			interactive: true,
			sticky: this.sticky ? 'popper' : false,
			plugins: [sticky],
			onHidden: (instance) => {
				if (this.newText) {
					instance.setContent(this.newText);
					this.newText = null;
				}
			},
		});
	}

	protected updated(changedProperties: PropertyValues): void {
		if (changedProperties.has("text")) {
			if (this.props.state.isMounted) {
				this.newText = this.text;
			}
			else {
				this.props.setContent(this.text);
			}
		}
	}
}