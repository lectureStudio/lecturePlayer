import { makeAutoObservable } from "mobx";
import { Dimension } from "../geometry/dimension";
import { ContentFocus, ContentLayout } from "../model/content";
import { State } from "../utils/state";

class UiStateStore {

	state: State = State.CONNECTING;

	slideSurfaceSize: Dimension = new Dimension(0, 0);

	contentLayout: ContentLayout;

	contentFocus: ContentFocus;

	previousContentFocus: ContentFocus;

	chatVisible: boolean = true;

	participantsVisible: boolean = true;

	screenVisible: boolean = false;

	rightContainerVisible: boolean;


	constructor() {
		makeAutoObservable(this);
	}

	setState(state: State) {
		this.state = state;
	}

	setSlideSurfaceSize(size: Dimension) {
		this.slideSurfaceSize = size;
	}

	setContentLayout(layout: ContentLayout) {
		this.contentLayout = layout;
	}

	setContentFocus(focus: ContentFocus) {
		this.contentFocus = focus;
	}

	setPreviousContentFocus(focus: ContentFocus) {
		this.previousContentFocus = focus;
	}

	setChatVisible(visible: boolean) {
		this.chatVisible = visible;
	}

	toggleChatVisible() {
		this.chatVisible = !this.chatVisible;
	}

	setParticipantsVisible(visible: boolean) {
		this.participantsVisible = visible;
	}

	toggleParticipantsVisible() {
		this.participantsVisible = !this.participantsVisible;
	}

	setScreenVisible(visible: boolean) {
		this.screenVisible = visible;
	}

	setRightContainerVisible(visible: boolean) {
		this.rightContainerVisible = visible;
	}
}

export const uiStateStore = new UiStateStore();