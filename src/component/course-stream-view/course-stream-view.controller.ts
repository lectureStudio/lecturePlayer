import { ReactiveController } from "lit";
import { CourseStreamView } from "./course-stream-view";
import { courseStore } from "../../store/course.store";
import { autorun, runInAction } from "mobx"
import { uiStateStore } from "../../store/ui-state.store";
import { privilegeStore } from "../../store/privilege.store";

export class CourseStreamViewController implements ReactiveController {

	readonly host: CourseStreamView;

	private clockIntervalId: number = 0;


	constructor(host: CourseStreamView) {
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
