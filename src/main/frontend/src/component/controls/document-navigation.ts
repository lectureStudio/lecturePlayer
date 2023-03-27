import { SlColorPicker } from '@shoelace-style/shoelace';
import { html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Color } from '../../paint/color';
import { ToolType } from '../../tool/tool';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { documentNavigationStyles } from './document-navigation.styles';
import $documentStore, { setPage } from "../../model/document-store";
import $toolStore, { setToolType, setToolColor } from "../../model/tool-store";

@customElement('document-navigation')
export class DocumentNavigation extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		documentNavigationStyles,
	];

	private readonly pageChangeListener = this.onPageChanged.bind(this);

	@query("sl-color-picker")
	colorPicker: SlColorPicker;

	@state()
	toolType: ToolType;


	override connectedCallback(): void {
		super.connectedCallback();

		$toolStore.watch(store => {
			this.toolType = store.selectedToolType;
		});
		$documentStore.watch(() => {
			this.requestUpdate();
		});
		setPage.watch(page => {
			// Observe page shape changes, e.g. to update the undo/redo state.
			const prevPage = $documentStore.getState().selectedPage;

			if (prevPage) {
				prevPage.removeChangeListener(this.pageChangeListener);
			}
			if (page) {
				page.addChangeListener(this.pageChangeListener);
			}
		});

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
		this.toolType = $toolStore.getState().selectedToolType;
	}

	protected updated() {
		this.renderRoot.querySelectorAll(".tool-button")
			.forEach(element => {
				element.classList.remove("tool-button-active");

				const type = this.getButtonToolType(element as HTMLElement)

				if (this.toolType === type) {
					element.classList.add("tool-button-active");
				}
			});
	}

	protected render() {
		const documentState = $documentStore.getState();
		const prevEnabled = documentState.selectedPageNumber > 0;
		const nextEnabled = documentState.selectedPageNumber < documentState.selectedDocument?.getPageCount() - 1;
		const undoEnabled = documentState.selectedPage?.canUndo();
		const redoEnabled = documentState.selectedPage?.canRedo();

		const toolState = $toolStore.getState();
		const currentColor = toolState.selectedToolBrush?.color.toRgba();
		const swatches = toolState.selectedToolSettings?.colorPalette.map(color => color.toRgba()) || [];

		return html`
			<sl-tooltip content="${t("controls.documents.page.prev")}" trigger="hover">
				<sl-icon-button @click="${this.onPreviousSlide}" ?disabled="${!prevEnabled}" library="lect-icons" name="prev-page" class="document-toolbar-button"></sl-icon>
			</sl-tooltip>
			<span class="document-page-number">${documentState.selectedPageNumber + 1}</span>
			<sl-tooltip content="${t("controls.documents.page.next")}" trigger="hover">
				<sl-icon-button @click="${this.onNextSlide}" ?disabled="${!nextEnabled}" library="lect-icons" name="next-page" class="document-toolbar-button"></sl-icon>
			</sl-tooltip>
			<sl-divider vertical></sl-divider>
			<sl-tooltip content="${t("controls.tools.undo")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" ?disabled="${!undoEnabled}" data-type="UNDO" library="lect-icons" name="undo-tool" class="document-toolbar-button tool-button"></sl-icon-button>
			</sl-tooltip>
			<sl-tooltip content="${t("controls.tools.redo")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" ?disabled="${!redoEnabled}" data-type="REDO" library="lect-icons" name="redo-tool" class="document-toolbar-button tool-button"></sl-icon-button>
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
			<sl-tooltip content="${t("controls.tools.highlighter")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" data-type="HIGHLIGHTER" library="lect-icons" name="highlighter-tool" class="document-toolbar-button tool-button"></sl-icon>
			</sl-tooltip>
			<sl-divider vertical></sl-divider>
			<sl-tooltip content="${t("controls.tools.rubber")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" data-type="RUBBER" library="lect-icons" name="rubber-tool" class="document-toolbar-button tool-button"></sl-icon>
			</sl-tooltip>
			<sl-tooltip content="${t("controls.tools.clear")}" trigger="hover">
				<sl-icon-button @click="${this.onTool}" data-type="DELETE_ALL" library="lect-icons" name="clear-tool" class="document-toolbar-button tool-button"></sl-icon>
			</sl-tooltip>
			<sl-divider vertical></sl-divider>
			<sl-color-picker @sl-change="${this.onToolColor}" .swatches="${swatches}" value="${currentColor}" ?disabled="${!currentColor}" format="rgb" label="Select a color" size="small" opacity no-format-toggle></sl-color-picker>
		`;
	}

	private onPreviousSlide() {
		this.dispatchEvent(Utils.createEvent("lect-document-prev-page"));
	}

	private onNextSlide() {
		this.dispatchEvent(Utils.createEvent("lect-document-next-page"));
	}

	private onTool(event: Event) {
		this.toolType = this.getButtonToolType(event.target as HTMLElement);

		setToolType(this.toolType);
	}

	private onToolColor() {
		setToolColor(Color.fromRGBString(this.colorPicker.value));
	}

	private onPageChanged() {
		this.requestUpdate();
	}

	private getButtonToolType(button: HTMLElement) {
		const type = button.dataset.type;

		if (type) {
			return ToolType[type as keyof typeof ToolType];
		}

		return null;
	}
}