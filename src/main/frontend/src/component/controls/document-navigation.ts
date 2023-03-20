import { SlColorPicker } from '@shoelace-style/shoelace';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { course } from '../../model/course';
import { CourseStateDocument } from '../../model/course-state-document';
import { toolStore } from '../../model/tool-store';
import { Color } from '../../paint/color';
import { ToolType } from '../../tool/tool';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { documentNavigationStyles } from './document-navigation.styles';

@customElement('document-navigation')
export class DocumentNavigation extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		documentNavigationStyles,
	];

	@property()
	document: CourseStateDocument;

	@state()
	toolType: ToolType;


	override connectedCallback(): void {
		super.connectedCallback();

		course.addEventListener("course-document-state", () => { this.requestUpdate() }, false);

		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.defaultPrevented) {
				return;
			}

			switch (event.code) {
				case "ArrowDown":
				case "ArrowRight":
					this.onNextSlide();
					break;

				case "ArrowUp":
				case "ArrowLeft":
					this.onPreviousSlide();
					break;
			}
		}, false);
	}

	protected firstUpdated() {
		this.selectToolButton(toolStore.selectedToolType);
	}

	protected render() {
		const prevEnabled = course.documentState?.currentPage > 0;
		const nextEnabled = course.documentState?.currentPage < course.documentState?.pageCount - 1;

		return html`
			<sl-tooltip content="${t("controls.documents.page.prev")}" trigger="hover">
				<sl-icon-button @click="${this.onPreviousSlide}" ?disabled="${!prevEnabled}" library="lect-icons" name="prev-page" class="document-toolbar-button"></sl-icon>
			</sl-tooltip>
			<sl-tooltip content="${t("controls.documents.page.next")}" trigger="hover">
				<sl-icon-button @click="${this.onNextSlide}" ?disabled="${!nextEnabled}" library="lect-icons" name="next-page" class="document-toolbar-button"></sl-icon>
			</sl-tooltip>
			<sl-divider vertical></sl-divider>
			<sl-tooltip content="${t("controls.tools.cursor")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" data-type="CURSOR" library="lect-icons" name="mouse-pointer" class="document-toolbar-button tool-button"></sl-icon-button>
			</sl-tooltip>
			<sl-tooltip content="${t("controls.tools.pointer")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" data-type="POINTER" library="lect-icons" name="pointer-tool" class="document-toolbar-button tool-button"></sl-icon>
			</sl-tooltip>
			<sl-tooltip content="${t("controls.tools.pen")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" data-type="PEN" library="lect-icons" name="pen-tool" class="document-toolbar-button tool-button"></sl-icon>
			</sl-tooltip>
			<sl-divider vertical></sl-divider>
			<sl-color-picker @sl-change="${this.onToolColor}" value="${toolStore.selectedToolBrush.color.toRgba()}" format="rgb" label="Select a color" swatches="#d0021b; #f5a623; #f8e71c; #8b572a; #7ed321;" size="small"></sl-color-picker>
		`;
	}

	private onPreviousSlide() {
		this.dispatchEvent(Utils.createEvent("lect-document-prev-page"));
	}

	private onNextSlide() {
		this.dispatchEvent(Utils.createEvent("lect-document-next-page"));
	}

	private onTool(event: Event) {
		this.selectToolButton(this.getButtonToolType(event.target as HTMLElement));
	}

	private onToolColor(event: Event) {
		const picker = event.target as SlColorPicker;

		toolStore.selectedToolBrush.color = Color.fromRGBString(picker.value);
	}

	private selectToolButton(typeToSelect: ToolType) {
		if (!typeToSelect) {
			return;
		}

		this.renderRoot.querySelectorAll(".tool-button")
			.forEach(element => {
				element.classList.remove("tool-button-active");

				const type = this.getButtonToolType(element as HTMLElement)

				if (typeToSelect === type) {
					element.classList.add("tool-button-active");

					this.toolType = type;

					toolStore.selectedToolType = type;
				}
			});
	}

	private getButtonToolType(button: HTMLElement) {
		const type = button.dataset.type;

		if (type) {
			return ToolType[type as keyof typeof ToolType];
		}

		return null;
	}
}