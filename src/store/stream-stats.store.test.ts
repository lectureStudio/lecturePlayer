import { expect } from "@open-wc/testing";
import { streamStatsStore } from "./stream-stats.store.js";

describe("StreamStatsStore", () => {
	afterEach(() => {
		streamStatsStore.reset();
	});

	describe("initial state", () => {
		it("has empty audioStats", () => {
			expect(streamStatsStore.audioStats).to.deep.equal({});
		});

		it("has empty cameraStats", () => {
			expect(streamStatsStore.cameraStats).to.deep.equal({});
		});

		it("has empty screenStats", () => {
			expect(streamStatsStore.screenStats).to.deep.equal({});
		});

		it("has empty dataStats", () => {
			expect(streamStatsStore.dataStats).to.deep.equal({});
		});

		it("has empty documentStats", () => {
			expect(streamStatsStore.documentStats).to.deep.equal({});
		});
	});

	describe("updating stats", () => {
		it("can update audioStats", () => {
			streamStatsStore.audioStats = { bitrate: 128 } as any;
			expect(streamStatsStore.audioStats.bitrate).to.equal(128);
		});

		it("can update cameraStats", () => {
			streamStatsStore.cameraStats = { width: 1920, height: 1080 } as any;
			expect(streamStatsStore.cameraStats.width).to.equal(1920);
		});

		it("can update screenStats", () => {
			streamStatsStore.screenStats = { width: 2560, height: 1440 } as any;
			expect(streamStatsStore.screenStats.width).to.equal(2560);
		});

		it("can update dataStats", () => {
			streamStatsStore.dataStats = { bytesReceived: 1000 } as any;
			expect(streamStatsStore.dataStats.bytesReceived).to.equal(1000);
		});

		it("can update documentStats", () => {
			streamStatsStore.documentStats = { documentId: "123" } as any;
			expect(streamStatsStore.documentStats.documentId).to.equal("123");
		});
	});

	describe("reset", () => {
		it("resets all stats to empty objects", () => {
			streamStatsStore.audioStats = { bitrate: 128 } as any;
			streamStatsStore.cameraStats = { width: 1920 } as any;
			streamStatsStore.screenStats = { width: 2560 } as any;

			streamStatsStore.reset();

			expect(streamStatsStore.audioStats).to.deep.equal({});
			expect(streamStatsStore.cameraStats).to.deep.equal({});
			expect(streamStatsStore.screenStats).to.deep.equal({});
		});
	});
});

