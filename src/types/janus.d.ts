declare module "janus-gateway" {

	interface Dependencies {
		adapter: unknown;
		WebSocket: (server: string, protocol: string) => WebSocket;
		isArray: (array: unknown) => array is Array<unknown>;
		extension: () => boolean;
		httpAPICall: (url: string, options: unknown) => void;
	}

	interface DependenciesResult {
		adapter: unknown;
		newWebSocket: (server: string, protocol: string) => WebSocket;
		isArray: (array: unknown) => array is Array<unknown>;
		extension: () => boolean;
		httpAPICall: (url: string, options: unknown) => void;
	}

	enum DebugLevel {
		Trace = 'trace',
		Debug = 'debug',
		Log = 'log',
		Warning = 'warn',
		Error = 'error'
	}

	interface JSEP {
		ee2e?: boolean;
		sdp?: string;
		type?: string;
		rid_order?: "hml" | "lmh";
		force_relay?: boolean;
	}

	interface InitOptions {
		debug?: boolean | 'all' | DebugLevel[];
		callback?: Function;
		dependencies?: DependenciesResult;
	}

	interface ConstructorOptions {
		server: string | string[];
		iceServers?: RTCIceServer[];
		ipv6?: boolean;
		withCredentials?: boolean;
		max_poll_events?: number;
		destroyOnUnload?: boolean;
		token?: string;
		apisecret?: string;
		success?: Function;
		error?: (error: unknown) => void;
		destroyed?: Function;
	}

	interface ReconnectOptions {
		success?: Function;
		error?: (error: string) => void;
	}

	interface DestroyOptions {
		cleanupHandles?: boolean;
		notifyDestroyed?: boolean;
		unload?: boolean;
		success?: () => void;
		error?: (error: string) => void;
	}

	interface GetInfoOptions {
		success?: (info: unknown) => void;
		error?: (error: string) => void;
	}

	enum MessageType {
		Recording = 'recording',
		Starting = 'starting',
		Started = 'started',
		Stopped = 'stopped',
		SlowLink = 'slow_link',
		Preparing = 'preparing',
		Refreshing = 'refreshing'
	}

	interface Message {
		result?: {
			status: MessageType;
			id?: string;
			uplink?: number;
		};
		error?: string;
		[key: string]: unknown;
	}

	export interface JanusStreamDescription {

		active?: boolean;
		codec?: string;
		description?: string;
		feed_description?: string;
		feed_display?: string;
		feed_id?: bigint;
		feed_mid?: string;
		mid: string;
		mindex?: number;
		ready?: boolean;
		send?: boolean;
		type?: "audio" | "video" | "data";

	}

	export interface JanusMessage {

		videoroom?: "created" | "joined" | "event" | "edited" | "destroyed" | "success" | "participants" | "talking" | "stopped-talking" | "rtp_forward" | "stop_rtp_forward" | "forwarders" | "attached" | "updated";
		room?: number;
		id?: bigint;
		publishers?: JanusRoomParticipant[];
		streams?: JanusStreamDescription[];
		started?: string;
		unpublished?: "ok" | bigint;
		leaving?: "ok" | bigint;
		configured?: "ok";
		error?: string;

		[key: string]: unknown;
	}

	interface PluginCallbacks {
		dataChannelOptions?: RTCDataChannelInit;
		success?: (handle: PluginHandle) => void;
		error?: (error: string) => void;
		consentDialog?: (on: boolean) => void;
		webrtcState?: (isConnected: boolean) => void;
		iceState?: (state: 'connected' | 'failed' | 'disconnected' | 'closed') => void;
		mediaState?: (medium: 'audio' | 'video', receiving: boolean, mid?: number) => void;
		slowLink?: (uplink: boolean, lost: number, mid: string) => void;
		onmessage?: (message: Message, jsep?: JSEP) => void;
		onlocaltrack?: (track: MediaStreamTrack, on: boolean) => void;
		onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void;
		ondataopen?: Function;
		ondata?: Function;
		oncleanup?: Function;
		ondetached?: Function;
	}

	interface PluginOptions extends PluginCallbacks {
		plugin: string;
		opaqueId?: string;
	}

	interface OfferTrackParams {
		type: "audio" | "video" | "screen" | "data";
		mid?: string;
		capture?: boolean | unknown;
		simulcast?: boolean;
		recv?: boolean;
		add?: boolean;
		replace?: boolean;
		remove?: boolean;
		dontStop?: boolean;
		transforms?: {
			sender: Array<TransformStream>;
			receiver: Array<TransformStream>;
		};
	}

	interface ReplaceTrackParams {
		tracks: Array<OfferTrackParams>,
		success?: Function;
		error: (error: unknown) => void;
	}

	interface OfferParams {
		tracks?: Array<OfferTrackParams>,
		media?: {
			audioSend?: boolean;
			audioRecv?: boolean;
			videoSend?: boolean;
			videoRecv?: boolean;
			audio?: boolean | { deviceId: string };
			video?:
			| boolean
			| {
				deviceId: string,
				width?: number,
				height?: number,
			}
			| 'lowres'
			| 'lowres-16:9'
			| 'stdres'
			| 'stdres-16:9'
			| 'hires'
			| 'hires-16:9';
			data?: boolean;
			failIfNoAudio?: boolean;
			failIfNoVideo?: boolean;
			screenshareFrameRate?: number;
		};
		trickle?: boolean;
		stream?: MediaStream;
		success: Function;
		error: (error: unknown) => void;
	}

	interface PluginMessage {
		message: PluginRequest;
		jsep?: JSEP;
		success?: (data?: unknown) => void;
		error?: (error: string) => void;
	}

	interface PluginRequest {
		request: string;
		[otherProps: string]: unknown;
	}

	interface VideoRoomConfigureRequest extends PluginRequest {
		request: "configure";
		bitrate?: number;
		keyframe?: boolean;
		record?: boolean;
		filename?: string;
		display?: string;
		audio_active_packets?: number;
		audio_level_average?: number;
		streams?: {
			mid: string;
			keyframe?: boolean;
			send?: boolean;
			min_delay?: number;
			max_delay?: number;
		}[];
		descriptions?: {
			mid: string;
			description: string;
		}[];
	}

	interface WebRTCInfo {
		bitrate: {
			bsbefore: string | null;
			bsnow: string | null;
			timer: string | null;
			tsbefore: string | null;
			tsnow: string | null;
			value: string | null;
		};
		dataChannel: Array<RTCDataChannel>;
		dataChannelOptions: RTCDataChannelInit;

		dtmfSender: string | null;
		iceDone: boolean;
		mediaConstraints: unknown;
		mySdp: {
			sdp: string;
			type: string;
		};
		myStream: MediaStream;
		pc: RTCPeerConnection;
		receiverTransforms: {
			audio: TransformStream;
			video: TransformStream;
		};
		remoteSdp: string;
		remoteStream: MediaStream;
		senderTransforms: {
			audio: TransformStream;
			video: TransformStream;
		};
		started: boolean;
		streamExternal: boolean;
		trickle: boolean;
		volume: {
			value: number;
			timer: number;
		};
	}
	interface DetachOptions {
		success?: () => void;
		error?: (error: string) => void;
		noRequest?: boolean;
	}
	interface PluginHandle {
		plugin: string;
		id: string;
		token?: string;
		detached: boolean;
		webrtcStuff: WebRTCInfo;
		getId(): string;
		getPlugin(): string;
		send(message: PluginMessage): void;
		createOffer(params: OfferParams): void;
		createAnswer(params: unknown): void;
		replaceTracks(params: ReplaceTrackParams): void;
		handleRemoteJsep(params: { jsep: JSEP }): void;
		dtmf(params: unknown): void;
		data(params: unknown): void;
		isAudioMuted(): boolean;
		muteAudio(): void;
		unmuteAudio(): void;
		isVideoMuted(): boolean;
		muteVideo(): void;
		unmuteVideo(): void;
		getBitrate(): string;
		hangup(sendRequest?: boolean): void;
		detach(params?: DetachOptions): void;
	}

	interface JanusRoomParticipant {
		display?: string;
		id?: bigint;
		publisher?: boolean;
		talking?: boolean;
		audio_codec?: string;
		video_codec?: string;
		streams?: unknown[];
	}

	class Janus {
		static webRTCAdapter: unknown;
		static safariVp8: boolean;
		static useDefaultDependencies(deps: Partial<Dependencies>): DependenciesResult;
		static useOldDependencies(deps: Partial<Dependencies>): DependenciesResult;
		static init(options: InitOptions): void;
		static isWebrtcSupported(): boolean;
		static debug(...args: unknown[]): void;
		static log(...args: unknown[]): void;
		static warn(...args: unknown[]): void;
		static error(...args: unknown[]): void;
		static randomString(length: number): string;
		static attachMediaStream(element: HTMLMediaElement, stream: MediaStream): void;
		static reattachMediaStream(to: HTMLMediaElement, from: HTMLMediaElement): void;

		static stopAllTracks(stream: MediaStream): void;

		constructor(options: ConstructorOptions);

		attach(options: PluginOptions): void;
		getServer(): string;
		isConnected(): boolean;
		reconnect(callbacks: ReconnectOptions): void;
		getSessionId(): number;
		getInfo(callbacks: GetInfoOptions): void;
		destroy(callbacks: DestroyOptions): void;
	}
}