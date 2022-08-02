import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { PlayerControls } from '../controls/player-controls';
import { I18nLitElement } from '../i18n-mixin';
import { ParticipantView } from '../participant-view/participant-view';
import { SlideView } from '../slide-view/slide-view';
import { PlayerViewController } from './player-view.controller';
import { playerViewStyles } from './player-view.styles';
import { course } from '../../model/course';

@customElement('player-view')
export class PlayerView extends I18nLitElement {

	static styles = [
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	@property()
	privilegeService: PrivilegeService;

	@property()
	messageService: MessageService;

	@property({ type: Boolean, reflect: true })
	chatVisible: boolean;

	@property({ type: Boolean, reflect: true })
	participantsVisible: boolean = true;

	@query("player-controls")
	controls: PlayerControls;

	@query(".video-feeds")
	videoFeedContainer: HTMLElement;


	getController(): PlayerViewController {
		return this.controller;
	}

	getSlideView(): SlideView {
		return this.renderRoot.querySelector("slide-view");
	}

	addParticipant(view: ParticipantView) {
		view.setVolume(this.controls.volume);

		this.videoFeedContainer.appendChild(view);
	}

	removeParticipant(view: ParticipantView) {
		if (this.videoFeedContainer.contains(view)) {
			this.videoFeedContainer.removeChild(view);
		}
	}

	override connectedCallback() {
		super.connectedCallback()

		course.addEventListener("course-user-privileges", () => {
			this.participantsVisible = this.privilegeService.canViewParticipants();
		});
	}

	protected render() {
		return html`
			<div class="left-container">
				<div class="feature-container">
					${this.privilegeService.canViewParticipants() ? html`
					<participant-box .privilegeService="${this.privilegeService}"></participant-box>
					` : ''}
				</div>
			</div>
			<div class="center-container">
				<div class="slide-container">
					<slide-view></slide-view>
				</div>
				<div class="controls-container">
					<player-controls .chatVisible="${this.chatVisible}" .participantsVisible="${this.participantsVisible}" .privilegeService="${this.privilegeService}"></player-controls>
				</div>
			</div>
			<div class="right-container">
				<div class="video-feeds">
				</div>
				<div class="feature-container">
					${this.privilegeService.canReadMessages() ? html`
					<chat-box .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></chat-box>
					` : ''}
				</div>
			</div>
		`;
	}
}
