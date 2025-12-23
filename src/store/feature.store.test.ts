import { expect } from "@open-wc/testing";
import { featureStore } from "./feature.store.js";
import { privilegeStore } from "./privilege.store.js";

describe("FeatureStore", () => {
	beforeEach(() => {
		featureStore.reset();
		privilegeStore.reset();
	});

	afterEach(() => {
		featureStore.reset();
		privilegeStore.reset();
	});

	describe("setChatFeature", () => {
		it("sets chat feature", () => {
			featureStore.setChatFeature({ enabled: true });
			expect(featureStore.chatFeature).to.deep.equal({ enabled: true });
		});

		it("clears chat feature with undefined", () => {
			featureStore.setChatFeature({ enabled: true });
			featureStore.setChatFeature(undefined);
			expect(featureStore.chatFeature).to.be.undefined;
		});
	});

	describe("setQuizFeature", () => {
		it("sets quiz feature", () => {
			featureStore.setQuizFeature({ enabled: true });
			expect(featureStore.quizFeature).to.deep.equal({ enabled: true });
		});

		it("clears quiz feature with undefined", () => {
			featureStore.setQuizFeature({ enabled: true });
			featureStore.setQuizFeature(undefined);
			expect(featureStore.quizFeature).to.be.undefined;
		});
	});

	describe("hasChatFeature", () => {
		it("returns false when chat feature is undefined", () => {
			expect(featureStore.hasChatFeature()).to.be.false;
		});

		it("returns false when user cannot read messages", () => {
			featureStore.setChatFeature({ enabled: true });
			// No privileges set, so cannot read messages
			expect(featureStore.hasChatFeature()).to.be.false;
		});
	});

	describe("hasQuizFeature", () => {
		it("returns false when quiz feature is undefined", () => {
			expect(featureStore.hasQuizFeature()).to.be.false;
		});

		it("returns false when user cannot participate in quiz", () => {
			featureStore.setQuizFeature({ enabled: true });
			// No privileges set
			expect(featureStore.hasQuizFeature()).to.be.false;
		});
	});

	describe("hasFeatures", () => {
		it("returns false when no features", () => {
			expect(featureStore.hasFeatures()).to.be.false;
		});
	});

	describe("reset", () => {
		it("resets chat feature", () => {
			featureStore.setChatFeature({ enabled: true });
			featureStore.reset();
			expect(featureStore.chatFeature).to.be.undefined;
		});

		it("resets quiz feature", () => {
			featureStore.setQuizFeature({ enabled: true });
			featureStore.reset();
			expect(featureStore.quizFeature).to.be.undefined;
		});
	});
});

