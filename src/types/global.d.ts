declare module "*.css" {
	import type { CSSResultGroup } from "lit";

	const content: CSSResultGroup;
	export default content;
}

interface Indexable {
	[key: string]: unknown;
}

interface OpenFileOptions {

	extensions?: string[];
	description?: string;
	mimeTypes?: string[];
	multiple?: boolean;

}

interface PublisherPresence {

	userId: string;
	presence: "CONNECTED" | "DISCONNECTED";

}

interface MediaDeviceSetting {

	deviceId: string,
	kind: MediaDeviceKind;
	muted: boolean;

}

interface HTMLMediaElement {

	setSinkId(id: string): Promise<undefined>;

}

interface RTCCodecStats {

	payloadType: number;
	transportId: string;
	mimeType: string;
	clockRate: number;
	channels: number;
	sdpFmtpLine: string;

}

interface RTCInboundRtpStreamStats extends RTCReceivedRtpStreamStats {

	firCount?: number;
	framesDecoded?: number;
	nackCount?: number;
	pliCount?: number;
	qpSum?: number;
	remoteId?: string;
	bytesReceived?: number;
	frameHeight?: number;
	frameWidth?: number;
	framesPerSecond?: number;

}

interface RTCOutboundRtpStreamStats extends RTCSentRtpStreamStats {

	firCount?: number;
	framesEncoded?: number;
	nackCount?: number;
	pliCount?: number;
	qpSum?: number;
	remoteId?: string;
	frameHeight?: number;
	frameWidth?: number;
	framesPerSecond?: number;

}

interface RTCDataChannelStats extends RTCStats {

	label?: string;
	protocol?: string;
	dataChannelIdentifier?: number;
	state?: RTCDataChannelState;
	messagesSent?: number;
	bytesSent?: number;
	messagesReceived?: number;
	bytesReceived?: number;

}