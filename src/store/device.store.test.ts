import { expect } from "@open-wc/testing";
import { isObservable, isObservableProp } from "mobx";
import { deviceStore } from "./device.store.js";

// Note: isObservableProp only returns true for properties with initial values
// Properties without initial values are still reactive but may not be detected

describe("DeviceStore", () => {
	// Store original values to restore after tests
	let originalMicrophoneDeviceId: string;
	let originalSpeakerDeviceId: string;
	let originalSpeakerVolume: number;
	let originalCameraDeviceId: string;
	let originalMicrophoneMuteOnEntry: boolean;
	let originalCameraMuteOnEntry: boolean;

	beforeEach(() => {
		// Save original values
		originalMicrophoneDeviceId = deviceStore.microphoneDeviceId;
		originalSpeakerDeviceId = deviceStore.speakerDeviceId;
		originalSpeakerVolume = deviceStore.speakerVolume;
		originalCameraDeviceId = deviceStore.cameraDeviceId;
		originalMicrophoneMuteOnEntry = deviceStore.microphoneMuteOnEntry;
		originalCameraMuteOnEntry = deviceStore.cameraMuteOnEntry;

		// Clear localStorage to ensure clean state
		localStorage.removeItem("device.store");
	});

	afterEach(() => {
		// Restore original values
		deviceStore.microphoneDeviceId = originalMicrophoneDeviceId;
		deviceStore.speakerDeviceId = originalSpeakerDeviceId;
		deviceStore.speakerVolume = originalSpeakerVolume;
		deviceStore.cameraDeviceId = originalCameraDeviceId;
		deviceStore.microphoneMuteOnEntry = originalMicrophoneMuteOnEntry;
		deviceStore.cameraMuteOnEntry = originalCameraMuteOnEntry;

		// Clear localStorage
		localStorage.removeItem("device.store");
	});

	describe("initial state", () => {
		it("has default speaker volume of 1.0", () => {
			expect(deviceStore.speakerVolume).to.equal(1.0);
		});

		it("detects speaker selection capability", () => {
			// canSelectSpeaker should be a boolean based on browser support
			expect(typeof deviceStore.canSelectSpeaker).to.equal("boolean");
		});

		it("detects speaker volume capability", () => {
			// canSetSpeakerVolume should be a boolean based on browser/device
			expect(typeof deviceStore.canSetSpeakerVolume).to.equal("boolean");
		});
	});

	describe("microphone settings", () => {
		it("stores microphone device ID", () => {
			const deviceId = "test-mic-device-123";

			deviceStore.microphoneDeviceId = deviceId;

			expect(deviceStore.microphoneDeviceId).to.equal(deviceId);
		});

		it("tracks microphone blocked state", () => {
			deviceStore.microphoneBlocked = true;

			expect(deviceStore.microphoneBlocked).to.be.true;

			deviceStore.microphoneBlocked = false;

			expect(deviceStore.microphoneBlocked).to.be.false;
		});

		it("stores mute on entry preference", () => {
			deviceStore.microphoneMuteOnEntry = true;

			expect(deviceStore.microphoneMuteOnEntry).to.be.true;
		});
	});

	describe("speaker settings", () => {
		it("stores speaker device ID", () => {
			const deviceId = "test-speaker-device-456";

			deviceStore.speakerDeviceId = deviceId;

			expect(deviceStore.speakerDeviceId).to.equal(deviceId);
		});

		it("stores speaker volume", () => {
			deviceStore.speakerVolume = 0.5;

			expect(deviceStore.speakerVolume).to.equal(0.5);
		});

		it("accepts volume at boundaries", () => {
			deviceStore.speakerVolume = 0;
			expect(deviceStore.speakerVolume).to.equal(0);

			deviceStore.speakerVolume = 1;
			expect(deviceStore.speakerVolume).to.equal(1);
		});
	});

	describe("camera settings", () => {
		it("stores camera device ID", () => {
			const deviceId = "test-camera-device-789";

			deviceStore.cameraDeviceId = deviceId;

			expect(deviceStore.cameraDeviceId).to.equal(deviceId);
		});

		it("accepts 'none' as camera device ID", () => {
			deviceStore.cameraDeviceId = "none";

			expect(deviceStore.cameraDeviceId).to.equal("none");
		});

		it("tracks camera blocked state", () => {
			deviceStore.cameraBlocked = true;

			expect(deviceStore.cameraBlocked).to.be.true;

			deviceStore.cameraBlocked = false;

			expect(deviceStore.cameraBlocked).to.be.false;
		});

		it("stores camera mute on entry preference", () => {
			deviceStore.cameraMuteOnEntry = true;

			expect(deviceStore.cameraMuteOnEntry).to.be.true;
		});
	});

	describe("persistence", () => {
		it("persists settings to localStorage", () => {
			deviceStore.microphoneDeviceId = "mic-persist-test";
			deviceStore.speakerDeviceId = "speaker-persist-test";
			deviceStore.speakerVolume = 0.75;
			deviceStore.cameraDeviceId = "cam-persist-test";

			deviceStore.persist();

			const stored = localStorage.getItem("device.store");
			expect(stored).to.not.be.null;

			const parsed = JSON.parse(stored!);
			expect(parsed.microphoneDeviceId).to.equal("mic-persist-test");
			expect(parsed.speakerDeviceId).to.equal("speaker-persist-test");
			expect(parsed.speakerVolume).to.equal(0.75);
			expect(parsed.cameraDeviceId).to.equal("cam-persist-test");
		});
	});

	describe("MobX reactivity", () => {
		it("deviceStore is observable", () => {
			// Check that the store is observable
			expect(isObservable(deviceStore)).to.be.true;
		});

		it("speakerVolume is observable property", () => {
			// speakerVolume has an initial value, so it's observable
			expect(isObservableProp(deviceStore, "speakerVolume")).to.be.true;
		});
	});
});

