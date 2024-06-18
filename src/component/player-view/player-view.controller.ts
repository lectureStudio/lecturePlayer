import { ReactiveController } from "lit";
import { PlayerView } from "./player-view";
import { courseStore } from "../../store/course.store";
import { autorun, runInAction } from "mobx"
import { uiStateStore } from "../../store/ui-state.store";
import { privilegeStore } from "../../store/privilege.store";

export class PlayerViewController implements ReactiveController {

	readonly host: PlayerView;

	private clockIntervalId: number = 0;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		autorun(() => {
			runInAction(() => {
				uiStateStore.setRightContainerVisible((privilegeStore.canUseChat() && uiStateStore.chatVisible) || uiStateStore.receiveCameraFeed);
			})
		});
		autorun(() => {
			courseStore.hasChatFeature();
			courseStore.hasQuizFeature();

			this.host.requestUpdate();
		});
	}

	startTimer() {
		if (this.clockIntervalId !== 0) {
			// Make sure the previous timer is cleared/disposed.
			this.stopTimer();
		}

		this.clockIntervalId = window.setInterval(() => {
			try {
				this.host.controls.duration = (Date.now() - (courseStore.activeCourse?.timeStarted ?? 0));
			}
			catch (error) {
				window.clearInterval(this.clockIntervalId);
			}
		}, 500);
	}

	stopTimer() {
		window.clearInterval(this.clockIntervalId);

		this.clockIntervalId = 0;
	}
}
