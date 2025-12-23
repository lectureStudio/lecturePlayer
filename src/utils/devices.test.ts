import { expect } from "@open-wc/testing";
import { Devices, DeviceInfo } from "./devices.js";
import { deviceStore } from "../store/device.store.js";

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
 * Check if MediaStream is available in this environment.
 */
const hasMediaStream = typeof MediaStream !== "undefined";

/**
 * Creates a mock MediaStream with optional tracks.
 * Returns null if MediaStream is not available.
 */
function createMockStream(audioTracks: number = 0, videoTracks: number = 0): MediaStream | null {
	if (!hasMediaStream) {
		return null;
	}
	
	const stream = new MediaStream();

	// Note: In a real browser, we'd add actual tracks.
	// For testing, we rely on the stream's track count methods.
	Object.defineProperty(stream, "getAudioTracks", {
		value: () => Array(audioTracks).fill({ kind: "audio", stop: () => {} })
	});
	Object.defineProperty(stream, "getVideoTracks", {
		value: () => Array(videoTracks).fill({ kind: "video", stop: () => {} })
	});
	Object.defineProperty(stream, "getTracks", {
		value: () => [
			...Array(audioTracks).fill({ kind: "audio", stop: () => {} }),
			...Array(videoTracks).fill({ kind: "video", stop: () => {} })
		]
	});

	return stream;
}

describe("Devices", () => {
	// Store original navigator.mediaDevices
	let originalMediaDevices: MediaDevices;

	beforeEach(() => {
		originalMediaDevices = navigator.mediaDevices;
	});

	afterEach(() => {
		// Restore original mediaDevices
		Object.defineProperty(navigator, "mediaDevices", {
			value: originalMediaDevices,
			writable: true,
			configurable: true
		});
	});

	describe("getDefaultDevice", () => {
		it("returns device with 'default' id when present", () => {
			const devices: MediaDeviceInfo[] = [
				createMockDevice("device-1", "audioinput", "Microphone 1"),
				createMockDevice("default", "audioinput", "Default Microphone"),
				createMockDevice("device-2", "audioinput", "Microphone 2"),
			];

			const result = Devices.getDefaultDevice(devices);

			expect(result.deviceId).to.equal("default");
			expect(result.label).to.equal("Default Microphone");
		});

		it("returns first device when no 'default' id present", () => {
			const devices: MediaDeviceInfo[] = [
				createMockDevice("device-1", "audioinput", "Microphone 1"),
				createMockDevice("device-2", "audioinput", "Microphone 2"),
			];

			const result = Devices.getDefaultDevice(devices);

			expect(result.deviceId).to.equal("device-1");
		});

		it("returns undefined for empty array", () => {
			const devices: MediaDeviceInfo[] = [];

			const result = Devices.getDefaultDevice(devices);

			expect(result).to.be.undefined;
		});
	});

	describe("enumerateDevices", () => {
		it("enumerates devices without requesting permission", async () => {
			const mockDevices: MediaDeviceInfo[] = [
				createMockDevice("speaker-1", "audiooutput", "Speaker 1"),
				createMockDevice("mic-1", "audioinput", ""),
				createMockDevice("cam-1", "videoinput", ""),
			];

			// Mock enumerateDevices
			Object.defineProperty(navigator, "mediaDevices", {
				value: {
					enumerateDevices: () => Promise.resolve(mockDevices)
				},
				writable: true,
				configurable: true
			});

			const result: DeviceInfo = await Devices.enumerateDevices();

			expect(result.devices).to.have.length(3);
			expect(result.stream).to.be.undefined;
			expect(result.constraints).to.be.undefined;
		});

		it("returns empty array when no devices available", async () => {
			Object.defineProperty(navigator, "mediaDevices", {
				value: {
					enumerateDevices: () => Promise.resolve([])
				},
				writable: true,
				configurable: true
			});

			const result: DeviceInfo = await Devices.enumerateDevices();

			expect(result.devices).to.have.length(0);
		});

		it("rejects when enumerateDevices fails", async () => {
			const error = new Error("Permission denied");

			Object.defineProperty(navigator, "mediaDevices", {
				value: {
					enumerateDevices: () => Promise.reject(error)
				},
				writable: true,
				configurable: true
			});

			try {
				await Devices.enumerateDevices();
				expect.fail("Should have thrown an error");
			} catch (e) {
				expect(e).to.equal(error);
			}
		});
	});

	describe("removeHwId", () => {
		it("removes hardware ID from label", () => {
			const label = "USB Microphone (0bda:5838)";

			const result = Devices.removeHwId(label);

			expect(result).to.equal("USB Microphone");
		});

		it("returns original label when no hardware ID present", () => {
			const label = "Built-in Microphone";

			const result = Devices.removeHwId(label);

			expect(result).to.equal("Built-in Microphone");
		});

		it("handles empty string", () => {
			const result = Devices.removeHwId("");

			expect(result).to.equal("");
		});

		it("removes first hardware ID only", () => {
			const label = "Device (0bda:5838) Something (1234:abcd)";

			const result = Devices.removeHwId(label);

			// Function only removes the first match
			expect(result).to.equal("Device Something (1234:abcd)");
		});
	});

	describe("stopAudioTracks", () => {
		it("stops all audio tracks in stream", () => {
			let stopCount = 0;
			const mockStream = {
				getAudioTracks: () => [
					{ stop: () => stopCount++ },
					{ stop: () => stopCount++ }
				]
			} as unknown as MediaStream;

			Devices.stopAudioTracks(mockStream);

			expect(stopCount).to.equal(2);
		});

		it("handles null stream gracefully", () => {
			// Should not throw
			Devices.stopAudioTracks(null);
		});
	});

	describe("stopVideoTracks", () => {
		it("stops all video tracks in stream", () => {
			let stopCount = 0;
			const mockStream = {
				getVideoTracks: () => [
					{ stop: () => stopCount++ },
					{ stop: () => stopCount++ }
				]
			} as unknown as MediaStream;

			Devices.stopVideoTracks(mockStream);

			expect(stopCount).to.equal(2);
		});

		it("handles null stream gracefully", () => {
			// Should not throw
			Devices.stopVideoTracks(null);
		});
	});

	describe("stopMediaTracks", () => {
		it("stops all tracks in stream", () => {
			let stopCount = 0;
			const mockStream = {
				getTracks: () => [
					{ stop: () => stopCount++ },
					{ stop: () => stopCount++ },
					{ stop: () => stopCount++ }
				]
			} as unknown as MediaStream;

			Devices.stopMediaTracks(mockStream);

			expect(stopCount).to.equal(3);
		});

		it("handles null stream gracefully", () => {
			// Should not throw
			Devices.stopMediaTracks(null);
		});

		it("handles undefined stream gracefully", () => {
			// Should not throw
			Devices.stopMediaTracks(undefined);
		});
	});

	describe("setAudioSink", () => {
		it("does nothing when speaker selection not supported", () => {
			const originalCanSelectSpeaker = deviceStore.canSelectSpeaker;

			// Mock unsupported
			Object.defineProperty(deviceStore, "canSelectSpeaker", {
				value: false,
				writable: true,
				configurable: true
			});

			const mockElement = {
				setSinkId: () => Promise.resolve()
			} as unknown as HTMLMediaElement;

			// Should not throw
			Devices.setAudioSink(mockElement, "speaker-1");

			// Restore
			Object.defineProperty(deviceStore, "canSelectSpeaker", {
				value: originalCanSelectSpeaker,
				writable: true,
				configurable: true
			});
		});
	});

	describe("attachMediaStream", () => {
		(hasMediaStream ? it : it.skip)("attaches stream to media element", () => {
			const mockStream = createMockStream(1, 1);
			const mockElement = {
				srcObject: null
			} as unknown as HTMLMediaElement;

			Devices.attachMediaStream(mockElement, mockStream);

			expect(mockElement.srcObject).to.equal(mockStream);
		});

		(hasMediaStream ? it : it.skip)("handles null stream", () => {
			const mockElement = {
				srcObject: createMockStream()
			} as unknown as HTMLMediaElement;

			Devices.attachMediaStream(mockElement, null);

			expect(mockElement.srcObject).to.be.null;
		});
	});
});

