export * from './extension';

import './component/player/player';
import './component/slide-view/slide-view';
import './component/player-view/player-view';
import './component/controls/player-controls';
import './component/settings-modal/settings-modal'
import './component/player-loading/player-loading';
import './component/player-offline/player-offline';
import './component/chat-box/chat-box';
import './component/message-form/message-form';
import './component/toast/toast';

import i18next from 'i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import { Toaster } from './utils/toaster';
import { ToastGravity, ToastPosition } from './component/toast/toast';

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

					"player.view.chat": "Chat",

					"course.feature.message.description": "Send a message to lecturer",
					"course.feature.message.placeholder": "Enter your Message",
					"course.feature.message.send": "Send",
					"course.feature.message.send.error": "Failed to send message",
					"course.feature.message.sent": "Your message has been successfully sent",

					"course.feature.quiz": "Quiz",
					"course.feature.close": "Close",
					"course.feature.quiz.send": "Send",
					"course.feature.quiz.send.error": "Failed to send answer",
					"course.feature.quiz.count.error": "Only one answer per quiz is allowed",
					"course.feature.quiz.input.invalid": "Input not allowed",
					"course.feature.quiz.sent": "Your answer has been successfully sent",
				}
			}
		}
	});

Toaster.init({
	duration: 3000,
	close: false,
	gravity: ToastGravity.Top,
	position: ToastPosition.Center,
	stopOnFocus: true,
});