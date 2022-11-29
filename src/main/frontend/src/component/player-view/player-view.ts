import { html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { PlayerControls } from '../controls/player-controls';
import { I18nLitElement, t } from '../i18n-mixin';
import { ParticipantView } from '../participant-view/participant-view';
import { SlideView } from '../slide-view/slide-view';
import { PlayerViewController } from './player-view.controller';
import { playerViewStyles } from './player-view.styles';
import { course } from '../../model/course';
import { ScreenView } from '../screen-view/screen-view';
import { SlideLayout } from '../../model/slide-layout';
import { State } from '../../utils/state';
import Split from 'split.js'
import { Utils } from '../../utils/utils';

@customElement('player-view')
export class PlayerView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	private split: Split.Instance;

	private splitSizes: number[];

	private slideLayout: SlideLayout = SlideLayout.Card;

	@property()
	privilegeService: PrivilegeService;

	@property()
	messageService: MessageService;

	@property({ type: Boolean, reflect: true })
	chatVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	participantsVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	screenVisible: boolean = false;

	@query("player-controls")
	controls: PlayerControls;

	@query(".video-feeds")
	videoFeedContainer: HTMLElement;

	@query("screen-view")
	screenView: ScreenView;


	getController(): PlayerViewController {
		return this.controller;
	}

	getSlideView(): SlideView {
		return this.renderRoot.querySelector("slide-view");
	}

	addParticipant(view: ParticipantView) {
		view.addEventListener("participant-state", this.onParticipantState.bind(this));
		view.addEventListener("participant-screen-stream", this.onParticipantScreenStream.bind(this));
		view.addEventListener("participant-screen-visibility", this.onParticipantScreenVisibility.bind(this));
		view.setVolume(this.controls.volume);

		this.videoFeedContainer.appendChild(view);
	}

	removeParticipant(view: ParticipantView) {
		if (this.videoFeedContainer.contains(view)) {
			this.videoFeedContainer.removeChild(view);
		}
	}

	cleanup() {
		// Reset controls.
		this.controls.handUp = false;
		this.controls.fullscreen = false;

		// Cleanup screen view.
		this.screenVisible = false;
		this.screenView.removeVideo();
		this.screenView.setState(State.DISCONNECTED);

		// Cleanup video feeds.
		while (this.videoFeedContainer.firstChild) {
			this.videoFeedContainer.removeChild(this.videoFeedContainer.firstChild);
		}
	}

	override connectedCallback() {
		super.connectedCallback()

		course.addEventListener("course-user-privileges", () => {
			this.participantsVisible = this.privilegeService.canViewParticipants();
		});

		this.addEventListener("screen-view-video", (event: CustomEvent) => {
			this.screenVisible = event.detail.hasVideo;
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
		const minSizes = [0, 50, 0];

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
					sizes[0] = this.participantsVisible ? minSizes[0] : 0;
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
				this.split.setSizes([0, this.splitSizes[0] + this.splitSizes[1], this.splitSizes[2]]);
			}
			else {
				// Restore pane sizes.
				if (this.splitSizes) {
					const sizes = this.split.getSizes();
					// Center pane size = current size - previous left pane size.
					this.split.setSizes([this.splitSizes[0], sizes[1] + sizes[0] - this.splitSizes[0], sizes[2]]);

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
						<slide-view class="slides"></slide-view>
						<screen-view></screen-view>
						<div class="bottom-left">
							<button @click="${this.onStats}" id="stats-button">
								<ui-tooltip for="stats-button" .text="${t("controls.stats")}" sticky="true"></ui-tooltip>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart" viewBox="0 0 16 16">
									<path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
								</svg>
							</button>
						</div>
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

	private onStats() {
		this.dispatchEvent(Utils.createEvent("player-stats-action"));
	}

	private onParticipantState(event: CustomEvent) {
		this.screenView.setState(event.detail.state);
	}

	private onParticipantScreenStream(event: CustomEvent) {
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.screenView.addVideo(event.detail.video);
		}
		else if (state === State.DISCONNECTED) {
			this.screenView.removeVideo();
		}
	}

	private onParticipantScreenVisibility(event: CustomEvent) {
		const visible: boolean = event.detail.visible;

		this.screenView.setVideoVisible(visible);
	}
}
