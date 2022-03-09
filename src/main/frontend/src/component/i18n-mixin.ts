import { LitElement } from 'lit';
import i18next, { t } from 'i18next';

type Constructor<T = {}> = new (...args: any[]) => T;

export const I18nMixin = <T extends Constructor<LitElement>>(superClass: T) => {

	class I18nMixinClass extends superClass {

		connectedCallback() {
			super.connectedCallback();

			this.initialize();
		}

		private initialize() {
			i18next.on("languageChanged", options => {
				this.requestUpdate()
			});
		}

	};

	// Cast return type to the superClass type passed in.
	return I18nMixinClass as T;

}

export const I18nLitElement = I18nMixin(LitElement);
export { t };