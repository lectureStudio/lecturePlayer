import { expect } from "@open-wc/testing";
import { Settings, MediaProfile } from "./settings.js";

describe("Settings", () => {
	const originalLocalStorage = window.localStorage;

	afterEach(() => {
		localStorage.removeItem("media.profile");
	});

	describe("getMediaProfile", () => {
		it("returns null when not set", () => {
			localStorage.removeItem("media.profile");
			const result = Settings.getMediaProfile();
			expect(result).to.be.null;
		});

		it("returns stored classroom profile", () => {
			localStorage.setItem("media.profile", MediaProfile.Classroom);
			const result = Settings.getMediaProfile();
			expect(result).to.equal(MediaProfile.Classroom);
		});

		it("returns stored home profile", () => {
			localStorage.setItem("media.profile", MediaProfile.Home);
			const result = Settings.getMediaProfile();
			expect(result).to.equal(MediaProfile.Home);
		});
	});
});

describe("MediaProfile enum", () => {
	it("has Classroom value", () => {
		expect(MediaProfile.Classroom).to.equal("classroom");
	});

	it("has Home value", () => {
		expect(MediaProfile.Home).to.equal("home");
	});
});

