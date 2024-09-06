import { Grid, h } from "gridjs";
import { Config } from "gridjs/dist/src/config";
import { html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { gridLanguage } from "../../utils/grid";
import { Modal } from "../modal/modal";
import { t } from '../i18n-mixin';
import { Utils } from "../../utils/utils";

const csvData = [
	["John", "john@example.com", "(353) 01 222 3333"],
	["Mark", "mark@gmail.com", "(01) 22 888 4444"],
	["Eoin", "eoin@gmail.com", "0097 22 654 00033"],
	["Sarah", "sarahcdd@gmail.com", "+322 876 1233"],
	["Afshin", "afshin@mail.com", "(353) 22 87 8356"]
];

@customElement("import-users-modal")
export class ImportUsersModal extends Modal {

	@query("#table-container")
	accessor tableContainer: HTMLElement;

	private grid: Grid;


	private gridConfig: Partial<Config> = {
		search: true,
		columns: [
			{
				name: t("course.form.user.management.first-name"),
				id: "first-name",
				attributes: {
					"data-field": "first-name",
					// "class": "fit-width",
				},
			},
			{
				name: t("course.form.user.management.last-name"),
				id: "last-name",
				attributes: {
					"data-field": "last-name",
				},
			},
			{
				name: t("course.form.user.management.mail"),
				id: "mail",
				attributes: {
					"data-field": "mail",
				},
			},
			{
				id: "actions",
				class: "actions",
				formatter: (cell, row) => {
					const icon = h("sl-icon", {
						slot: "prefix",
						name: "course-delete",
						class: "icon-danger",
					});
					const button = h("sl-button", {
						size: "small",
						onClick: () => this.onExcludeFromImport(`${row.cells[1].data}`)
					}, icon);

					return h("sl-tooltip", {
						content: t("course.form.user.management.csv.exclude"),
					}, button);
				},
			},
		],
		data: csvData,
		pagination: {
			limit: 5,
			resetPageOnUpdate: false,
		},
		language: gridLanguage()
	};


	protected override firstUpdated() {
		super.firstUpdated();

		this.grid = new Grid(this.gridConfig)
			.render(this.tableContainer);
	}

	protected override render() {
		return html`
			<sl-dialog label="${t("import.users.title")}">
				<article>
					<div id="table-container"></div>
				</article>
				<div slot="footer">
					<sl-button type="button" @click="${this.abort}" size="small">
						${t("import.users.abort")}
					</sl-button>
					<sl-button type="button" @click="${this.import}" variant="primary" size="small">
						${t("import.users.import")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}

	private onExcludeFromImport(mail: string) {
		this.gridConfig.data = (this.gridConfig.data as string[][]).filter(value => {
			return value[1] !== mail
		});

		this.grid.updateConfig(this.gridConfig)
			.forceRender();
	}

	private abort() {
		this.dispatchEvent(Utils.createEvent("import-users-modal-abort"));

		super.close();
	}

	private import() {
		this.dispatchEvent(Utils.createEvent("import-users-modal-import"));

		super.close();
	}
}
