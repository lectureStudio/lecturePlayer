import { makeAutoObservable } from "mobx";
import { MessageFeature, QuizFeature } from "../model/course-feature";
import { privilegeStore } from "./privilege.store";
import { uiStateStore } from "./ui-state.store";

class FeatureStore {

	chatFeature: MessageFeature | undefined;

	quizFeature: QuizFeature | undefined;


	constructor() {
		makeAutoObservable(this);
	}

	setChatFeature(feature: MessageFeature | undefined) {
		this.chatFeature = feature;

		uiStateStore.setChatVisible(this.hasChatFeature());
	}

	setQuizFeature(feature: QuizFeature | undefined) {
		this.quizFeature = feature;
	}

	hasChatFeature() {
		return this.chatFeature != null && privilegeStore.canReadMessages();
	}

	hasQuizFeature() {
		return this.quizFeature != null && privilegeStore.canParticipateInQuiz();
	}

	hasFeatures() {
		return this.hasChatFeature() || this.hasQuizFeature();
	}

	reset() {
		this.chatFeature = undefined;
		this.quizFeature = undefined;
	}
}

export const featureStore = new FeatureStore();