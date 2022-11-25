interface StreamMediaStats {

	timestamp?: number;
	codec: string;
	bytesReceived?: number;
	bytesSent?: number;
	bitrateIn?: number;
	bitrateOut?: number;

}

export interface StreamAudioStats extends StreamMediaStats {

	channels: number;
	sampleRate: number;

}

export interface StreamVideoStats extends StreamMediaStats {

	frameHeight: number;
	frameWidth: number;
	framesPerSecond: number;

}

export interface AudioStats {

	inboundStats?: StreamAudioStats;
	outboundStats?: StreamAudioStats;

}

export interface VideoStats {

	inboundStats?: StreamVideoStats;
	outboundStats?: StreamVideoStats;

}

export interface DataStats {

	bytesReceived?: number;
	bytesSent?: number;

}

export interface DocumentStats {

	countReceived?: number;
	countSent?: number;
	bytesReceived?: number;
	bytesSent?: number;

}

export interface StreamStats {

	audioStats?: AudioStats;

	cameraStats?: VideoStats;

	screenStats?: VideoStats;

	dataStats?: DataStats;

	documentStats?: DocumentStats;

	[key: string]: AudioStats | VideoStats | DataStats;

}