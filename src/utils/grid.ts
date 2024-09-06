import { Language } from "gridjs/dist/src/i18n/language";
import { t } from "i18next";

export function gridLanguage(): Language {
	return {
		search: {
			placeholder: t("table.search.placeholder")
		},
		sort: {
			sortAsc: t("table.sort.asc"),
			sortDesc: t("table.sort.desc"),
		},
		pagination: {
			previous: "⮜",
			next: "⮞",
			page: (page) => t("table.pagination.page", { pageNum: page }),
			showing: t("table.pagination.showing"),
			of: t("table.pagination.of"),
			to: t("table.pagination.to"),
			results: () => t("table.pagination.results")
		},
		noRecordsFound: t("table.empty"),
		error: t("table.error"),
	};
}
