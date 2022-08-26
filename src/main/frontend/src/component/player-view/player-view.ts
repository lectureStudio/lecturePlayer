import { html, PropertyValues } from 'lit';
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
import Split from 'split.js'

@customElement('player-view')
export class PlayerView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	private split: Split.Instance;

	private splitSizes: number[];

	@property()
	privilegeService: PrivilegeService;

	@property()
	messageService: MessageService;

	@property({ type: Boolean, reflect: true })
	chatVisible: boolean = true;

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

	protected firstUpdated(): void {
		// Set up split-panes.
		const elements: HTMLElement[] = [
			this.shadowRoot.querySelector(".left-container"),
			this.shadowRoot.querySelector(".center-container"),
			this.shadowRoot.querySelector(".right-container")
		];

		// Minimum sizes in percent.
		const minSizes = [10, 50, 10];

		const splitOptions: Split.Options = {
			sizes: [13, 72, 15],
			minSize: minSizes,
			maxSize: [400, Infinity, 500],
			snapOffset: 0,
			elementStyle: function (dimension, size, gutterSize, index) {
				if (index !== 1 && size < minSizes[index]) {
					// Min size for left and right panes.
					size = minSizes[index];
				}

				return {
					'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)',
				}
			},
			onDragEnd: (sizes) => {
				// Minsize for the left pane.
				if (sizes[0] < minSizes[0]) {
					sizes[0] = minSizes[0];
				}
				// Minsize for the right pane.
				if (sizes[2] < minSizes[2]) {
					sizes[2] = minSizes[2];
				}

				// Center pane.
				sizes[1] = 100 - sizes[0] - sizes[2];

				this.split.setSizes(sizes);
			}
		};

		this.split = Split(elements, splitOptions);
	}

	protected updated(changedProperties: PropertyValues): void {
		if (changedProperties.has("participantsVisible")) {
			if (!this.participantsVisible) {
				// Save pane sizes and collapse the participant pane.
				this.splitSizes = this.split.getSizes();
				this.split.collapse(0);
			}
			else {
				// Restore pane sizes.
				if (this.splitSizes) {
					// Except the right pane. Set the current size.
					// this.splitSizes[2] = this.split.getSizes()[2];
					this.split.setSizes(this.splitSizes);
					this.splitSizes = null;
				}
			}
		}
	}

	protected render() {
		return html`
			<div>
				<div class="left-container">
					<div class="feature-container">
						${this.privilegeService.canViewParticipants() ? html`
						<participants-box .privilegeService="${this.privilegeService}"></participants-box>
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
						${this.privilegeService.canUseChat() ? html`
						<chat-box .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></chat-box>
						` : ''}
					</div>
				</div>
			</div>
		`;
	}
}
