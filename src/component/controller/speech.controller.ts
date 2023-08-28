import { t } from "i18next";
import { SpeechStateEvent } from "../../model/event/queue-events";
import { Toaster } from "../../utils/toaster";
import { ApplicationContext } from "./context";
import { Controller } from "./controller";
import { SettingsModal } from "../settings-modal/settings.modal";
import { SpeechAcceptedModal } from "../speech-accepted-modal/speech-accepted.modal";
import { Devices } from "../../utils/devices";
import { Utils } from "../../utils/utils";
import { CourseSpeechApi } from "../../transport/course-speech-api";
import { courseStore } from "../../store/course.store";
import { deviceStore } from "../../store/device.store";
import { RootController } from "./root.controller";

export class SpeechController extends Controller {

	private speechRequestId: string;

	private speechStarted: boolean;

	private devicesSelected: boolean;


	constructor(rootController: RootController, context: ApplicationContext) {
		super(rootController, context);

		context.eventEmitter.addEventListener("speech-state", this.onSpeechState.bind(this));
		context.eventEmitter.addEventListener("player-hand-action", this.onHandAction.bind(this), false);
	}

	private onSpeechState(event: CustomEvent) {
		const speechEvent: SpeechStateEvent = event.detail;

		if (this.speechRequestId && speechEvent.requestId === this.speechRequestId) {
			if (speechEvent.accepted) {
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

	private onHandAction(event: CustomEvent) {
		const handUp = event.detail.handUp;

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

						// Give up. Show error message.
						this.cancelSpeech();

						Toaster.showError(t("course.speech.request.aborted"));
					});
			});
	}

	private sendSpeechRequest() {
		CourseSpeechApi.requestSpeech(courseStore.courseId)
			.then(requestId => {
				this.speechRequestId = requestId;
			})
			.catch(error => console.error(error));
	}

	private cancelSpeech() {
		if (!this.speechRequestId) {
			this.speechCanceled();
			return;
		}

		CourseSpeechApi.cancelSpeech(courseStore.courseId, this.speechRequestId)
			.then(() => {
				this.speechCanceled();
			})
			.catch(error => console.error(error));
	}

	private speechCanceled() {
		this.speechRequestId = null;
		this.speechStarted = false;

		// Close dialog in case the request was initially accepted.
		this.modalController.closeAndDeleteModal("SpeechAcceptedModal");

		this.eventEmitter.dispatchEvent(Utils.createEvent("speech-canceled"));
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

			this.modalController.registerModal("SpeechAcceptedModal", speechModal);
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

		this.modalController.registerModal("SettingsModal", settingsModal);
	}
}