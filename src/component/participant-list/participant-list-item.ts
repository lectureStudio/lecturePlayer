import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { CourseParticipant, Participant } from '../../model/participant';
import { Component } from '../component';
import { observable } from 'mobx';
import { userStore } from "../../store/user.store";
import { participantStore } from "../../store/participants.store";
import { ModerationService } from "../../service/moderation.service";
import { privilegeStore } from "../../store/privilege.store";
import { Toaster } from "../../utils/toaster";
import participantStyles from './participant-list-item.css';

@customElement('participant-list-item')
export class ParticipantListItem extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		participantStyles
	];

	@property()
	@observable
	participant: CourseParticipant;

	@property()
	moderationService: ModerationService;


	private mouseEnterHandler = () => {
		const button = this.shadowRoot?.querySelector("sl-icon-button");
		if (button) {
			button.style.display = "block";
		}
	};

	private mouseLeaveHandler = () => {
		const button = this.shadowRoot?.querySelector("sl-icon-button");
		if (button) {
			button.style.display = "none";
		}
	};

	override connectedCallback() {
		super.connectedCallback();

		this.addEventListener("mouseenter", this.mouseEnterHandler);
		this.addEventListener("mouseleave", this.mouseLeaveHandler);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener("mouseenter", this.mouseEnterHandler);
		this.removeEventListener("mouseleave", this.mouseLeaveHandler);
	}

	protected override render() {
		return html`
			<sl-avatar shape="rounded" initials="${Participant.getInitials(this.participant)}"></sl-avatar>
			${this.renderNameWithOptionalTooltip()}
			${this.renderType()}
		`;
	}

	private renderType() {
		if (this.participant.participantType !== "PARTICIPANT") {
			const type = this.participant.participantType.toLowerCase();

			return html`
				<sl-tooltip content="${t("course.role." + type)}" trigger="hover">
					<sl-icon name="${type}"></sl-icon>
				</sl-tooltip>
			`;
		}

		if (privilegeStore.canBanParticipants() && this.participant.participantType === "PARTICIPANT") {
			return html`<sl-icon-button id="ban" name="shield-x" label="Ban" @click="${this.banParticipant}"></sl-icon-button>`;
		}

		return null;
	}

	private renderNameWithOptionalTooltip() {
		let userCanSeeAvatar: boolean | undefined = userStore.userId == this.participant.userId; //user can always see his own avatar
		const participantUser = participantStore.findByUserId((userStore.userId!));
		userCanSeeAvatar = userCanSeeAvatar || (participantUser ? participantUser.canSeeOthersAvatar : false); // can only see others' if he has the privilege

		if (Participant.hasAvatar(this.participant) && Participant.canShowAvatar(this.participant) && userCanSeeAvatar) {
			return html`
				<sl-tooltip class="tooltip-avatar" trigger="hover">
					<div class="tooltip-avatar-container" slot="content">
						<img class="tooltip-avatar-image" src="${Participant.getAvatar(this.participant)}">
						<span>${Participant.getFullName(this.participant)}</span>
					</div>
					<span>${Participant.getFullName(this.participant)}</span>
				</sl-tooltip>	
			`;
		}

		return html`
			<span>${Participant.getFullName(this.participant)}</span>	
		`;
	}

	private banParticipant(event: Event) {
		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		console.info('Will ban participant with id', this.participant.userId);

		this.moderationService.banUser(this.participant.userId).then(() => {
			console.info('Participant banned');
			Toaster.showSuccess(t("course.feature.participant.ban.success",
				{ name: Participant.getFullName(this.participant) }));
		})
		.catch((error: string) => {
			console.error('Failed to ban participant', error);

			if (error === "Not allowed") {
				Toaster.showError(t("course.feature.participant.ban.error.not-allowed"));
			}
			else {
				Toaster.showError(t("course.feature.participant.ban.error",
					{ name: Participant.getFullName(this.participant) }));
			}
		})
		.finally(() => {
			submitButton.disabled = false;
		});
	}
}
