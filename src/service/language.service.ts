import i18next, { Callback } from "i18next";
import { autorun } from "mobx";
import { Locale } from "../model/locale";
import { uiStateStore } from "../store/ui-state.store";
import LanguageDetector from "i18next-browser-languagedetector";
import * as resources from "../locales";

export class LanguageService extends EventTarget {

	private readonly supportedLanguages = ["de", "en"];

	private readonly languages = new Array<Locale>();


	constructor() {
		super();

		this.init();
		this.loadLocales();
		this.initLocale();

		autorun(() => {
			i18next.changeLanguage(uiStateStore.language);
		});
	}

	/**
	 * Returns supported locales.
	 */
	public getLocales() {
		return this.languages;
	}

	private init() {
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
			} as Callback);
	}

	private loadLocales() {
		this.supportedLanguages.forEach((lang: string) => {
			const languageNames = new Intl.DisplayNames(lang, { type: "language" });

			try {
				const displayName = languageNames.of(lang.toUpperCase());
				if (displayName) {
					const language: Locale = {
						tag: lang,
						displayName: displayName
					};

					this.languages.push(language);
				}
			}
			catch (e) {
				// Ignore
			}
		});
	}

	/**
	 * Set default locale if none was set previously.
	 */
	private initLocale() {
		if (!uiStateStore.language) {
			uiStateStore.setLanguage(i18next.resolvedLanguage ?? i18next.language);
		}
	}
}
