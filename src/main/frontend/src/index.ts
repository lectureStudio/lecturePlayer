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

import './component/player/player-styles';
import './component/player/player';
import './component/slide-view/slide-view';
import './component/player-view/player-view';
import './component/conference-view/conference-view';
import './component/controls/player-controls';
import './component/controls/audio-volume-button';
import './component/controls/media-device-button';
import './component/controls/documents-button';
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
import './component/stream-stats/stream-stats';
import './component/media-settings/camera-settings';
import './component/media-settings/sound-settings';

import i18next from 'i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import * as resources from './locales';


class lectPlayer {

	constructor() {
		this.initPDF();
		this.initI18n();

		window.onload = function () {
			document.body.appendChild(document.createElement("lecture-player-styles"));
		}
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