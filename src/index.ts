export * from './extension';

// Make components available to the document.
export * from './component';

import i18next from 'i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import * as resources from './locales';


class lectPlayer {

	constructor() {
		window.onload = function () {
			document.body.appendChild(document.createElement("lecture-player-styles"));
		}

		this.initPDF();
		this.initI18n();
	}

	initPDF() {
		const pdfjs = require('pdfjs-dist');
		const PdfjsWorker = require("worker-loader?esModule=false&filename=js/[name].js!pdfjs-dist/build/pdf.worker.js");

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