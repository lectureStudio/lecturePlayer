import { GridColumn } from "@vaadin/grid/all-imports";
import { customElement } from "lit/decorators.js";

@customElement('data-table-column')
export class DataTableColumn extends GridColumn {

	constructor() {
		super();
	}

}
