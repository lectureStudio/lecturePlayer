import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { playerStyles } from './player.styles';
import { PlayerController } from './player.controller';
import { I18nLitElement, t } from '../i18n-mixin';
import { State } from '../../utils/state';
import { PlayerView } from '../player-view/player-view';
import { MediaProfile, Settings } from '../../utils/settings';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';

@customElement('lecture-player')
export class LecturePlayer extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerStyles,
	];

	private controller = new PlayerController(this);

	@state()
	messageService: MessageService;

	@state()
	privilegeService: PrivilegeService;

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
		playerView.getController().setPlayerController(this.controller);

		this.controller.setPlayerViewController(playerView.getController());
	}

	protected render() {
		return html`
			<player-loading .text="${t("course.loading")}"></player-loading>
			<player-view .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></player-view>
			<player-feature-view .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></player-feature-view>
			<player-offline .description="${this.description}"></player-offline>
		`;
	}
}
