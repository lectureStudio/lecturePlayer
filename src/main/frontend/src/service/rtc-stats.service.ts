import { course } from "../model/course";
import { AudioStats, DataStats, StreamAudioStats, StreamStats, StreamVideoStats, VideoStats } from "../model/stream-stats";

export class RTCStatsService {

	public pc: RTCPeerConnection;

	public streamIds: Map<string, string>;


	getStats() {
		if (!this.pc) {
			return;
		}

		this.pc.getStats()
			.then(report => {
				const streamStats = course.streamStats;

				for (const entry of report.values()) {
					const type: RTCStatsType = entry.type;

					if (!type) {
						continue;
					}

					if (type === "inbound-rtp") {
						this.getRtpStats(report, entry, streamStats, true);
					}
					else if (type === "outbound-rtp") {
						this.getRtpStats(report, entry, streamStats, false);
					}
					else if (type === "data-channel") {
						this.getDataChannelStats(report, entry, streamStats);
					}
				}
			});
	}

	private getRtpStats(report: RTCStatsReport, stats: RTCInboundRtpStreamStats | RTCOutboundRtpStreamStats, streamStats: StreamStats, inbound: boolean) {
		const codecStats: RTCCodecStats = report.get(stats.codecId);

		if (!codecStats) {
			// Chrome: track is not active.
			return;
		}

		if (stats.kind === "audio") {
			const audioStats = this.createAudioStats(stats, codecStats, inbound);

			this.setStats(streamStats, "audioStats", audioStats, inbound);
		}
		else if (stats.kind === "video") {
			// Find the track for the given stats, since not all browsers provide us the 'mid' in the stats.
			const trackDesc = this.getTrackDescription(stats.ssrc, inbound);

			const videoStats = this.createVideoStats(stats, codecStats, inbound);

			if (trackDesc === "camera") {
				this.setStats(streamStats, "cameraStats", videoStats, inbound);
			}
			else if (trackDesc === "screen") {
				this.setStats(streamStats, "screenStats", videoStats, inbound);
			}
		}
	}

	private createAudioStats(stats: RTCInboundRtpStreamStats | RTCOutboundRtpStreamStats, codecStats: RTCCodecStats, inbound: boolean) {
		const audioStats: StreamAudioStats = {
			timestamp: stats.timestamp,
			codec: codecStats.mimeType.substring(codecStats.mimeType.indexOf("/") + 1),
			channels: codecStats.channels,
			sampleRate: codecStats.clockRate
		};

		if (inbound) {
			const inboundStats: RTCInboundRtpStreamStats = stats;

			audioStats.bytesReceived = inboundStats.bytesReceived;
			audioStats.jitter = inboundStats.jitter;
			audioStats.packetsReceived = inboundStats.packetsReceived;
			audioStats.packetsLost = inboundStats.packetsLost;
		}
		else {
			const outboundStats: RTCOutboundRtpStreamStats = stats;

			audioStats.bytesSent = outboundStats.bytesSent;
			audioStats.packetsSent = outboundStats.packetsSent;
		}

		return audioStats;
	}

	private createVideoStats(stats: RTCInboundRtpStreamStats | RTCOutboundRtpStreamStats, codecStats: RTCCodecStats, inbound: boolean) {
		const videoStats: StreamVideoStats = {
			timestamp: stats.timestamp,
			codec: codecStats.mimeType.substring(codecStats.mimeType.indexOf("/") + 1),
			frameWidth: stats.frameWidth,
			frameHeight: stats.frameHeight,
			framesPerSecond: stats.framesPerSecond
		};

		if (inbound) {
			const inboundStats: RTCInboundRtpStreamStats = stats;

			videoStats.bytesReceived = inboundStats.bytesReceived;
			videoStats.jitter = inboundStats.jitter;
			videoStats.packetsReceived = inboundStats.packetsReceived;
			videoStats.packetsLost = inboundStats.packetsLost;
		}
		else {
			const outboundStats: RTCOutboundRtpStreamStats = stats;

			videoStats.bytesSent = outboundStats.bytesSent;
			videoStats.packetsSent = outboundStats.packetsSent;
		}

		return videoStats;
	}

	private getDataChannelStats(report: RTCStatsReport, channelStats: RTCDataChannelStats, streamStats: StreamStats) {
		const dataStats: DataStats = {
			bytesReceived: channelStats.bytesReceived,
			bytesSent: channelStats.bytesSent
		};

		streamStats.dataStats = dataStats;
	}

	private getTrackDescription(ssrc: number, inbound: boolean) {
		let mid = null;

		for (const transceiver of this.pc.getTransceivers()) {
			const receiver = transceiver.receiver;

			if (receiver.getSynchronizationSources().findIndex(value => value.source === ssrc) > -1) {
				mid = transceiver.mid;
				break;
			}
		}

		if (!mid) {
			return null;
		}

		return this.getStreamTypeForMid(mid);
	}

	protected getStreamTypeForMid(mid: string) {
		for (const [k, v] of this.streamIds) {
			if (v === mid) {
				return k;
			}
		}
		return null;
	}

	private setStats(streamStats: StreamStats, target: string, stats: StreamAudioStats | StreamVideoStats, inbound: boolean) {
		if (!streamStats[target]) {
			streamStats[target] = {};
		}

		const targetStats = <AudioStats | VideoStats> streamStats[target];

		if (inbound) {
			// Calculate bitrate
			const timestamp = targetStats.inboundStats?.timestamp;
			const bytesReceived = targetStats.inboundStats?.bytesReceived;

			this.getBitrate(timestamp, bytesReceived, stats, inbound);

			this.getPacketLossPercent(stats);

			targetStats.inboundStats = stats;
		}
		else {
			// Calculate bitrate
			const timestamp = targetStats.outboundStats?.timestamp;
			const bytesSent = targetStats.outboundStats?.bytesSent;

			this.getBitrate(timestamp, bytesSent, stats, inbound);

			this.getPacketLossPercent(stats);

			targetStats.outboundStats = stats;
		}
	}

	private getBitrate(lastTimestamp: number, lastBytes: number, stats: StreamAudioStats | StreamVideoStats, inbound: boolean) {
		if (lastTimestamp && lastBytes) {
			const bytes = inbound ? stats.bytesReceived : stats.bytesSent;
			const timeDelta = (stats.timestamp - lastTimestamp) / 1000; // milliseconds to seconds
			const bytesDelta = (bytes - lastBytes) * 8; // bytes to bits

			if (inbound) {
				stats.bitrateIn = bytesDelta / timeDelta; // bits per second
			}
			else {
				stats.bitrateOut = bytesDelta / timeDelta; // bits per second
			}
		}
	}

	private getPacketLossPercent(stats: StreamAudioStats | StreamVideoStats) {
		stats.packetLossPercent = stats.packetsLost / (stats.packetsReceived + stats.packetsLost) * 100;
	}
}