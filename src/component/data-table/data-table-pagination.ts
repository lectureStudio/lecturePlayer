import { t } from "i18next";
import { CSSResultGroup, html, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { Component } from "../component";
import { DataTable } from "./data-table";
import { I18nLitElement } from "../i18n-mixin";
import styles from "./data-table-pagination.css";

@customElement('data-table-pagination')
export class DataTablePagination extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];

	@state()
	accessor items: object[];

	@state()
	accessor page: Number = 0;

	@state()
	accessor pages: number[];

	@state()
	accessor table: DataTable;


	protected override willUpdate(changedProperties: PropertyValues<DataTablePagination>) {
		if (changedProperties.has("items")) {
			this.pages = Array.from(Array(Math.ceil(this.items.length / this.table.pageSize)).keys());

			if (this.page >= this.pages.length) {
				this.selectPage(this.page - 1);
			}
			else {
				this.selectPage(this.page);
			}
		}
	}

	protected override render() {
		if (!this.table || !this.items || this.items.length === 0) {
			return null;
		}

		const start = this.page * this.table.pageSize + 1;
		const end = Math.min((this.page + 1) * this.table.pageSize, this.items.length);
		const count = this.items.length;
		const navDisabled = this.pages.length <= 1;

		return html`
			<div class="summary">
				<span>${t("table.pagination.summary", { start: start, end: end, count: count })}</span>
			</div>
			<sl-button-group>
				<sl-tooltip content="${t("table.pagination.previous")}">
					<sl-button @click="${() => this.selectPage(this.page - 1)}" ?disabled="${navDisabled}" size="small">
						<sl-icon name="chevron-left"></sl-icon>
					</sl-button>
				</sl-tooltip>

				${this.pages.map((pageNumber) => html`
					<sl-tooltip content="${t("table.pagination.page", { pageNum: pageNumber + 1 })}">
						<sl-button @click="${() => this.selectPage(pageNumber)}" ?disabled="${navDisabled}" class=${classMap({ selected: this.isSelected(pageNumber) })} size="small">${pageNumber + 1}</sl-button>
					</sl-tooltip>
				`)}

				<sl-tooltip content="${t("table.pagination.next")}">
					<sl-button @click="${() => this.selectPage(this.page + 1)}" ?disabled="${navDisabled}" size="small">
						<sl-icon name="chevron-right"></sl-icon>
					</sl-button>
				</sl-tooltip>
			</sl-button-group>
		`;
	}

	private selectPage(pageNumber: number) {
		if (pageNumber > -1 && pageNumber < this.pages.length) {
			this.page = pageNumber;

			const start = this.page * this.table.pageSize;
			const end = Math.min((this.page + 1) * this.table.pageSize, this.items.length);

			this.table.pageItems = this.items.slice(start, end);
		}
	}

	private isSelected(pageNumber: number) {
		return this.page === pageNumber;
	}
}
