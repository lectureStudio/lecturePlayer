import { expect } from "@open-wc/testing";

import { RTCStatsService } from "./rtc-stats.service.js";
import { streamStatsStore } from "../store/stream-stats.store.js";

describe("RTCStatsService", () => {
	let rtcStatsService: RTCStatsService;

	beforeEach(() => {
		rtcStatsService = new RTCStatsService();
		streamStatsStore.reset();
	});

	describe("constructor", () => {
		it("creates RTC stats service instance", () => {
			expect(rtcStatsService).to.exist;
		});
	});

	describe("properties", () => {
		it("has pc property for RTCPeerConnection", () => {
			expect(rtcStatsService.pc).to.be.undefined;
		});

		it("has streamIds property for stream mapping", () => {
			expect(rtcStatsService.streamIds).to.be.undefined;
		});

		it("allows setting streamIds map", () => {
			rtcStatsService.streamIds = new Map();
			expect(rtcStatsService.streamIds).to.be.instanceOf(Map);
		});
	});

	describe("getStats", () => {
		it("returns early when no peer connection", () => {
			// Should not throw
			rtcStatsService.getStats();
		});
	});
});

