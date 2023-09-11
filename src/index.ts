export * from "./extension";

// Make components available to the document.
export * from "./component";

import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "./locales/en/main.json";
import deTranslation from "./locales/de/main.json";

import * as pdfjs from "pdfjs-dist";


class lectPlayer {

	constructor() {
		window.onload = function () {
			document.body.appendChild(document.createElement("lecture-player-styles"));
		}

		this.initPDF();
		this.initI18n();
	}

	initPDF() {
		pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.js";
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
				resources: {
					en: { main: enTranslation },
					de: { main: deTranslation },
				}
			});
	}
}

new lectPlayer();