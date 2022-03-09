import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { PlayerView } from "../component/player-view/player-view";
import { Utils } from "../utils/utils";

export class JanusService extends EventTarget {

	private readonly serverUrl: string;

	private playerView: PlayerView;

	private janus: Janus;

	private publisherLocalStream: MediaStream;

	private publisherHandle: PluginHandle;

	private publisherId: Number;

	private remoteFeeds: PluginHandle[];

	private myroom: number;

	private opaqueId: string;

	private deviceConstraints: any;

	private myusername: string;

	private dataCallback: (data: any) => void;

	private errorCallback: (data: any) => void;


	constructor(serverUrl: string) {
		super();

		this.serverUrl = serverUrl;
		this.janus = null;
		this.publisherHandle = null;
		this.publisherId = null;
		this.publisherLocalStream = null;
		this.dataCallback = null;
		this.remoteFeeds = [];

		this.opaqueId = "course-" + Janus.randomString(12);
		this.myusername = Janus.randomString(12);
	}

	setPlayerView(playerView: PlayerView): void {
		this.playerView = playerView;
	}

	setDeviceConstraints(deviceConstraints: any): void {
		this.deviceConstraints = deviceConstraints;
	}

	setUserId(userId: string) {
		this.opaqueId = userId;
	}

	setRoomId(roomId: number) {
		this.myroom = roomId;
	}

	setOnData(consumer: (data: any) => void) {
		Utils.checkFunction(consumer);

		this.dataCallback = consumer;
	}

	setOnError(consumer: (data: any) => void) {
		Utils.checkFunction(consumer);

		this.errorCallback = consumer;
	}

	start() {
		// Initialize the library (all console debuggers enabled).
		Janus.init({
			// debug: "all",
			callback: () => {
				// Make sure the browser supports WebRTC.
				if (!Janus.isWebrtcSupported()) {
					console.error("No WebRTC support...");
					return;
				}

				this.createSession();
			}
		});
	}

	addPeer(peerId: BigInt) {
		const publisherId = Number(peerId);

		if (this.publisherId !== publisherId) {
			this.attachToPublisher({ id: publisherId }, false);
		}
	}

	startSpeech(deviceConstraints: any) {
		// Create a new plugin handle and attach to it as a publisher.
		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: (pluginHandle: PluginHandle) => {
				Janus.log("Plugin attached! (" + pluginHandle.getPlugin() + ", id=" + pluginHandle.getId() + ")");

				this.publisherHandle = pluginHandle;

				this.joinAsPublisher(this.publisherHandle);
			},
			error: (cause: any) => {
				Janus.error("  -- Error attaching plugin...", cause);
			},
			consentDialog: (on: boolean) => {
				// e.g., darken the screen if on=true (getUserMedia incoming), restore it otherwise
			},
			iceState: (state: 'connected' | 'failed') => {
				Janus.log("ICE state changed to " + state);
			},
			mediaState: (medium: 'audio' | 'video', receiving: boolean, mid?: number) => {
				Janus.log("Janus " + (receiving ? "started" : "stopped") + " receiving our " + medium);
			},
			webrtcState: (isConnected: boolean) => {
				Janus.log("Janus says our WebRTC PeerConnection is " + (isConnected ? "up" : "down") + " now");

				const event = new CustomEvent("speech-state", {
					detail: {
						peerId: this.publisherId,
						connected: isConnected
					}
				});
				this.dispatchEvent(event);
			},
			onmessage: (message: any, jsep?: JSEP) => {
				const event = message["videoroom"];

				if (message["error"]) {
					Janus.error(message["error"]);
					return;
				}

				if (event) {
					if (event === "joined") {
						this.publisherId = message["id"];
						this.publishOwnFeed(this.publisherHandle, deviceConstraints);
					}
				}

				if (jsep) {
					this.publisherHandle.handleRemoteJsep({ jsep: jsep });

					// Check if any of the media we wanted to publish has
					// been rejected (e.g., wrong or unsupported codec)
					const audio = message["audio_codec"];
					const video = message["video_codec"];

					if (this.publisherLocalStream && this.publisherLocalStream.getAudioTracks() && this.publisherLocalStream.getAudioTracks().length > 0 && !audio) {
						// Audio has been rejected
						console.log("Our audio stream has been rejected, viewers won't hear us");
					}

					if (this.publisherLocalStream && this.publisherLocalStream.getVideoTracks() && this.publisherLocalStream.getVideoTracks().length > 0 && !video) {
						// Video has been rejected.

						console.log("Our video stream has been rejected, viewers won't see us");

						// Hide the webcam video

					}
				}
			},
			onlocalstream: (stream: MediaStream) => {
				this.publisherLocalStream = stream;

				const localVideoFeed = this.playerView.getLocalVideo();

				Janus.attachMediaStream(localVideoFeed, stream);

				localVideoFeed.muted = true;
				let hasVideo = false;

				const constraints = {
					width: { min: 640, ideal: 640, max: 1280 },
					height: { min: 360, ideal: 360 },
					aspectRatio: { ideal: 1.7777777778 },
					frameRate: { max: 30 },
					facingMode: { ideal: "user" }
				};

				for (const videoTrack of stream.getVideoTracks()) {
					videoTrack.applyConstraints(constraints);

					if (videoTrack.muted == false) {
						hasVideo = true;
						break;
					}
				}
			},
			onremotestream: (stream: MediaStream) => {
				// The publisher stream is sendonly, we don't expect anything here.
			},
			oncleanup: () => {
				
			},
			detached: () => {
				
			}
		});
	}

	stopSpeech() {
		this.publisherId = null;

		if (this.publisherHandle) {
			var unpublish = { request: "unpublish" };

			this.publisherHandle.send({ message: unpublish });
		}
	}

	private createSession() {
		this.janus = new Janus({
			server: this.serverUrl,
			success: () => {
				this.attach();
			},
			error: (cause: any) => {
				Janus.error(cause);

				if (this.errorCallback) {
					this.errorCallback(cause);
				}
			},
			destroyed: () => {
				Janus.log("Janus destroyed");
			}
		});
	}

	private attach() {
		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: (pluginHandle: PluginHandle) => {
				Janus.log("Plugin attached! (" + pluginHandle.getPlugin() + ", id=" + pluginHandle.getId() + ")");

				this.getParticipants(pluginHandle);
			},
			onmessage: (message: any, jsep?: JSEP) => {
				console.log("init handler", message);
			},
			error: (cause: any) => {
				console.error("  -- Error attaching plugin...", cause);
			},
			detached: () => {
				console.log("detached main...");
			}
		});
	}

	private getParticipants(pluginHandle: PluginHandle) {
		const list = {
			request: "listparticipants",
			room: this.myroom,
		};

		pluginHandle.send({
			message: list,
			success: (res: any) => {
				const canJoin = res.participants && res.participants.length > 0;

				if (canJoin) {
					for (let i in res.participants) {
						const publisher = res.participants[i];

						this.attachToPublisher(publisher, !publisher.display);
					}
				}
				else {
					Janus.error("Requested feed is not available anymore");
				}

				pluginHandle.detach();
			}
		});
	}

	private attachToPublisher(publisher: any, isPrimary: boolean) {
		let remoteFeed: PluginHandle = null;

		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: (pluginHandle: PluginHandle) => {
				remoteFeed = pluginHandle;
				remoteFeed.isPrimary = isPrimary;
				remoteFeed.hasVideo = false;

				const subscribe = {
					request: "join",
					room: this.myroom,
					ptype: "subscriber",
					feed: publisher.id
				};

				remoteFeed.send({ message: subscribe });
			},
			error: (cause: any) => {
				Janus.error("  -- Error attaching plugin...", cause);

				if (remoteFeed.isPrimary) {
					this.stopSpeech();
				}
			},
			iceState: (state: 'connected' | 'failed') => {
				Janus.log("ICE state changed to " + state);
			},
			mediaState: (medium: 'audio' | 'video', receiving: boolean, mid?: number) => {
				Janus.log("Janus " + (receiving ? "started" : "stopped") + " receiving our " + medium);
			},
			webrtcState: (isConnected: boolean) => {
				Janus.log("Janus says our WebRTC PeerConnection is " + (isConnected ? "up" : "down") + " now");

				if (remoteFeed.isPrimary) {
					if (!isConnected) {
						this.stopSpeech();
					}
				}

				const event = new CustomEvent("publisher-state", {
					detail: {
						peerId: publisher.id,
						connected: isConnected
					}
				});
				this.dispatchEvent(event);
			},
			onmessage: (message: any, jsep?: JSEP) => {
				const event = message["videoroom"];

				if (message["error"]) {
					console.error(message["error"]);
					return;
				}

				if (event) {
					if (event === "attached") {
						// Subscriber created and attached.
						Janus.log("Successfully attached to feed " + message["id"] + " (" + message["display"] + ") in room " + message["room"]);

						remoteFeed.rfid = message["id"];

						this.remoteFeeds.push(remoteFeed);
					}
				}

				if (jsep) {
					this.createAnswer(remoteFeed, jsep, remoteFeed.isPrimary);
				}
			},
			onremotestream: (stream: MediaStream) => {
				let hasVideo = false;

				for (const videoTrack of stream.getVideoTracks()) {
					if (videoTrack.muted == false) {
						const removeListener = (event: MediaStreamTrackEvent) => {
							this.onVideoTrackRemoved(remoteFeed, event.track);

							stream.removeEventListener("removetrack", removeListener);
						};

						stream.addEventListener("removetrack", removeListener);

						hasVideo = true;
						break;
					}
				}

				remoteFeed.hasVideo = hasVideo;

				const video = this.playerView.getVideo(publisher.id, remoteFeed.isPrimary);

				Janus.attachMediaStream(video, stream);

				if (this.deviceConstraints) {
					this.setAudioSink(video, this.deviceConstraints.audioOutput);
				}

				this.checkVideoCount();
			},
			ondataopen: (label: string, protocol: string) => {
				Janus.log("The DataChannel is available!" + " - " + label + " - " + protocol);
			},
			ondata: (data: any) => {
				if (remoteFeed.isPrimary) {
					this.dataCallback(data);
				}
			},
			oncleanup: () => {
				if (!remoteFeed.isPrimary) {
					this.playerView.removeVideo(publisher.id);
				}

				this.remoteFeeds = this.remoteFeeds.filter(item => item !== remoteFeed);

				if (remoteFeed.isPrimary) {
					this.stopSpeech();
				}

				this.checkVideoCount();

				if (remoteFeed.isPrimary) {
					this.janus.destroy();
				}
			},
			detached: () => {
				Janus.log("detached...");
			}
		});
	}

	private setAudioSink(element: HTMLMediaElement, audioSink: string) {
		if (!('sinkId' in HTMLMediaElement.prototype)) {
			return;
		}

		element.setSinkId(audioSink)
			.catch(error => {
				console.error(error);
			});
	}

	private onVideoTrackRemoved(remoteFeed: PluginHandle, track: MediaStreamTrack) {
		// this.playbackModel.mainVideoAvailable = false;
		remoteFeed.hasVideo = false;

		this.checkVideoCount();
	}

	private checkVideoCount() {
		let hasVideo = false;

		for (const remoteFeed of this.remoteFeeds) {
			if (remoteFeed.hasVideo === true) {
				hasVideo = true;
				break;
			}
		}

		// this.playbackModel.videoAvailable = hasVideo;
	}

	private joinAsPublisher(remoteFeed: PluginHandle) {
		const subscribe = {
			request: "join",
			room: this.myroom,
			ptype: "publisher",
			display: this.myusername
		};

		remoteFeed.send({ message: subscribe });
	}

	private createAnswer(remoteFeed: PluginHandle, jsep: JSEP, wantData: boolean) {
		remoteFeed.createAnswer({
			jsep: jsep,
			media: { audioSend: false, videoSend: false, data: wantData },	// We want recvonly audio/video.
			success: (jsep: JSEP) => {
				const body = {
					request: "start",
					room: this.myroom
				};

				remoteFeed.send({ message: body, jsep: jsep });
			},
			error: (error: any) => {
				Janus.error("WebRTC error: ", error);
			}
		});
	}

	private publishOwnFeed(remoteFeed: PluginHandle, deviceConstraints: any) {
		const useVideo = deviceConstraints.videoDeviceId != null;

		// Publish our stream.
		remoteFeed.createOffer({
			// Publishers are sendonly.
			media: {
				audioRecv: false,
				videoRecv: false,
				audioSend: true,
				videoSend: useVideo,
				audio: {
					deviceId: deviceConstraints.audioDeviceId,
					echoCancellation: true
				},
				video: {
					deviceId: deviceConstraints.videoDeviceId,
					width: 1280,
					height: 720,
				},
				failIfNoAudio: true,
				failIfNoVideo: false,
			},
			success: (jsep: JSEP) => {
				Janus.debug("Got publisher SDP!", jsep);

				var publish = {
					request: "configure",
					audio: true,
					video: useVideo
				};

				// if(acodec)
				// 	publish["audiocodec"] = acodec;
				// if(vcodec)
				// 	publish["videocodec"] = vcodec;

				remoteFeed.send({ message: publish, jsep: jsep });
			},
			error: function (error: any) {
				Janus.error("WebRTC error:", error);
				
				console.error("WebRTC error:", error);

				deviceConstraints.videoDeviceId = null;

				this.publishOwnFeed(remoteFeed, deviceConstraints)
			}
		});
	}
}
