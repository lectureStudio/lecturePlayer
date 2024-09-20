import { CSSResultGroup, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { Component } from "../component";
import { DataTablePagination } from "./data-table-pagination";
import { I18nLitElement } from "../i18n-mixin";
import styles from "./data-table.css";
import type { Grid } from "@vaadin/grid";
import "@vaadin/grid";

@customElement('data-table')
export class DataTable extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];

	@property({ type: Number })
	accessor pageSize = 10;

	@property({ type: Boolean })
	accessor pagination = false;

	@state()
	accessor pageItems: object[];

	@state()
	accessor items: object[];

	@query("vaadin-grid")
	accessor grid: Grid;

	@query("data-table-pagination")
	accessor gridPagination: DataTablePagination;


	protected override async firstUpdated() {
		this.pageItems = this.items;

		if (this.gridPagination) {
			this.gridPagination.table = this;
		}

		// Fix tooltip clipping in cells.
		const shadowRoot = this.grid.shadowRoot;
		if (shadowRoot) {
			const table = shadowRoot.querySelector<HTMLElement>("table") as HTMLElement;
			table.style.backgroundColor = "transparent";
			table.style.overflowX = "hidden";
			const tbody = shadowRoot.querySelector<HTMLElement>("table tbody") as HTMLElement;
			tbody.style.zIndex = "1000";
		}
	}

	protected override render() {
		return html`
			<vaadin-grid part="table" .items="${this.pageItems}" page-size="${this.pageSize}" size="${this.pageSize}" theme="no-border" all-rows-visible>
				<slot></slot>
			</vaadin-grid>

			${when(this.pagination, () => html`
				<data-table-pagination .table="${this}" .items="${this.items}"></data-table-pagination>
			`)}
		`;
	}
}
