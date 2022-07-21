import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { playerStyles } from './player.styles';
import { PlayerController } from './player.controller';
import { I18nLitElement, t } from '../i18n-mixin';
import { State } from '../../utils/state';
import { PlayerView } from '../player-view/player-view';
import { CourseState } from '../../model/course-state';
import { MediaProfile, Settings } from '../../utils/settings';
import { MessageService } from '../../service/message.service';

@customElement('lecture-player')
export class LecturePlayer extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerStyles,
	];

	private controller = new PlayerController(this);

	@state()
	courseState: CourseState;

	@state()
	messageService: MessageService;

	@property({ reflect: true })
	state: State = State.CONNECTING;

	@property({ type: Number })
	courseId: number;

	@property({ type: String })
	description: string;


	protected firstUpdated() {
		const isLive = this.getAttribute("islive") == "true";

		// Early state recognition to avoid view flickering.
		if (isLive) {
			if (Settings.getMediaProfile() === MediaProfile.Classroom) {
				this.state = State.CONNECTED_FEATURES;
			}
		}
		else {
			this.state = State.DISCONNECTED;
		}

		const playerView: PlayerView = this.renderRoot.querySelector("player-view");

		this.controller.setPlayerViewController(playerView.getController());
	}

	protected render() {
		return html`
			<player-loading .text="${t("course.loading")}"></player-loading>
			<player-view .courseId="${this.courseId}" .messageService="${this.messageService}"></player-view>
			<player-feature-view .courseState="${this.courseState}" .messageService="${this.messageService}"></player-feature-view>
			<player-offline .description="${this.description}"></player-offline>
		`;
	}
}
