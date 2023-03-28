import { html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { documentsButtonStyles } from './documents-button.styles';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';
import { CourseStateDocument } from '../../model/course-state-document';
import $documentStore from "../../model/document-store";

@customElement('documents-button')
export class DocumentsButton extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		documentsButtonStyles,
	];

	@state()
	disabled: boolean;

	@query('sl-menu')
	menu: SlMenu;

	@query('sl-tooltip')
	tooltip: SlTooltip;

	@property()
	documents: Map<bigint, CourseStateDocument>;

	selectedDocId: string;


	override connectedCallback() {
		super.connectedCallback()

		$documentStore.watch(state => {
			this.requestUpdate();
		})
	}

	protected render() {
		const documentItems = this.renderDocumentItems();

		return html`
			<sl-dropdown placement="top-start" ?disabled="${this.disabled}">
				<div slot="trigger">
					<sl-tooltip content="${t("controls.documents")}" trigger="hover">
						<sl-button @click="${this.onButton}" ?disabled="${this.disabled}">
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

		const documentState = $documentStore.getState();
		const activeDoc = documentState.selectedDocumentState?.document;

		for (const doc of documentState.documents) {
			const docId = doc.getDocumentId();
			const selected = activeDoc ? activeDoc.getDocumentId() === docId : false;

			if (selected) {
				this.selectedDocId = docId.toString();
			}

			itemTemplates.push(html`<sl-menu-item type="checkbox" value="${docId}" ?checked="${selected}">${doc.getDocumentName()}</sl-menu-item>`);
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