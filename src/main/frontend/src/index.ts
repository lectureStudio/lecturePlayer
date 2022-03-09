export * from './extension';

import './component/player/player';
import './component/slide-view/slide-view';
import './component/player-view/player-view';
import './component/controls/player-controls';
import './component/settings-modal/settings-modal'
import './component/player-loading/player-loading';
import './component/player-offline/player-offline';

import i18next from 'i18next';
import LanguageDetector from "i18next-browser-languagedetector";

i18next
	.use(LanguageDetector)
	.init({
		debug: false,
		supportedLngs: ["de", "en"],
		fallbackLng: "en",
		// Allow "en" to be used for "en-US", "en-CA", etc.
		nonExplicitSupportedLngs: true, 
		resources: {
			en: {
				translation: {
					"course.loading": "Loading Course...",
					"course.unavailable": "Course is currently not available. Please try again later."
				}
			}
		}
	});



/*
class LecturePlayer {

	addPeer(peerId: BigInt) {
		this.janusService.addPeer(peerId);
	}

	startSpeech(deviceConstraints: any): void {
		this.janusService.startSpeech(deviceConstraints);
	}

	stopSpeech(): void {
		this.janusService.stopSpeech();
		this.setRaiseHand(false);
	}

	setDeviceConstraints(deviceConstraints: any): void {
		this.janusService.setDeviceConstraints(deviceConstraints);
	}

	setContainer(container: HTMLElement): void {
		this.container = container;
	}

	setContainerA(element: HTMLElement): void {
		this.playbackModel.elementAProperty.value = element;
	}

	setOnError(consumer: Observer<any>): void {
		this.janusService.setOnError(consumer);
	}

	setOnConnectedState(consumer: Observer<boolean>): void {
		this.playbackModel.webrtcConnectedProperty.subscribe(consumer);
	}

	setOnConnectedSpeechState(consumer: Observer<boolean>): void {
		this.playbackModel.webrtcPublisherConnectedProperty.subscribe(consumer);
	}

	setOnSettings(consumer: Observer<boolean>): void {
		this.onSettingsConsumer = consumer;
	}

	setOnRaiseHand(consumer: Observer<boolean>): void {
		this.playbackModel.raisedHandProperty.subscribe(consumer);
	}

	setOnShowQuiz(consumer: Observer<boolean>): void {
		this.playbackModel.showQuizProperty.subscribe(consumer);
	}

	setShowQuiz(show: boolean): void {
		this.playbackModel.showQuiz = show;
	}

	setQuizActive(active: boolean): void {
		this.playbackModel.showQuizActive = active;
	}

	setRaiseHand(raise: boolean): void {
		this.playbackModel.raisedHand = raise;
	}

	setStartTime(startTime: bigint) {
		this.startTime = startTime;
	}

	setMuted(muted: boolean) {
		this.playbackModel.setMuted(muted);
	}

	setUserId(userId: string) {
		this.janusService.setUserId(userId);
	}

	setRoomId(id: number) {
		this.roomId = id;

		this.janusService.setRoomId(id);
	}
}
*/