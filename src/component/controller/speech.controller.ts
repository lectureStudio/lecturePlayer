import { t } from "i18next";
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
import { LpSpeechRequestEvent, LpSpeechStateEvent } from "../../event";

export class SpeechController extends Controller {

	private speechRequestId: string | undefined;

	private speechStarted: boolean;

	private speechWithdrawn: boolean;

	private devicesSelected: boolean;


	constructor(rootController: RootController, context: ApplicationContext) {
		super(rootController, context);

		context.eventEmitter.addEventListener("lp-speech-state", this.onSpeechState.bind(this));
		context.eventEmitter.addEventListener("lp-speech-request", this.onSpeechRequest.bind(this));
	}

	private onSpeechState(event: LpSpeechStateEvent) {
		const speechState = event.detail;

		if (this.speechRequestId && speechState.requestId === this.speechRequestId && !this.speechWithdrawn) {
			if (speechState.accepted) {
				this.speechAccepted();
			}
			else {
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

				// Try again without a camera which might be blocked.
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
		CourseSpeechApi.requestSpeech(courseStore.courseId)
			.then(requestId => {
				this.speechRequestId = requestId;
				this.speechWithdrawn = false;
			})
			.catch(error => console.error(error));
	}

	private cancelSpeech() {
		this.speechWithdrawn = true;

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

	private showSpeechWithdrawn() {
		Toaster.showInfo(`${this.speechStarted, t("course.speech.request.withdrawn")}`);
	}

	private speechCanceled() {
		if (!this.speechWithdrawn) {
			Toaster.showInfo(`${this.speechStarted
				? t("course.speech.request.ended")
				: t("course.speech.request.rejected")}`);
		}

		this.speechRequestId = undefined;
		this.speechStarted = false;

		const modal = this.modalController.getModal("SpeechAcceptedModal") as SpeechAcceptedModal;
		if (modal) {
			modal.done = true;
		}

		// Close dialog in case the request was initially accepted.
		this.modalController.closeAndDeleteModal("SpeechAcceptedModal");

		this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-speech-canceled"));
	}

	private startSpeech(camBlocked: boolean) {
		this.streamController.startSpeech(!camBlocked);

		this.speechStarted = true;
		this.speechWithdrawn = false;
	}

	private showSpeechAcceptedModal(stream: MediaStream, camBlocked: boolean) {
		if (this.speechRequestId) {
			const speechModal = new SpeechAcceptedModal();
			speechModal.stream = stream;
			speechModal.cameraBlocked = camBlocked;
			speechModal.addEventListener("speech-accepted-canceled", () => {
				this.cancelSpeech();
				this.showSpeechWithdrawn();
			});
			speechModal.addEventListener("speech-accepted-start", () => {
				this.startSpeech(camBlocked);
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
