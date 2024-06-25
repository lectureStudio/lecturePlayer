import { ReactiveController } from 'lit';
import { autorun } from "mobx";
import { ColorScheme } from "../../model/ui-state";
import { courseStore } from "../../store/course.store";
import { uiStateStore } from "../../store/ui-state.store";
import { SettingsModal } from "../settings-modal/settings.modal";
import { LecturePlayer } from './player';
import {
	LpChatStateEvent,
	LpEventServiceStateEvent, LpFullscreenEvent,
	LpQuizStateEvent,
	LpRecordingStateEvent,
	LpStreamStateEvent,
} from '../../event';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;

	private colorSchemeQuery: MediaQueryList;


	constructor(host: LecturePlayer) {
		this.host = host;

		host.addController(this);

		uiStateStore.host = host;

		this.observeColorScheme();
	}

	hostConnected() {
		const { eventService, eventEmitter } = this.host.appContext;

		eventService.connect();

		// Application wide events.
		eventEmitter.addEventListener("lp-fullscreen", this.onFullscreen.bind(this));
		eventEmitter.addEventListener("lp-settings", this.onSettings.bind(this));
		// Global course events.
		eventEmitter.addEventListener("lp-event-service-state", this.onEventServiceState.bind(this));
		eventEmitter.addEventListener("lp-chat-state", this.onChatState.bind(this));
		eventEmitter.addEventListener("lp-quiz-state", this.onQuizState.bind(this));
		eventEmitter.addEventListener("lp-recording-state", this.onRecordingState.bind(this));
		eventEmitter.addEventListener("lp-stream-state", this.onStreamState.bind(this));

		autorun(() => {
			this.applyColorScheme();
		});
	}

	private onFullscreen(event: LpFullscreenEvent) {
		this.setFullscreen(event.detail);
	}

	private onSettings() {
		const settingsModal = new SettingsModal();

		this.host.appContext.modalController.registerModal("SettingsModal", settingsModal);
	}

	private setFullscreen(enable: boolean) {
		const isFullscreen = document.fullscreenElement !== null;

		if (enable) {
			if (uiStateStore.host.requestFullscreen && !isFullscreen) {
				uiStateStore.host.requestFullscreen();
			}
		}
		else {
			if (document.exitFullscreen && isFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	private onEventServiceState(event: LpEventServiceStateEvent) {
		const state = event.detail;

		console.log("~ on event service", state, uiStateStore.state);
	}

	private onChatState(event: LpChatStateEvent) {
		const chatState = event.detail;

		console.log("~ on chat state", chatState);

		const course = courseStore.findCourseById(chatState.courseId);
		if (course) {
			course.messageFeature = chatState.started ? chatState.feature : null;
		}
	}

	private onQuizState(event: LpQuizStateEvent) {
		const quizState = event.detail;

		console.log("~ on quiz state", quizState);

		const course = courseStore.findCourseById(quizState.courseId);
		if (course) {
			course.quizFeature = quizState.started ? quizState.feature : null;
		}
	}

	private onRecordingState(event: LpRecordingStateEvent) {
		const recordingState = event.detail;

		console.log("~ on recording state", recordingState);

		const course = courseStore.findCourseById(recordingState.courseId);
		if (course) {
			course.isRecorded = recordingState.recorded;
		}
	}

	private onStreamState(event: LpStreamStateEvent) {
		const streamState = event.detail;

		console.log("~ on stream state", streamState);

		const course = courseStore.findCourseById(streamState.courseId);
		if (course) {
			course.isLive = streamState.started;
		}
	}

	private applyColorScheme() {
		if (!document.body) {
			return;
		}

		const isDark = uiStateStore.isSystemAndUserDark();

		if (isDark) {
			document.body.classList.add("sl-theme-dark");
		}
		else {
			document.body.classList.remove("sl-theme-dark");
		}
	}

	private observeColorScheme() {
		if (window.matchMedia) {
			this.colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
			this.colorSchemeQuery.addEventListener("change", event => {
				uiStateStore.setSystemColorScheme(event.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
			});

			uiStateStore.setSystemColorScheme(this.colorSchemeQuery.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
		}
	}
}
