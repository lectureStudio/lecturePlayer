import { LitElement } from 'lit';
import i18next, { t } from 'i18next';

import commonStyles from './i18n-mixin.css';

/*eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": true }]*/
type Constructor<T = {}> = new (...args: any[]) => T;

export const I18nMixin = <T extends Constructor<LitElement>>(superClass: T) => {

	class I18nMixinClass extends superClass {

		static styles = [
			commonStyles
		];


		override connectedCallback() {
			super.connectedCallback();

			this.initializeI18N();
		}

		private initializeI18N() {
			i18next.on("languageChanged", (_options) => {
				this.requestUpdate()
			});
		}

	}

	// Cast return type to the superClass type passed in.
	return I18nMixinClass as T;

}

export const I18nLitElement = I18nMixin(LitElement);
export { t };
