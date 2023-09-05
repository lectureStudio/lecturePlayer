import { AudioStats, DataStats, StreamAudioStats, StreamMediaStats, StreamVideoStats, VideoStats } from "../model/stream-stats";
import { streamStatsStore } from "../store/stream-stats.store";

export class RTCStatsService {

	public pc: RTCPeerConnection;

	public streamIds: Map<string, string>;


	getStats() {
		if (!this.pc) {
			return;
		}

		this.pc.getStats()
			.then(report => {
				this.prepareAudioStats(streamStatsStore.audioStats);
				this.prepareVideoStats(streamStatsStore.cameraStats);
				this.prepareVideoStats(streamStatsStore.screenStats);

				for (const entry of report.values()) {
					const type: RTCStatsType = entry.type;

					if (!type) {
						continue;
					}

					if (type === "inbound-rtp") {
						this.getRtpStats(report, entry, true);
					}
					else if (type === "outbound-rtp") {
						this.getRtpStats(report, entry, false);
					}
					else if (type === "data-channel") {
						this.getDataChannelStats(report, entry);
					}
				}
			});
	}

	private getDefaultStats<T extends StreamMediaStats>(mediaStats: T | undefined) {
		let ssrc = mediaStats?.ssrc;

		if (!ssrc || !this.getTrackDescription(ssrc)) {
			// There is no synchronization source or an active track.
			return undefined;
		}

		return mediaStats;
	}

	private prepareAudioStats(stats: AudioStats) {
		if (stats) {
			stats.inboundStats = this.getDefaultStats(stats.inboundStats);
			stats.outboundStats = this.getDefaultStats(stats.outboundStats);
		}
	}

	private prepareVideoStats(stats: VideoStats) {
		if (stats) {
			stats.inboundStats = this.getDefaultStats(stats.inboundStats);
			stats.outboundStats = this.getDefaultStats(stats.outboundStats);
		}
	}

	private getRtpStats(report: RTCStatsReport, stats: RTCInboundRtpStreamStats | RTCOutboundRtpStreamStats, inbound: boolean) {
		if (!stats.codecId) {
			return;
		}

		const codecStats: RTCCodecStats = report.get(stats.codecId);

		if (!codecStats) {
			// Chrome: track is not active.
			return;
		}

		if (stats.kind === "audio") {
			const audioStats = this.createAudioStats(stats, codecStats, inbound);

			this.setStats(streamStatsStore.audioStats, audioStats, inbound);
		}
		else if (stats.kind === "video") {
			// Find the track for the given stats, since not all browsers provide us the 'mid' in the stats.
			const trackDesc = this.getTrackDescription(stats.ssrc);
			const videoStats = this.createVideoStats(stats, codecStats, inbound);

			if (trackDesc === "video") {
				this.setStats(streamStatsStore.cameraStats, videoStats, inbound);
			}
			else if (trackDesc === "screen") {
				this.setStats(streamStatsStore.screenStats, videoStats, inbound);
			}
		}
	}

	private createAudioStats(stats: RTCInboundRtpStreamStats | RTCOutboundRtpStreamStats, codecStats: RTCCodecStats, inbound: boolean) {
		const audioStats: StreamAudioStats = {
			ssrc: stats.ssrc,
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
		if (!stats.framesPerSecond) {
			// Having no fps indicates that the stream is not active.
			return {} as StreamVideoStats;
		}

		const videoStats: StreamVideoStats = {
			ssrc: stats.ssrc,
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

	private getDataChannelStats(report: RTCStatsReport, channelStats: RTCDataChannelStats) {
		const dataStats: DataStats = {
			bytesReceived: channelStats.bytesReceived,
			bytesSent: channelStats.bytesSent
		};

		streamStatsStore.dataStats = dataStats;
	}

	private getTrackDescription(ssrc: number) {
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

		return this.streamIds.get(mid);
	}

	private setStats(stats: AudioStats | VideoStats, streamStats: StreamAudioStats | StreamVideoStats, inbound: boolean) {
		if (inbound) {
			// Calculate bitrate
			const timestamp = stats.inboundStats?.timestamp;
			const bytesReceived = stats.inboundStats?.bytesReceived;

			this.getBitrate(timestamp, bytesReceived, streamStats, inbound);

			this.getPacketLossPercent(streamStats);

			stats.inboundStats = streamStats;
		}
		else {
			// Calculate bitrate
			const timestamp = stats.outboundStats?.timestamp;
			const bytesSent = stats.outboundStats?.bytesSent;

			this.getBitrate(timestamp, bytesSent, streamStats, inbound);

			this.getPacketLossPercent(streamStats);

			stats.outboundStats = streamStats;
		}
	}

	private getBitrate(lastTimestamp: number | undefined, lastBytes: number | undefined, stats: StreamAudioStats | StreamVideoStats, inbound: boolean) {
		if (lastTimestamp != null && lastBytes != null && stats.timestamp != null) {
			const bytes = inbound ? stats.bytesReceived : stats.bytesSent;

			if (bytes == null) {
				return;
			}

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
		if (stats.packetsLost != null && stats.packetsReceived) {
			stats.packetLossPercent = stats.packetsLost / (stats.packetsReceived + stats.packetsLost) * 100;
		}
		else {
			stats.packetLossPercent = undefined;
		}
	}
}