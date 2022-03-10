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
