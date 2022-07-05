export * from './extension';

import './component/player/player';
import './component/slide-view/slide-view';
import './component/player-view/player-view';
import './component/controls/player-controls';
import './component/loading/player-loading';
import './component/offline/player-offline';
import './component/chat-box/chat-box';
import './component/message-form/message-form';
import './component/quiz-form/quiz-form';
import './component/toast/toast';
import "web-dialog/index";

import i18next from 'i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import * as resources from './locales';

import { Toaster } from './component/toast/toaster';
import { ToastGravity, ToastPosition } from './component/toast/toast';


class App {

	constructor() {
		this.initPDF();
		this.initI18n();
		this.initToaster();
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

	initToaster() {
		Toaster.init({
			duration: 5000,
			gravity: ToastGravity.Top,
			position: ToastPosition.Center,
			closeable: false,
			stopOnFocus: true
		});
	}
}

new App();