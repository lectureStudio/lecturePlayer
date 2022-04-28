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
					"course.unavailable": "Course is currently not available. Please try again later.",
					"settings.title": "Device settings",
					"settings.cancel": "Cancel",
					"settings.save": "Save",

					"devices.cancel": "Cancel",
					"devices.close": "Close",
					"devices.next": "Next",
					"devices.none": "None",
					"devices.init.once": "You only have to make this setting once.",
					"devices.camera": "Camera",
					"devices.camera.activate": "Activate camera (optional)",
					"devices.camera.blocked": "Access to camera not possible. Make sure that no other application is accessing this camera.",
					"devices.audio.input": "Audio Input",
					"devices.audio.input.init": "For a speech, you need to select a microphone and give the browser permission to use it.",
					"devices.audio.output": "Audio Output",
					"devices.audio.rec.test": "Test microphone by recording",
					"devices.audio.rec.test.description": "The recording is only cached locally in the browser.",
					"devices.audio.rec.test.start": "Start",
					"devices.audio.rec.test.stop": "Stop",
					"devices.permission": "You need to grant permission to access audio and video devices.",
					"devices.permission.required": "Permission required",
					"devices.save.changes": "Save",
					"devices.reset": "Reset",
					"devices.settings": "Device settings",
				}
			}
		}
	});
