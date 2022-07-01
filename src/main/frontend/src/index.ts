export * from './extension';

import './component/player/player';
import './component/slide-view/slide-view';
import './component/player-view/player-view';
import './component/controls/player-controls';
import './component/settings-modal/settings.modal'
import './component/speech-accepted-modal/speech-accepted.modal'
import './component/loading/player-loading';
import './component/offline/player-offline';
import './component/chat-box/chat-box';
import './component/message-form/message-form';
import './component/quiz-form/quiz-form';
import './component/toast/toast';
import "web-dialog/index";

import i18next from 'i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import { Toaster } from './component/toast/toaster';
import { ToastGravity, ToastPosition } from './component/toast/toast';

const pdfjs = require('pdfjs-dist');
const PdfjsWorker = require("worker-loader?esModule=false&filename=[name].js!pdfjs-dist/build/pdf.worker.js");

if (typeof window !== "undefined" && "Worker" in window) {
	pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();
}

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
					"devices.querying": "Querying..",
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

					"course.feature.close": "Close",

					"course.feature.message.chat": "Chat",
					"course.feature.message.description": "Send a message to lecturer",
					"course.feature.message.placeholder": "Enter your Message",
					"course.feature.message.send": "Send",
					"course.feature.message.send.error": "Failed to send message",
					"course.feature.message.sent": "Your message has been successfully sent",

					"course.feature.quiz": "Quiz",
					"course.feature.quiz.send": "Send",
					"course.feature.quiz.send.error": "Failed to send answer",
					"course.feature.quiz.count.error": "Only one answer per quiz is allowed",
					"course.feature.quiz.input.invalid": "Input not allowed",
					"course.feature.quiz.sent": "Your answer has been successfully sent",

					"course.speech.request.accepted": "Speech request accepted",
					"course.speech.request.accepted.description": "Start your speech now or cancel it if you have changed your mind.",
					"course.speech.request.rejected": "Speech request rejected",
					"course.speech.request.cancel": "Cancel",
					"course.speech.request.start": "Start",
					"course.speech.request.speak": "You can speak now",
					"course.speech.request.ended": "Speech ended",
					"course.speech.request.without.camera": "Speech is performed without camera.",

					"course.recorded.modal.title": "This course is being recorded",
					"course.recorded.modal.message": "The recording can be published later. As a digital event, this affects your contributions during active requests to speak.",
					"course.recorded.modal.accept": "Got it",

					"entry.modal.title": "Start media playback",
					"entry.modal.description": "To play audio and video, click Start.",
					"entry.modal.start": "Start",
				}
			}
		}
	});

Toaster.init({
	duration: 5000,
	gravity: ToastGravity.Top,
	position: ToastPosition.Center,
	closeable: false,
	stopOnFocus: true
});