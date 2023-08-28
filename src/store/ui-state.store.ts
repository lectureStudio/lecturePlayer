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

	private readonly colorSchemeQuery;

	systemColorScheme: ColorScheme;

	colorScheme: ColorScheme;

	state: State = State.DISCONNECTED;

	streamState: State = State.DISCONNECTED;

	documentState: State = State.DISCONNECTED;

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

		if (window.matchMedia) {
			this.colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

			this.setSystemColorScheme(this.colorSchemeQuery.matches ? ColorScheme.DARK : ColorScheme.LIGHT);

			this.colorSchemeQuery.addEventListener("change", event => {
				this.setSystemColorScheme(event.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
			});
		}

		this.load();

		console.log("++ color scheme:", this.colorScheme, this.systemColorScheme)
	}

	setColorScheme(scheme: ColorScheme) {
		this.colorScheme = scheme;

		this.applyColorScheme();
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

	persist() {
		const { colorScheme } = this;

		localStorage.setItem("ui.store", JSON.stringify({ colorScheme }));
	}

	applyColorScheme() {
		if (!document.body) {
			return;
		}

		const isDark = this.isSystemAndUserDark();

		if (isDark) {
			document.body.classList.add("sl-theme-dark");
		}
		else {
			document.body.classList.remove("sl-theme-dark");
		}
	}

	private load() {
		const json = localStorage.getItem("ui.store");

		if (json) {
			Object.assign(this, JSON.parse(json));
		}

		if (!this.colorScheme) {
			this.setColorScheme(ColorScheme.SYSTEM);
		}
	}

	private setSystemColorScheme(scheme: ColorScheme) {
		this.systemColorScheme = scheme;

		this.applyColorScheme();
	}

	private isSystemAndUserDark() {
		return (this.systemColorScheme === ColorScheme.DARK && this.colorScheme === ColorScheme.SYSTEM) || this.colorScheme === ColorScheme.DARK;
	}
}

export const uiStateStore = new UiStateStore();