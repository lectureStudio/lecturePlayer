import { html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { SortOrder, SortConfig } from '../../utils/sort';
import { CourseParticipant } from '../../model/participant';
import { SlMenu, SlMenuItem } from '@shoelace-style/shoelace';
import { FirstNameComparator, LastNameComparator, ParticipantSortProperty, ParticipantSortPropertyType, ParticipantSortPropertyUtil, ParticipantTypeComparator, participantStore } from '../../store/participants.store';
import { Component } from '../component';
import participantBoxStyles from './participant-list.scss';

@customElement('participant-list')
export class ParticipantList extends Component {

	static override styles = [
		I18nLitElement.styles,
		participantBoxStyles
	];

	@state()
	sortProperty = ParticipantSortProperty.LastName;

	@state()
	sortConfig: SortConfig<CourseParticipant> = {
		order: SortOrder.Ascending,
		comparators: []
	};

	@query('#custom-sort-menu')
	customSortMenu: SlMenu;


	override connectedCallback() {
		super.connectedCallback();

		this.setSortComparators(this.sortProperty);
	}

	protected override render() {
		return html`
			<header>
				<span class="title">${t("course.participants")} (${participantStore.count})</span>
				<div class="control-buttons">
					<sl-tooltip .content="${this.getSortOrderTooltip()}" trigger="hover">
						<sl-icon-button @click="${this.onSortOrder}" .name="${this.getSortOrderIcon()}" id="iconSortAsc"></sl-icon-button>
					</sl-tooltip>

					<sl-dropdown>
						<div slot="trigger">
							<sl-tooltip content="${t("sort.user.defined")}" trigger="hover">
								<sl-icon-button name="filter-square"></sl-icon-button>
							</sl-tooltip>
						</div>
						<sl-menu @sl-select="${this.onSortProperty}" id="custom-sort-menu">
							<sl-menu-label>${t("sort.by")}</sl-menu-label>
							<sl-menu-item
								type="checkbox"
								value="${ParticipantSortPropertyUtil.toString(ParticipantSortProperty.FirstName)}"
								?checked="${this.sortProperty === ParticipantSortProperty.FirstName}">
									${t("sort.by.first.name")}
							</sl-menu-item>
							<sl-menu-item
								type="checkbox"
								value="${ParticipantSortPropertyUtil.toString(ParticipantSortProperty.LastName)}"
								?checked="${this.sortProperty === ParticipantSortProperty.LastName}">
									${t("sort.by.last.name")}
							</sl-menu-item>
							<sl-menu-item
								type="checkbox"
								value="${ParticipantSortPropertyUtil.toString(ParticipantSortProperty.Affiliation)}"
								?checked="${this.sortProperty === ParticipantSortProperty.Affiliation}">
									${t("sort.by.affiliation")}
							</sl-menu-item>
						</sl-menu>
					</sl-dropdown>
				</div>
			</header>
			<section>
				<div class="participants">
					<div class="participant-log">
					${repeat(participantStore.sort(this.sortConfig), (participant) => participant.userId, (participant) => html`
						<participant-list-item .participant="${participant}"></participant-list-item>
					`)}
					</div>
				</div>
			</section>
		`;
	}

	private onSortOrder() {
		this.sortConfig.order = (this.sortConfig.order === SortOrder.Ascending) ? SortOrder.Descending : SortOrder.Ascending

		this.requestUpdate();
	}

	private getSortOrderIcon() {
		return (this.sortConfig.order === SortOrder.Ascending) ? "sort-alpha-down-alt" : "sort-alpha-down";
	}

	private getSortOrderTooltip() {
		return (this.sortConfig.order === SortOrder.Ascending) ? t("sort.descending") : t("sort.ascending");
	}

	private onSortProperty(event: CustomEvent) {
		const selectedItem: SlMenuItem = event.detail.item;
		const value = selectedItem.value;

		if (!value) {
			// Document control item selected.
			return;
		}

		const property = ParticipantSortProperty[value as ParticipantSortPropertyType];

		// Keep selected item checked, e.g. when double-checked.
		selectedItem.checked = true;

		if (this.sortProperty === property) {
			// Same item selected.
			return;
		}

		for (const item of this.customSortMenu.getAllItems()) {
			// Uncheck all items, except the selected one.
			if (item.value !== value) {
				item.checked = false;
			}
		}

		this.setSortComparators(property);
		this.sortProperty = property;
	}

	private setSortComparators(sortProperty: ParticipantSortProperty) {
		this.sortConfig.comparators = this.getSortComparators(sortProperty);
	}

	private getSortComparators(sortProperty: ParticipantSortProperty) {
		switch (sortProperty) {
			case ParticipantSortProperty.FirstName:
				return [FirstNameComparator, LastNameComparator];

			case ParticipantSortProperty.LastName:
				return [LastNameComparator, FirstNameComparator];

			case ParticipantSortProperty.Affiliation:
				return [ParticipantTypeComparator, FirstNameComparator];
		}
	}
}