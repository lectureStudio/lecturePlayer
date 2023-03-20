import { html, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { documentsButtonStyles } from './documents-button.styles';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';
import { course } from '../../model/course';
import { CourseStateDocument } from '../../model/course-state-document';

@customElement('documents-button')
export class DocumentsButton extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		documentsButtonStyles,
	];

	@query('sl-menu')
	menu: SlMenu;

	@query('sl-tooltip')
	tooltip: SlTooltip;

	@property()
	documents: Map<bigint, CourseStateDocument>;

	selectedDocId: string;


	override connectedCallback() {
		super.connectedCallback()

		document.addEventListener("course-new-document", () => {
			this.requestUpdate();
		});
	}

	protected render() {
		const documentItems = this.renderDocumentItems();

		return html`
			<sl-dropdown placement="top-start">
				<div slot="trigger">
					<sl-tooltip content="${t("controls.documents")}" trigger="hover">
						<sl-button @click="${this.onButton}">
							<sl-icon slot="prefix" library="lect-icons" name="document-collection"></sl-icon>
						</sl-button>
					</sl-tooltip>
				</div>
				<sl-menu @sl-select="${this.onDocumentSelected}">
					${documentItems}
					<sl-menu-item @click="${this.onOpenPDFDocument}">${t("documents.open.document")}</sl-menu-item>
					<sl-menu-item @click="${this.onOpenWhiteboard}">${t("documents.open.whiteboard")}</sl-menu-item>
				</sl-menu>
			</sl-dropdown>
		`;
	}

	private renderDocumentItems() {
		const itemTemplates: TemplateResult[] = [];

		if (course.documentMap) {
			const activeDoc = course.activeDocument;

			for (const doc of course.documentMap.values()) {
				const selected = activeDoc ? activeDoc.documentId === doc.documentId : false;

				if (selected) {
					this.selectedDocId = doc.documentId.toString();
				}

				itemTemplates.push(html`<sl-menu-item type="checkbox" value="${doc.documentId}" ?checked="${selected}">${doc.documentName}</sl-menu-item>`);
			}
		}

		if (itemTemplates.length > 0) {
			itemTemplates.push(html`<sl-divider></sl-divider>`);
		}

		return itemTemplates;
	}

	private onButton() {
		this.tooltip.hide();
	}

	private onOpenPDFDocument() {
		this.dispatchEvent(Utils.createEvent("lect-open-new-document"));
	}

	private onOpenWhiteboard() {
		this.dispatchEvent(Utils.createEvent("lect-open-new-whiteboard"));
	}

	private onDocumentSelected(event: CustomEvent) {
		const selectedItem: SlMenuItem = event.detail.item;
		const docId = selectedItem.value;

		if (!docId) {
			// Document control item selected.
			return;
		}

		// Keep selected item checked, e.g. when double-checked.
		selectedItem.checked = true;

		if (this.selectedDocId === docId) {
			// Same item selected.
			return;
		}

		for (let item of this.menu.getAllItems()) {
			// Uncheck all items, except the selected one.
			if (item.value !== docId) {
				item.checked = false;
			}
		}

		this.selectedDocId = docId;

		this.dispatchEvent(Utils.createEvent("lect-select-document", {
			documentId: docId
		}));
	}
}