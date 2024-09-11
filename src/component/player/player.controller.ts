import { ReactiveController } from 'lit';
import { courseStore } from "../../store/course.store";
import { deviceStore } from "../../store/device.store";
import { uiStateStore } from "../../store/ui-state.store";
import { userStore } from "../../store/user.store";
import { CourseApi } from "../../transport/course-api";
import { CourseUserApi } from "../../transport/course-user-api";
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


	constructor(host: LecturePlayer) {
		this.host = host;

		host.addController(this);

		uiStateStore.host = host;
	}

	hostConnected() {
		const { eventService, eventEmitter } = this.host.appContext;

		// Persist all settings.
		addEventListener("pagehide", () => {
			uiStateStore.persist();
			deviceStore.persist();
		});

		eventService.connect();

		// Application wide events.
		eventEmitter.addEventListener("lp-fullscreen", this.onFullscreen.bind(this));
		eventEmitter.addEventListener("lp-settings", this.onDeviceSettings.bind(this));
		// Global course events.
		eventEmitter.addEventListener("lp-event-service-state", this.onEventServiceState.bind(this));
		eventEmitter.addEventListener("lp-chat-state", this.onChatState.bind(this));
		eventEmitter.addEventListener("lp-quiz-state", this.onQuizState.bind(this));
		eventEmitter.addEventListener("lp-recording-state", this.onRecordingState.bind(this));
		eventEmitter.addEventListener("lp-stream-state", this.onStreamState.bind(this));
	}

	async load() {
		await this.loadUserInfo();
		await this.loadCourses();
	}

	private async loadUserInfo() {
		const userInfo = await CourseUserApi.getUserInformation();

		userStore.setUserId(userInfo.userId);
		userStore.setName(userInfo.firstName, userInfo.familyName);
		userStore.setParticipantType(userInfo.participantType);
	}

	private async loadCourses() {
		const courses = await CourseApi.getCourses();

		courseStore.setCourses(courses);

		courseStore.setCourseRoles([
			{
				name: "organisator",
				description: "course.role.organisator",
				order: 0
			},
			{
				name: "co-organisator",
				description: "course.role.co-organisator",
				order: 1
			},
			{
				name: "registered-participant",
				description: "course.role.registered-participant",
				order: 2
			},
			{
				name: "participant",
				description: "course.role.participant",
				order: 3
			}]);
	}

	private onFullscreen(event: LpFullscreenEvent) {
		this.setFullscreen(event.detail);
	}

	private onDeviceSettings() {
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
}
