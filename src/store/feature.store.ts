import { makeAutoObservable } from "mobx";
import { MessageFeature, QuizFeature } from "../model/course-feature";
import { privilegeStore } from "./privilege.store";

class FeatureStore {

	chatFeature: MessageFeature;

	quizFeature: QuizFeature;


	constructor() {
		makeAutoObservable(this);
	}

	setChatFeature(feature: MessageFeature) {
		this.chatFeature = feature;
	}

	setQuizFeature(feature: QuizFeature) {
		this.quizFeature = feature;
	}

	hasChatFeature() {
		return this.chatFeature != null && privilegeStore.canReadMessages();
	}

	hasQuizFeature() {
		return this.quizFeature != null && privilegeStore.canParticipateInQuiz();
	}

	reset() {
		this.chatFeature = null;
		this.quizFeature = null;
	}
}

export const featureStore = new FeatureStore();