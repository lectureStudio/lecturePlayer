import { ReactiveController } from "lit";
import { PlayerFeatureView } from "./feature-view";
import { course } from '../../model/course';

export class FeatureViewController implements ReactiveController {

	private readonly host: PlayerFeatureView;


	constructor(host: PlayerFeatureView) {
		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		course.addEventListener("course-chat-feature", this.onFeatureState.bind(this));
		course.addEventListener("course-quiz-feature", this.onFeatureState.bind(this));
	}

	private async onFeatureState() {
		this.host.refresh();
	}
}