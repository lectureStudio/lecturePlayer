import { ReactiveController } from "lit";
import { PlayerView } from "./player-view";
import { featureStore } from "../../store/feature.store";
import { courseStore } from "../../store/course.store";
import { autorun } from "mobx"
import { uiStateStore } from "../../store/ui-state.store";
import { privilegeStore } from "../../store/privilege.store";

interface BreakpointConfig {

	chatVisible: boolean;
	participantsVisible: boolean;

}

export class PlayerViewController implements ReactiveController {

	private readonly maxWidth576Query: MediaQueryList;

	private breakpointConfig: BreakpointConfig;

	readonly host: PlayerView;

	private clockIntervalId: number;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);

		this.maxWidth576Query = window.matchMedia("(max-width: 575px) , (orientation: portrait)");
		this.maxWidth576Query.onchange = (event) => {
			this.onCompactLayout(event.matches);
		};
	}

	hostConnected() {
		autorun(() => {
			uiStateStore.setChatVisible(featureStore.hasChatFeature());
		});
		autorun(() => {
			uiStateStore.setRightContainerVisible(privilegeStore.canUseChat() && uiStateStore.chatVisible);
		});
		autorun(() => {
			featureStore.hasQuizFeature();
			this.host.requestUpdate();
		});

		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
		this.host.addEventListener("player-participants-visibility", this.onParticipantsVisibility.bind(this), false);

		this.breakpointConfig = {
			chatVisible: uiStateStore.chatVisible,
			participantsVisible: uiStateStore.participantsVisible
		};
	}

	update() {
		if (this.maxWidth576Query.matches) {
			this.onCompactLayout(true);
		}

		this.clockIntervalId = window.setInterval(() => {
			try {
				this.host.controls.duration = (Date.now() - courseStore.timeStarted);
			}
			catch (error) {
				window.clearInterval(this.clockIntervalId);
			}
		}, 500);
	}

	setDisconnected() {
		window.clearInterval(this.clockIntervalId);
	}

	private onChatVisibility() {
		if (!this.maxWidth576Query.matches) {
			uiStateStore.toggleChatVisible();
		}
	}

	private onParticipantsVisibility() {
		if (!this.maxWidth576Query.matches) {
			uiStateStore.toggleParticipantsVisible();
		}
	}

	private onCompactLayout(compact: boolean) {
		if (compact) {
			// Store current (visible) state.
			this.breakpointConfig = {
				chatVisible: uiStateStore.chatVisible,
				participantsVisible: uiStateStore.participantsVisible
			};

			// Hide elements.
			uiStateStore.setChatVisible(false);
			uiStateStore.setParticipantsVisible(false);
		}
		else {
			// Re-store state.
			uiStateStore.setChatVisible(this.breakpointConfig.chatVisible);
			uiStateStore.setParticipantsVisible(this.breakpointConfig.participantsVisible);
		}
	}
}