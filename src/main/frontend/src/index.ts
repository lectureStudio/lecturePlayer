export * from './extension';

import './component/player/player';
import './component/slide-view/slide-view';
import './component/player-view/player-view';
import './component/controls/player-controls';
import './component/loading/player-loading';
import './component/offline/player-offline';
import './component/feature-view/feature-view';
import './component/chat-box/chat-box';
import './component/message-form/message-form';
import './component/participants-box/participants-box';
import './component/quiz-box/quiz-box';
import './component/quiz-form/quiz-form';
import './component/modal/modal';
import './component/screen-view/screen-view';
import './component/toast/toast';
import './component/tooltip/tooltip';

import i18next from 'i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import * as resources from './locales';


class lectPlayer {

	constructor() {
		this.initPDF();
		this.initI18n();
	}

	initPDF() {
		const pdfjs = require('pdfjs-dist');
		const PdfjsWorker = require("worker-loader?esModule=false&filename=[name].js!pdfjs-dist/build/pdf.worker.js");

		if (typeof window !== "undefined" && "Worker" in window) {
			pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();
		}
	}

	initI18n() {
		i18next
			.use(LanguageDetector)
			.init({
				debug: false,
				supportedLngs: ["de", "en"],
				fallbackLng: "en",
				// Allow "en" to be used for "en-US", "en-CA", etc.
				nonExplicitSupportedLngs: true,
				ns: "main",
				resources: resources
			});
	}
}

new lectPlayer();