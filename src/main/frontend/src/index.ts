import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/button-group/button-group';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/divider/divider';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/menu-label/menu-label';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/qr-code/qr-code.js';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import '@shoelace-style/shoelace/dist/components/resize-observer/resize-observer.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip';
import '@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden';

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

setBasePath('/js/shoelace');


export * from './extension';

import './component/player/player';
import './component/slide-view/slide-view';
import './component/player-view/player-view';
import './component/loading/player-loading';
import './component/offline/player-offline';
import './component/modal/modal';

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