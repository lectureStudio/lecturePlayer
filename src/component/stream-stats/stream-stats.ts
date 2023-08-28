import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { I18nLitElement, t } from '../i18n-mixin';
import { AudioStats, DataStats, DocumentStats, VideoStats } from "../../model/stream-stats";
import { Component } from "../component";
import { streamStatsStore } from "../../store/stream-stats.store";
import { EventEmitter } from "../../utils/event-emitter";
import { Utils } from "../../utils/utils";
import streamStatsStyles from "./stream-stats.scss";

interface StatsEntry {

	name: string;
	inMetric: any;
	outMetric: any;

}

@customElement("stream-stats")
export class StreamStats extends Component {

	static styles = [
		I18nLitElement.styles,
		streamStatsStyles
	];

	eventEmitter: EventEmitter;


	override connectedCallback() {
		super.connectedCallback();

		this.eventEmitter.dispatchEvent(Utils.createEvent("stream-stats-start"));
	}

	override disconnectedCallback() {
		this.eventEmitter.dispatchEvent(Utils.createEvent("stream-stats-stop"));

		super.disconnectedCallback();
	}

	protected render() {
		return html`
			<sl-tab-group noScrollControls="true">
				<sl-tab slot="nav" panel="audio">${t("stats.audio")}</sl-tab>
				<sl-tab slot="nav" panel="camera">${t("stats.camera")}</sl-tab>
				<sl-tab slot="nav" panel="screen">${t("stats.screen")}</sl-tab>
				<sl-tab slot="nav" panel="documents">${t("stats.documents")}</sl-tab>
				<sl-tab slot="nav" panel="events">${t("stats.events")}</sl-tab>

				<sl-tab-panel name="audio">
					${this.renderStatsTable(this.getAudioStats(streamStatsStore.audioStats))}
				</sl-tab-panel>
				<sl-tab-panel name="camera">
					${this.renderStatsTable(this.getVideoStats(streamStatsStore.cameraStats))}
				</sl-tab-panel>
				<sl-tab-panel name="screen">
					${this.renderStatsTable(this.getVideoStats(streamStatsStore.screenStats))}
				</sl-tab-panel>
				<sl-tab-panel name="documents">
					${this.renderStatsTable(this.getDocumentStats(streamStatsStore.documentStats))}
				</sl-tab-panel>
				<sl-tab-panel name="events">
					${this.renderStatsTable(this.getDataStats(streamStatsStore.dataStats))}
				</sl-tab-panel>
			</sl-tab-group>
		`;
	}

	protected renderStatsTable(entries: Array<StatsEntry>) {
		if (!entries || entries.length === 0) {
			return '';
		}

		return html`
			<table class="table">
				<thead>
					<tr>
						<th scope="col" class="col-metric"></th>
						<th scope="col" class="col-inbound">${t("stats.inbound")}</th>
						<th scope="col" class="col-outbound">${t("stats.outbound")}</th>
					</tr>
				</thead>
				<tbody>
					${entries.map((entry) => html `
					<tr>
						<td>${entry.name}</td>
						<td>${this.getValue(entry.inMetric)}</td>
						<td>${this.getValue(entry.outMetric)}</td>
					</tr>
					`)}
				</tbody>
			</table>
		`;
	}

	private getAudioStats(audioStats: AudioStats) {
		if (!audioStats) {
			audioStats = {};
		}

		const entries: Array<StatsEntry> = [
			{
				name: t("stats.codec"),
				inMetric: audioStats.inboundStats?.codec,
				outMetric: audioStats.outboundStats?.codec
			},
			{
				name: t("stats.format"),
				inMetric: this.getAudioFormat(audioStats.inboundStats?.sampleRate, audioStats.inboundStats?.channels),
				outMetric: this.getAudioFormat(audioStats.outboundStats?.sampleRate, audioStats.outboundStats?.channels)
			},
			{
				name: t("stats.bitrate"),
				inMetric: this.getBitrate(audioStats.inboundStats?.bitrateIn),
				outMetric: this.getBitrate(audioStats.outboundStats?.bitrateOut)
			},
			{
				name: t("stats.jitter"),
				inMetric: this.getJitter(audioStats.inboundStats?.jitter),
				outMetric: this.getJitter(audioStats.outboundStats?.jitter)
			},
			{
				name: t("stats.packet.loss"),
				inMetric: this.getPacketLoss(audioStats.inboundStats?.packetLossPercent),
				outMetric: this.getPacketLoss(audioStats.outboundStats?.packetLossPercent)
			}
		];

		return entries;
	}

	private getVideoStats(videoStats: VideoStats) {
		if (!videoStats) {
			videoStats = {};
		}

		const entries: Array<StatsEntry> = [
			{
				name: t("stats.codec"),
				inMetric: videoStats.inboundStats?.codec,
				outMetric: videoStats.outboundStats?.codec
			},
			{
				name: t("stats.resolution"),
				inMetric: this.getResolution(videoStats.inboundStats?.frameWidth, videoStats.inboundStats?.frameHeight),
				outMetric: this.getResolution(videoStats.outboundStats?.frameWidth, videoStats.outboundStats?.frameHeight)
			},
			{
				name: t("stats.frame.requency"),
				inMetric: this.getFramesPerSecond(videoStats.inboundStats?.framesPerSecond),
				outMetric: this.getFramesPerSecond(videoStats.outboundStats?.framesPerSecond)
			},
			{
				name: t("stats.bitrate"),
				inMetric: this.getBitrate(videoStats.inboundStats?.bitrateIn),
				outMetric: this.getBitrate(videoStats.outboundStats?.bitrateOut)
			},
			{
				name: t("stats.jitter"),
				inMetric: this.getJitter(videoStats.inboundStats?.jitter),
				outMetric: this.getJitter(videoStats.outboundStats?.jitter)
			},
			{
				name: t("stats.packet.loss"),
				inMetric: this.getPacketLoss(videoStats.inboundStats?.packetLossPercent),
				outMetric: this.getPacketLoss(videoStats.outboundStats?.packetLossPercent)
			}
		];

		return entries;
	}

	private getDataStats(dataStats: DataStats) {
		if (!dataStats) {
			return null;
		}

		const entries: Array<StatsEntry> = [
			{
				name: t("stats.events"),
				inMetric: this.getKibibytes(dataStats.bytesReceived),
				outMetric: this.getKibibytes(dataStats.bytesSent)
			}
		];

		return entries;
	}

	private getDocumentStats(documentStats: DocumentStats) {
		if (!documentStats) {
			return null;
		}

		const entries: Array<StatsEntry> = [
			{
				name: t("stats.documents.count"),
				inMetric: documentStats.countReceived,
				outMetric: documentStats.countSent
			},
			{
				name: t("stats.documents.size"),
				inMetric: this.getKibibytes(documentStats.bytesReceived),
				outMetric: this.getKibibytes(documentStats.bytesSent)
			}
		];

		return entries;
	}

	private getValue(value: any) {
		return value != null ? value : "-";
	}

	private getBitrate(value: number) {
		if (value != null) {
			return (value / 1024).toFixed() + " kbit/s";
		}

		return null;
	}

	private getKibibytes(value: number) {
		if (value != null) {
			return (value / 1024).toFixed() + " KiB";
		}

		return null;
	}

	private getAudioFormat(sampleRate: number, channels: number) {
		if (sampleRate != null && channels != null) {
			return `${sampleRate} Hz, ${channels === 1 ? t("stats.audio.mono") : t("stats.audio.stereo")}`;
		}

		return null;
	}

	private getFramesPerSecond(value: number) {
		if (value != null) {
			return `${value} ${t("stats.fps")}`;
		}

		return null;
	}

	private getResolution(frameWidth: number, frameHeight: number) {
		if (frameWidth != null && frameHeight != null) {
			return `${frameWidth}x${frameHeight}`;
		}

		return null;
	}

	private getJitter(value: number) {
		if (value != null) {
			return `${(value * 1000).toFixed()} ${t("ms")}`;
		}

		return null;
	}

	private getPacketLoss(value: number) {
		if (value != null) {
			return `${value.toFixed(1)} ${t("%")}`;
		}

		return null;
	}
}