import { t } from "i18next";
import { SettingsModal } from "../component/settings-modal/settings.modal";
import { SpeechAcceptedModal } from "../component/speech-accepted-modal/speech-accepted.modal";
import { CourseContext } from "../context/course.context";
import { LpSpeechRequestEvent, LpSpeechStateEvent } from "../event";
import { courseStore } from "../store/course.store";
import { deviceStore } from "../store/device.store";
import { CourseSpeechApi } from "../transport/course-speech-api";
import { Devices } from "../utils/devices";
import { EventEmitter } from "../utils/event-emitter";
import { Toaster } from "../utils/toaster";
import { Utils } from "../utils/utils";
import { Controller } from "./controller";
import { StreamController } from "./stream.controller";

export class SpeechController extends Controller {

	private readonly streamController: StreamController;

	private speechRequestId: string | undefined;

	private speechStarted: boolean;

	private devicesSelected: boolean;


	constructor(context: CourseContext, streamController: StreamController) {
		super(context.applicationContext);

		this.streamController = streamController;
	}

	protected override initializeEvents(eventEmitter: EventEmitter): void {
		eventEmitter.addEventListener("lp-speech-state", this.onSpeechState.bind(this));
		eventEmitter.addEventListener("lp-speech-request", this.onSpeechRequest.bind(this));
	}

	public override dispose(): void {
		super.dispose();

		this.cancelSpeech();
	}

	private onSpeechState(event: LpSpeechStateEvent) {
		const speechState = event.detail;

		if (this.speechRequestId && speechState.requestId === this.speechRequestId) {
			if (speechState.accepted) {
				this.speechAccepted();
			}
			else {
				Toaster.showInfo(`${this.speechStarted
					? t("course.speech.request.ended")
					: t("course.speech.request.rejected")}`);

				this.speechCanceled();
			}
		}
	}

	private onSpeechRequest(event: LpSpeechRequestEvent) {
		const handUp = event.detail;

		if (handUp) {
			this.initSpeech();
		}
		else {
			this.streamController.stopSpeech();

			this.cancelSpeech();
		}
	}

	private initSpeech() {
		if (this.devicesSelected) {
			this.sendSpeechRequest();
		}
		else {
			this.showSpeechSettingsModal();
		}
	}

	private speechAccepted() {
		const audioSource = deviceStore.microphoneDeviceId;
		const videoSource = deviceStore.cameraDeviceId;
		const constraints = {
			audio: {
				deviceId: audioSource ? { exact: audioSource } : undefined
			},
			video: videoSource !== "none"
				? {
					deviceId: videoSource ? { exact: videoSource } : undefined,
					width: { ideal: 1280 },
					height: { ideal: 720 },
					facingMode: "user"
				}
				: undefined
		};

		navigator.mediaDevices.getUserMedia(constraints)
			.then(stream => {
				this.showSpeechAcceptedModal(stream, false);
			})
			.catch(error => {
				console.error(error.name);

				// Try again without camera which might be blocked.
				constraints.video = undefined;

				navigator.mediaDevices.getUserMedia(constraints)
					.then(stream => {
						this.showSpeechAcceptedModal(stream, true);
					})
					.catch(error => {
						console.error(error.name);

						// Give up. Show an error message.
						this.cancelSpeech();

						Toaster.showError(t("course.speech.request.aborted"));
					});
			});
	}

	private sendSpeechRequest() {
		if (!courseStore.activeCourse) {
			throw new Error("Course is not set");
		}

		CourseSpeechApi.requestSpeech(courseStore.activeCourse.id)
			.then(requestId => {
				this.speechRequestId = requestId;
			})
			.catch(error => console.error(error));
	}

	private cancelSpeech() {
		if (!this.speechRequestId) {
			this.speechCanceled();
			// this.showWithdrawn();
			return;
		}

		if (!courseStore.activeCourse) {
			throw new Error("Course is not set");
		}

		CourseSpeechApi.cancelSpeech(courseStore.activeCourse.id, this.speechRequestId)
			.then(() => {
				this.speechCanceled();
				this.showWithdrawn();
			})
			.catch(error => console.error(error));
	}

	private showWithdrawn() {
		Toaster.showInfo(`${this.speechStarted, t("course.speech.request.withdrawn")}`);
	}

	private speechCanceled() {
		this.speechRequestId = undefined;
		this.speechStarted = false;

		// Close dialog in case the request was initially accepted.
		this.applicationContext.modalController.closeAndDeleteModal("SpeechAcceptedModal");

		this.applicationContext.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-speech-canceled"));
	}

	private showSpeechAcceptedModal(stream: MediaStream, camBlocked: boolean) {
		if (this.speechRequestId) {
			const speechModal = new SpeechAcceptedModal();
			speechModal.stream = stream;
			speechModal.cameraBlocked = camBlocked;
			speechModal.addEventListener("speech-accepted-canceled", () => {
				this.cancelSpeech();
			});
			speechModal.addEventListener("speech-accepted-start", () => {
				this.streamController.startSpeech(!camBlocked);

				this.speechStarted = true;
			});

			this.applicationContext.modalController.registerModal("SpeechAcceptedModal", speechModal);
		}
		else {
			// Speech has been aborted by the remote peer.
			Devices.stopMediaTracks(stream);
		}
	}

	private showSpeechSettingsModal() {
		const settingsModal = new SettingsModal();
		settingsModal.addEventListener("device-settings-canceled", () => {
			this.cancelSpeech();
		});
		settingsModal.addEventListener("device-settings-saved", () => {
			this.devicesSelected = true;
			this.sendSpeechRequest();
		});

		this.applicationContext.modalController.registerModal("SettingsModal", settingsModal);
	}
}
