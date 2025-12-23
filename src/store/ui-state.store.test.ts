import { expect } from "@open-wc/testing";
import { isObservable, isObservableProp } from "mobx";
import { uiStateStore, ColorScheme } from "./ui-state.store.js";
import { State } from "../utils/state.js";
import { ContentFocus, ContentLayout } from "../model/content.js";
import { Dimension } from "../geometry/dimension.js";

describe("UiStateStore", () => {
	// Store original values
	let originalState: State;
	let originalColorScheme: ColorScheme;
	let originalChatVisible: boolean;
	let originalParticipantsVisible: boolean;

	beforeEach(() => {
		// Save original values
		originalState = uiStateStore.state;
		originalColorScheme = uiStateStore.colorScheme;
		originalChatVisible = uiStateStore.chatVisible;
		originalParticipantsVisible = uiStateStore.participantsVisible;
	});

	afterEach(() => {
		// Restore original values
		uiStateStore.setState(originalState);
		uiStateStore.setColorScheme(originalColorScheme);
		uiStateStore.setChatVisible(originalChatVisible);
		uiStateStore.setParticipantsVisible(originalParticipantsVisible);

		// Clear persisted state
		localStorage.removeItem("ui.store");
	});

	describe("connection state", () => {
		it("sets state", () => {
			uiStateStore.setState(State.CONNECTING);
			expect(uiStateStore.state).to.equal(State.CONNECTING);

			uiStateStore.setState(State.CONNECTED);
			expect(uiStateStore.state).to.equal(State.CONNECTED);
		});

		it("sets stream state", () => {
			uiStateStore.setStreamState(State.CONNECTED);

			expect(uiStateStore.streamState).to.equal(State.CONNECTED);
		});

		it("sets document state", () => {
			uiStateStore.setDocumentState(State.CONNECTED);

			expect(uiStateStore.documentState).to.equal(State.CONNECTED);
		});

		it("tracks stream probe failure", () => {
			uiStateStore.setStreamProbeFailed(true);

			expect(uiStateStore.streamProbeFailed).to.be.true;

			uiStateStore.setStreamProbeFailed(false);

			expect(uiStateStore.streamProbeFailed).to.be.false;
		});
	});

	describe("color scheme", () => {
		it("sets color scheme", () => {
			uiStateStore.setColorScheme(ColorScheme.DARK);

			expect(uiStateStore.colorScheme).to.equal(ColorScheme.DARK);
		});

		it("supports all scheme values", () => {
			uiStateStore.setColorScheme(ColorScheme.LIGHT);
			expect(uiStateStore.colorScheme).to.equal(ColorScheme.LIGHT);

			uiStateStore.setColorScheme(ColorScheme.DARK);
			expect(uiStateStore.colorScheme).to.equal(ColorScheme.DARK);

			uiStateStore.setColorScheme(ColorScheme.SYSTEM);
			expect(uiStateStore.colorScheme).to.equal(ColorScheme.SYSTEM);
		});

		it("sets system color scheme", () => {
			uiStateStore.setSystemColorScheme(ColorScheme.DARK);

			expect(uiStateStore.systemColorScheme).to.equal(ColorScheme.DARK);
		});

		it("detects system and user dark mode", () => {
			uiStateStore.setSystemColorScheme(ColorScheme.DARK);
			uiStateStore.setColorScheme(ColorScheme.SYSTEM);

			expect(uiStateStore.isSystemAndUserDark()).to.be.true;
		});

		it("detects explicit dark mode", () => {
			uiStateStore.setColorScheme(ColorScheme.DARK);

			expect(uiStateStore.isSystemAndUserDark()).to.be.true;
		});

		it("returns false for light mode", () => {
			uiStateStore.setSystemColorScheme(ColorScheme.LIGHT);
			uiStateStore.setColorScheme(ColorScheme.SYSTEM);

			expect(uiStateStore.isSystemAndUserDark()).to.be.false;
		});
	});

	describe("slide surface", () => {
		it("sets slide surface size", () => {
			const size = new Dimension(1920, 1080);

			uiStateStore.setSlideSurfaceSize(size);

			expect(uiStateStore.slideSurfaceSize.width).to.equal(1920);
			expect(uiStateStore.slideSurfaceSize.height).to.equal(1080);
		});
	});

	describe("content layout", () => {
		it("sets content layout", () => {
			uiStateStore.setContentLayout(ContentLayout.Gallery);

			expect(uiStateStore.contentLayout).to.equal(ContentLayout.Gallery);
		});

		it("sets content focus", () => {
			uiStateStore.setContentFocus(ContentFocus.Document);

			expect(uiStateStore.contentFocus).to.equal(ContentFocus.Document);
		});

		it("sets previous content focus", () => {
			uiStateStore.setPreviousContentFocus(ContentFocus.Participants);

			expect(uiStateStore.previousContentFocus).to.equal(ContentFocus.Participants);
		});
	});

	describe("visibility toggles", () => {
		it("sets chat visibility", () => {
			uiStateStore.setChatVisible(true);
			expect(uiStateStore.chatVisible).to.be.true;

			uiStateStore.setChatVisible(false);
			expect(uiStateStore.chatVisible).to.be.false;
		});

		it("toggles chat visibility", () => {
			const initial = uiStateStore.chatVisible;

			uiStateStore.toggleChatVisible();

			expect(uiStateStore.chatVisible).to.equal(!initial);

			uiStateStore.toggleChatVisible();

			expect(uiStateStore.chatVisible).to.equal(initial);
		});

		it("sets participants visibility", () => {
			uiStateStore.setParticipantsVisible(true);
			expect(uiStateStore.participantsVisible).to.be.true;

			uiStateStore.setParticipantsVisible(false);
			expect(uiStateStore.participantsVisible).to.be.false;
		});

		it("toggles participants visibility", () => {
			const initial = uiStateStore.participantsVisible;

			uiStateStore.toggleParticipantsVisible();

			expect(uiStateStore.participantsVisible).to.equal(!initial);
		});

		it("sets screen visibility", () => {
			uiStateStore.setScreenVisible(true);

			expect(uiStateStore.screenVisible).to.be.true;
		});

		it("sets right container visibility", () => {
			uiStateStore.setRightContainerVisible(true);

			expect(uiStateStore.rightContainerVisible).to.be.true;
		});
	});

	describe("camera feed", () => {
		it("sets receive camera feed", () => {
			uiStateStore.setReceiveCameraFeed(false);

			expect(uiStateStore.receiveCameraFeed).to.be.false;

			uiStateStore.setReceiveCameraFeed(true);

			expect(uiStateStore.receiveCameraFeed).to.be.true;
		});
	});

	describe("quiz state", () => {
		it("sets quiz sent state", () => {
			uiStateStore.setQuizSent(true);

			expect(uiStateStore.quizSent).to.be.true;

			uiStateStore.setQuizSent(false);

			expect(uiStateStore.quizSent).to.be.false;
		});
	});

	describe("persistence", () => {
		it("persists settings to localStorage", () => {
			uiStateStore.setColorScheme(ColorScheme.DARK);
			uiStateStore.persist();

			const stored = localStorage.getItem("ui.store");
			expect(stored).to.not.be.null;

			const parsed = JSON.parse(stored!);
			expect(parsed.colorScheme).to.equal(ColorScheme.DARK);
		});

		it("persists participant sort settings", () => {
			uiStateStore.persist();

			const stored = localStorage.getItem("ui.store");
			const parsed = JSON.parse(stored!);

			expect(parsed.participantsSortProperty).to.exist;
			expect(parsed.participantsSortOrder).to.exist;
		});
	});

	describe("MobX reactivity", () => {
		it("uiStateStore is observable", () => {
			expect(isObservable(uiStateStore)).to.be.true;
		});

		it("state is observable property", () => {
			expect(isObservableProp(uiStateStore, "state")).to.be.true;
		});
	});
});

