import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { playerStyles } from './player.styles';
import { PlayerController } from './player.controller';
import { I18nLitElement, t } from '../i18n-mixin';
import { State } from '../../utils/state';
import { PlayerView } from '../player-view/player-view';
import { CourseState } from '../../model/course-state';

@customElement('lecture-player')
export class LecturePlayer extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerStyles,
	];

	private controller = new PlayerController(this);

	@state()
	courseState: CourseState;

	@property({ reflect: true })
	state: State = State.CONNECTING;

	@property({ type: Number })
	courseId: number;

	@property({ type: String })
	description: string;


	protected firstUpdated(): void {
		const playerView: PlayerView = this.renderRoot.querySelector("player-view");

		this.controller.setPlayerViewController(playerView.getController());
	}

	protected render() {
		return html`
			<player-loading .text="${t("course.loading")}"></player-loading>
			<player-view .courseId="${this.courseId}"></player-view>
			<player-feature-view .courseState="${this.courseState}"></player-feature-view>
			<player-offline .description="${this.description}"></player-offline>
		`;
	}
}