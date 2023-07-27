import { html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { participantBoxStyles } from './participants-box.styles';
import { participants } from '../../model/participants';
import { course } from '../../model/course';
import { PrivilegeService } from '../../service/privilege.service';
import { SortOrder, ParticipantSortProperty, ParticipantSortPropertyType } from '../../utils/sort';
import { CourseParticipant } from '../../model/course-state';
import { SlMenu, SlMenuItem } from '@shoelace-style/shoelace';

@customElement('participants-box')
export class ParticipantsBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantBoxStyles
	];

	@state()
	participants: CourseParticipant[] = [];

	@state()
	sortOrder = SortOrder.Ascending;

	@state()
	sortProperty = ParticipantSortProperty.LastName;

	@property()
	privilegeService: PrivilegeService;

	@query('#custom-sort-menu')
	customSortMenu: SlMenu;

	@query(".participant-log")
	participantContainer: HTMLElement;


	override connectedCallback() {
		super.connectedCallback()

		participants.addEventListener("all", () => { this.setParticipants() }, false);
		participants.addEventListener("added", () => { this.setParticipants() }, false);
		participants.addEventListener("removed", () => { this.setParticipants() }, false);
		participants.addEventListener("cleared", () => { this.setParticipants() }, false);
	}

	protected render() {
		const templates = [];

		for (const participant of this.participants) {
			let name = `${participant.firstName} ${participant.familyName}`;
			let type;

			if (participant.userId === course.userId) {
				name += ` (${t("course.participants.me")})`;
			}

			switch (participant.participantType) {
				case 'ORGANISATOR':
				case 'CO_ORGANISATOR':
					const lower = participant.participantType.toLowerCase();

					type = html`
						<span class="icon-${lower}" id="participant-type">
							<ui-tooltip for="participant-type">${t("course.role." + lower)}</ui-tooltip>
						</span>
					`;
					break;
			}

			templates.push(html`
				<div class="participant">
					<span>${name}</span>
					${type}
				</div>
			`);
		}

		return html`
			<header>
				<span class="title">${t("course.participants")} (${this.participants.length})</span>
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
							<sl-menu-item type="checkbox" value="FirstName" ?checked="${this.sortProperty === ParticipantSortProperty.FirstName}">${t("sort.by.first.name")}</sl-menu-item>
							<sl-menu-item type="checkbox" value="LastName" ?checked="${this.sortProperty === ParticipantSortProperty.LastName}">${t("sort.by.last.name")}</sl-menu-item>
						</sl-menu>
					</sl-dropdown>
				</div>
			</header>
			<section>
				<div class="participants">
					<div class="participant-log">
						${templates}
					</div>
				</div>
			</section>
		`;
	}

	private sort(array: CourseParticipant[]) {
		this.participants = array.sort(this.comparator.bind(this));
	}

	private setParticipants() {
		this.sort([...participants.participants]);

		this.requestUpdate();
	}

	private onSortOrder() {
		this.sortOrder = (this.sortOrder === SortOrder.Ascending) ? SortOrder.Descending : SortOrder.Ascending

		this.sort(this.participants);
	}

	private getSortOrderIcon() {
		return (this.sortOrder === SortOrder.Ascending) ? "sort-alpha-down-alt" : "sort-alpha-down";
	}

	private getSortOrderTooltip() {
		return (this.sortOrder === SortOrder.Ascending) ? t("sort.descending") : t("sort.ascending");
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

		for (let item of this.customSortMenu.getAllItems()) {
			// Uncheck all items, except the selected one.
			if (item.value !== value) {
				item.checked = false;
			}
		}

		this.sortProperty = property;

		this.sort(this.participants);
	}

	private comparator(a: CourseParticipant, b: CourseParticipant): number {
		let lhs = null;
		let rhs = null;

		switch (this.sortProperty) {
			case ParticipantSortProperty.FirstName:
				lhs = a.firstName;
				rhs = b.firstName;
				break;

			case ParticipantSortProperty.LastName:
				lhs = a.familyName;
				rhs = b.familyName;
				break;
		}

		if (this.sortOrder === SortOrder.Ascending) {
			return lhs.localeCompare(rhs);
		}

		return rhs.localeCompare(lhs);
	}
}