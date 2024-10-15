import { ReactiveController } from "lit";
import { RecordedModal } from "../recorded-modal/recorded.modal";
import { PlayerView } from "./player-view";
import { featureStore } from "../../store/feature.store";
import { courseStore } from "../../store/course.store";
import { autorun } from "mobx"
import { uiStateStore } from "../../store/ui-state.store";
import { privilegeStore } from "../../store/privilege.store";

export class PlayerViewController implements ReactiveController {

	readonly host: PlayerView;

	private clockIntervalId: number;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		autorun(() => {
			uiStateStore.setRightContainerVisible((privilegeStore.canUseChat() && uiStateStore.chatVisible) || uiStateStore.receiveCameraFeed);
		});
		autorun(() => {
			featureStore.hasChatFeature();
			featureStore.hasQuizFeature();

			this.host.requestUpdate();
		});

		if (courseStore.recorded) {
			this.host.playerController.modalController.registerModal("RecordedModal", new RecordedModal());
		}
	}

	update() {
		this.clockIntervalId = window.setInterval(() => {
			try {
				this.host.controls.duration = (Date.now() - (courseStore.timeStarted ?? 0));
			}
			catch (error) {
				window.clearInterval(this.clockIntervalId);
			}
		}, 500);
	}

	setDisconnected() {
		window.clearInterval(this.clockIntervalId);
	}
}
