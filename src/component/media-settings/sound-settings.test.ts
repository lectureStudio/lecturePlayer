import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { SoundSettings } from "./sound-settings.js";
import "./sound-settings.js";

import { deviceStore } from "../../store/device.store.js";
import { Devices, DeviceInfo } from "../../utils/devices.js";

/**
 * Check if MediaStream is available in this environment.
 */
const hasMediaStream = typeof MediaStream !== "undefined";

/**
 * Creates a mock MediaDeviceInfo object.
 */
function createMockDevice(
	deviceId: string,
	kind: MediaDeviceKind,
	label: string = ""
): MediaDeviceInfo {
	return {
		deviceId,
		kind,
		label,
		groupId: "group-" + deviceId,
		toJSON: () => ({})
	};
}

/**
 * Creates a mock DeviceInfo result.
 */
function createMockDeviceInfo(
	devices: MediaDeviceInfo[],
	hasStream: boolean = true
): DeviceInfo {
	let mockStream: MediaStream | undefined = undefined;
	
	if (hasStream && hasMediaStream) {
		mockStream = new MediaStream();
		// Add mock audio track to stream
		Object.defineProperty(mockStream, "getAudioTracks", {
			value: () => [{
				kind: "audio",
				stop: () => {},
				readyState: "live"
			}]
		});
		Object.defineProperty(mockStream, "getTracks", {
			value: () => [{
				kind: "audio",
				stop: () => {}
			}]
		});
	}

	return {
		devices,
		stream: mockStream
	};
}

describe("SoundSettings", () => {
	let element: SoundSettings;

	// Store original values
	let originalMicrophoneDeviceId: string;
	let originalSpeakerDeviceId: string;
	let originalEnumerateAudioDevices: typeof Devices.enumerateAudioDevices;
	let originalGetDefaultDevice: typeof Devices.getDefaultDevice;
	let originalStopMediaTracks: typeof Devices.stopMediaTracks;
	let originalGetAudioLevel: typeof Devices.getAudioLevel;

	beforeEach(async () => {
		// Save original values
		originalMicrophoneDeviceId = deviceStore.microphoneDeviceId;
		originalSpeakerDeviceId = deviceStore.speakerDeviceId;
		originalEnumerateAudioDevices = Devices.enumerateAudioDevices;
		originalGetDefaultDevice = Devices.getDefaultDevice;
		originalStopMediaTracks = Devices.stopMediaTracks;
		originalGetAudioLevel = Devices.getAudioLevel;

		// Reset device store
		deviceStore.microphoneDeviceId = "";
		deviceStore.speakerDeviceId = "";
		deviceStore.microphoneBlocked = false;

		// Mock Devices methods
		Devices.stopMediaTracks = () => {};
		Devices.getAudioLevel = () => {};

		element = await fixture(html`<sound-settings></sound-settings>`);
	});

	afterEach(() => {
		// Restore original values
		deviceStore.microphoneDeviceId = originalMicrophoneDeviceId;
		deviceStore.speakerDeviceId = originalSpeakerDeviceId;
		Devices.enumerateAudioDevices = originalEnumerateAudioDevices;
		Devices.getDefaultDevice = originalGetDefaultDevice;
		Devices.stopMediaTracks = originalStopMediaTracks;
		Devices.getAudioLevel = originalGetAudioLevel;
	});

	describe("initialization", () => {
		it("renders loading state initially", async () => {
			expect(element.shadowRoot!.querySelector("player-loading")).to.exist;
		});

		it("starts with enabled=false", () => {
			expect(element.enabled).to.be.false;
		});

		it("starts with error=false", () => {
			expect(element.error).to.be.false;
		});
	});

	describe("queryDevices", () => {
		(hasMediaStream ? it : it.skip)("sets default microphone when none is set", async () => {
			const mockDevices = [
				createMockDevice("default-mic", "audioinput", "Default Microphone"),
				createMockDevice("mic-2", "audioinput", "USB Microphone"),
			];

			Devices.enumerateAudioDevices = () => Promise.resolve(
				createMockDeviceInfo(mockDevices)
			);
			Devices.getDefaultDevice = (devices) => devices[0];

			element.queryDevices();

			// Wait for async operation
			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			expect(deviceStore.microphoneDeviceId).to.equal("default-mic");
		});

		(hasMediaStream ? it : it.skip)("preserves existing microphone device ID", async () => {
			deviceStore.microphoneDeviceId = "existing-mic-id";

			const mockDevices = [
				createMockDevice("default-mic", "audioinput", "Default Microphone"),
			];

			Devices.enumerateAudioDevices = () => Promise.resolve(
				createMockDeviceInfo(mockDevices)
			);

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			// Should keep the existing ID
			expect(deviceStore.microphoneDeviceId).to.equal("existing-mic-id");
		});

		(hasMediaStream ? it : it.skip)("sets default speaker when none is set and supported", async () => {
			const originalCanSelectSpeaker = deviceStore.canSelectSpeaker;

			// Enable speaker selection for this test
			Object.defineProperty(deviceStore, "canSelectSpeaker", {
				value: true,
				writable: true,
				configurable: true
			});

			const mockDevices = [
				createMockDevice("default-speaker", "audiooutput", "Default Speaker"),
				createMockDevice("speaker-2", "audiooutput", "HDMI Audio"),
			];

			Devices.enumerateAudioDevices = () => Promise.resolve(
				createMockDeviceInfo(mockDevices)
			);
			Devices.getDefaultDevice = (devices) => devices[0];

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			expect(deviceStore.speakerDeviceId).to.equal("default-speaker");

			// Restore
			Object.defineProperty(deviceStore, "canSelectSpeaker", {
				value: originalCanSelectSpeaker,
				writable: true,
				configurable: true
			});
		});

		(hasMediaStream ? it : it.skip)("populates audio input devices list", async () => {
			const mockDevices = [
				createMockDevice("mic-1", "audioinput", "Microphone 1"),
				createMockDevice("mic-2", "audioinput", "Microphone 2"),
				createMockDevice("speaker-1", "audiooutput", "Speaker 1"),
			];

			Devices.enumerateAudioDevices = () => Promise.resolve(
				createMockDeviceInfo(mockDevices)
			);
			Devices.getDefaultDevice = (devices) => devices[0];

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			expect(element.audioInputDevices).to.have.length(2);
			expect(element.audioInputDevices[0].deviceId).to.equal("mic-1");
			expect(element.audioInputDevices[1].deviceId).to.equal("mic-2");
		});

		(hasMediaStream ? it : it.skip)("populates audio output devices list", async () => {
			const mockDevices = [
				createMockDevice("mic-1", "audioinput", "Microphone 1"),
				createMockDevice("speaker-1", "audiooutput", "Speaker 1"),
				createMockDevice("speaker-2", "audiooutput", "Speaker 2"),
			];

			Devices.enumerateAudioDevices = () => Promise.resolve(
				createMockDeviceInfo(mockDevices)
			);
			Devices.getDefaultDevice = (devices) => devices[0];

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			expect(element.audioOutputDevices).to.have.length(2);
			expect(element.audioOutputDevices[0].deviceId).to.equal("speaker-1");
			expect(element.audioOutputDevices[1].deviceId).to.equal("speaker-2");
		});

		(hasMediaStream ? it : it.skip)("sets enabled to true after successful query", async () => {
			const mockDevices = [
				createMockDevice("mic-1", "audioinput", "Microphone 1"),
			];

			Devices.enumerateAudioDevices = () => Promise.resolve(
				createMockDeviceInfo(mockDevices)
			);
			Devices.getDefaultDevice = (devices) => devices[0];

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			expect(element.enabled).to.be.true;
		});

		(hasMediaStream ? it : it.skip)("does not query devices twice after initialization", async () => {
			let queryCount = 0;

			Devices.enumerateAudioDevices = () => {
				queryCount++;
				return Promise.resolve(createMockDeviceInfo([]));
			};

			element.queryDevices();

			// Wait for first query to complete and set initialized = true
			await new Promise(resolve => setTimeout(resolve, 50));

			// Second call should be ignored because initialized is now true
			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));

			expect(queryCount).to.equal(1);
		});

		it("handles permission denied error", async () => {
			const error = new Error("Permission denied");
			error.name = "NotAllowedError";

			Devices.enumerateAudioDevices = () => Promise.reject(error);

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			expect(element.devicesBlocked).to.be.true;
		});

		it("handles device not readable error", async () => {
			const error = new Error("Device not readable");
			error.name = "NotReadableError";

			Devices.enumerateAudioDevices = () => Promise.reject(error);

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));
			await elementUpdated(element);

			expect(element.inputBlocked).to.be.true;
		});

		it("updates microphoneBlocked based on stream", async () => {
			const mockDevices = [
				createMockDevice("mic-1", "audioinput", "Microphone 1"),
			];

			// Device info with no audio tracks in stream
			const deviceInfo = createMockDeviceInfo(mockDevices, false);

			Devices.enumerateAudioDevices = () => Promise.resolve(deviceInfo);

			element.queryDevices();

			await new Promise(resolve => setTimeout(resolve, 50));

			expect(deviceStore.microphoneBlocked).to.be.true;
		});
	});

	describe("disconnectedCallback", () => {
		(hasMediaStream ? it : it.skip)("stops media tracks when disconnected", async () => {
			let stoppedTracks = false;

			Devices.stopMediaTracks = () => {
				stoppedTracks = true;
			};

			// Simulate having a stream
			const mockStream = new MediaStream();
			if (element.audio) {
				element.audio.srcObject = mockStream;
			}

			element.disconnectedCallback();

			expect(stoppedTracks).to.be.true;
		});

		(hasMediaStream ? it : it.skip)("clears audio srcObject when disconnected", async () => {
			const mockStream = new MediaStream();

			// Wait for element to be fully rendered
			await elementUpdated(element);

			if (element.audio) {
				element.audio.srcObject = mockStream;
				element.disconnectedCallback();

				expect(element.audio.srcObject).to.be.null;
			}
		});
	});
});

