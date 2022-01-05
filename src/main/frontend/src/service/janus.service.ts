import { Janus } from "janus-gateway";
import { PlayerView } from "..";
import { PlaybackModel } from "../model/playback-model";
import { Utils } from "../utils/utils";

export class JanusService {

	private readonly playbackModel: PlaybackModel;

	private readonly serverUrl: string;

	private playerView: PlayerView;

	private janus: Janus;

	private publisherLocalStream: MediaStream;

	private publisherHandle: Janus.PluginHandle;

	private publisherId: Number;

	private remoteFeeds: PluginHandle[];

	private myroom: number;

	private opaqueId: string;

	private deviceConstraints: any;

	private myusername: string;

	private dataCallback: (data: any) => void;


	constructor(serverUrl: string, playbackModel: PlaybackModel) {
		this.serverUrl = serverUrl;
		this.playbackModel = playbackModel;
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

	setRoomId(roomId: number) {
		this.myroom = roomId;
	}

	setOnData(consumer: (data: any) => void) {
		Utils.checkFunction(consumer);

		this.dataCallback = consumer;
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

				this.playbackModel.webrtcPublisherConnected = isConnected;

				if (!isConnected) {
					this.playbackModel.localVideoAvailable = false;
					this.playbackModel.raisedHand = false;
				}
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

				const localVideoFeed = this.getElementById("localVideoFeed") as HTMLMediaElement;

				Janus.attachMediaStream(localVideoFeed, stream);

				localVideoFeed.muted = true;
				let hasVideo = false;

				for (const videoTrack of stream.getVideoTracks()) {
					if (videoTrack.muted == false) {
						hasVideo = true;
						break;
					}
				}

				this.playbackModel.localVideoAvailable = hasVideo;
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

			this.playbackModel.localVideoAvailable = false;
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

				console.log(cause);
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
					this.playbackModel.webrtcConnected = isConnected;

					if (!isConnected) {
						this.stopSpeech();
					}
				}
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
						hasVideo = true;
						break;
					}
				}

				remoteFeed.hasVideo = hasVideo;

				if (remoteFeed.isPrimary) {
					const video = this.playerView.getMediaElement() as HTMLVideoElement;

					Janus.attachMediaStream(video, stream);

					this.setAudioSink(video, this.deviceConstraints.audioOutput);

					this.playbackModel.mainVideoAvailable = hasVideo;
				}
				else {
					let video = this.getElementById("videoFeed-" + publisher.id) as HTMLVideoElement;

					if (!video) {
						video = document.createElement("video");
						video.id = "videoFeed-" + publisher.id;
						video.autoplay = true;
						video.playsInline = true;
	
						const div = document.createElement("div");
						div.id = "videoFeedDiv-" + publisher.id;
						div.classList.add("invisible");
						div.appendChild(video);
	
						const videoFeedContainer = this.getElementById("videoFeedContainer");
						videoFeedContainer.appendChild(div);
					}

					if (hasVideo) {
						const videoFeedDiv = this.getElementById("videoFeedDiv-" + publisher.id);
						videoFeedDiv.classList.remove("invisible");
					}

					Janus.attachMediaStream(video, stream);

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
					const videoFeedContainer = this.getElementById("videoFeedContainer");
					const videoFeedDiv = this.getElementById("videoFeedDiv-" + publisher.id);

					videoFeedContainer.removeChild(videoFeedDiv);
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

	private checkVideoCount() {
		let hasVideo = false;

		for (const remoteFeed of this.remoteFeeds) {
			if (remoteFeed.hasVideo === true) {
				hasVideo = true;
				break;
			}
		}

		this.playbackModel.videoAvailable = hasVideo;
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
				audio: {
					deviceId: deviceConstraints.audioDeviceId,
					echoCancellation: true
				},
				videoSend: useVideo,
				video: {
					deviceId: deviceConstraints.videoDeviceId,
					width: 1280,
					height: 720
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

	private getElementById(id: string) {
		return document.getElementById(id);
	}
}
