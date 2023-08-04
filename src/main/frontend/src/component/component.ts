import { MobxReactionUpdate } from "@adobe/lit-mobx";
import { I18nLitElement } from "./i18n-mixin";

export abstract class Component extends MobxReactionUpdate(I18nLitElement) {

	constructor() {
		super();
	}

}