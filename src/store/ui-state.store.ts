import { makeAutoObservable } from "mobx";
import { Dimension } from "../geometry/dimension";
import { ContentFocus, ContentLayout } from "../model/content";
import { State } from "../utils/state";

export enum ColorScheme {

	DARK = "dark",
	LIGHT = "light",
	SYSTEM = "system"

}


class UiStateStore {

	systemColorScheme: ColorScheme;

	colorScheme: ColorScheme;

	state: State = State.DISCONNECTED;

	streamState: State = State.DISCONNECTED;

	documentState: State = State.DISCONNECTED;

	slideSurfaceSize: Dimension = new Dimension(0, 0);

	contentLayout: ContentLayout;

	contentFocus: ContentFocus;

	previousContentFocus: ContentFocus;

	streamProbeFailed: boolean;

	chatVisible: boolean = true;

	participantsVisible: boolean = true;

	screenVisible: boolean = false;

	rightContainerVisible: boolean;

	receiveCameraFeed: boolean = true;

	quizSent: boolean = false;


	constructor() {
		makeAutoObservable(this);

		this.load();
	}

	setColorScheme(scheme: ColorScheme) {
		this.colorScheme = scheme;
	}

	setState(state: State) {
		this.state = state;
	}

	setDocumentState(state: State) {
		this.documentState = state;
	}

	setStreamState(state: State) {
		this.streamState = state;
	}

	setStreamProbeFailed(failed: boolean) {
		this.streamProbeFailed = failed;
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

	setReceiveCameraFeed(receive: boolean) {
		this.receiveCameraFeed = receive;
	}

	setSystemColorScheme(scheme: ColorScheme) {
		this.systemColorScheme = scheme;
	}

	setQuizSent(sent: boolean) {
		this.quizSent = sent;
	}

	isSystemAndUserDark() {
		return (this.systemColorScheme === ColorScheme.DARK && this.colorScheme === ColorScheme.SYSTEM) || this.colorScheme === ColorScheme.DARK;
	}

	persist() {
		const { colorScheme } = this;

		localStorage.setItem("ui.store", JSON.stringify({ colorScheme }));
	}

	private load() {
		const json = localStorage.getItem("ui.store");

		if (json) {
			Object.assign(this, JSON.parse(json));
		}

		// Set default values.
		if (!this.colorScheme) {
			this.setColorScheme(ColorScheme.SYSTEM);
		}
	}
}

export const uiStateStore = new UiStateStore();