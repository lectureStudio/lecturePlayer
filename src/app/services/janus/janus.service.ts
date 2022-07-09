import {Injectable, NgZone} from '@angular/core';
// @ts-ignore
import {DestroyOptions, Janus, JanusJS} from "janus-gateway";

import * as hark from 'hark';
import {Subject} from "rxjs";

export interface DisplayableStream {
    stream: MediaStream;
    feedId: string;
    isScreenshare?: boolean;
    userName: string;
    isMyStream?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class JanusService {

    private readonly serverUrl = (window.location.hostname === 'localhost' ? 'http://' : 'https://')
        + window.location.hostname
        + (window.location.hostname === 'localhost' ? ':8088' : ':8099')
        + '/janus';
    // private readonly serverUrl = 'https://' + window.location.hostname + ':10089/janus';

    private janus?: Janus;

    private publisherJanusHandle?: Janus.PluginHandle;
    private subscriberJanusHandle?: Janus.PluginHandle = null;

    private screenshareJanusHandle?: Janus.PluginHandle;
    private screenshareId?: number;
    private privateScreenshareId?: number;
    private myScreenshareStream: any;

    private screensharingIsActive: boolean = false;

    private feedStreams: any = {};

    public myRoomId?: number;
    private myId?: number;
    private myPrivateId?: number;
    private myStream: any;

    public localTracks: { [key: string]: DisplayableStream } = {};

    private opaqueId?: string;

    private myUsername?: string;

    public isMuted: boolean = false;
    public isVideoMuted: boolean = false;

    private isCurrentlyCreatingASubscription = false;

    private subscriptions: any = {};
    private feeds: any = {};
    public remoteTracks: { [key: string]: DisplayableStream } = {};
    private simulcastStarted: any = {};
    private mids: any = {};
    public slots: any = {};
    private subStreams: any = {};

    public audioDevices: { [key: string]: string } = {};
    public videoDevices: { [key: string]: string } = {};

    public currentlyChosenOverrideAudioDeviceId = '';
    public currentlyChosenOverrideVideoDeviceId = '';

    public talkingFeeds: { [key: string]: boolean } = {};
    public talkingFeedsSubject: Subject<{ [key: string]: boolean }> = new Subject<{ [key: string]: boolean }>();

    public screenshareStateSubject: Subject<string> = new Subject<string>();

    private doSimulcast = false;

    private subscriberMode = false;

    public locallyMutedRemoteAudioFeeds: { [key: string]: boolean } = {};

    private dataCallback: (data: any) => void;

    constructor(private ngZone: NgZone) {
        this.myRoomId = 1;

        this.opaqueId = "course-" + Janus.randomString(12);
        this.myUsername = Janus.randomString(12);

        // @ts-ignore
        window.janusService = this;
    }

    start() {
        this.isCurrentlyCreatingASubscription = false;
        this.subscriptions = {};
        this.feeds = {};
        this.remoteTracks = {};
        this.simulcastStarted = {};
        this.mids = {};
        this.slots = {};
        this.subStreams = {};

        this.subscriberJanusHandle = null;
        this.publisherJanusHandle = null;
        this.screenshareJanusHandle = null;
        this.janus = null;

        // Initialize the library (all console debuggers enabled).
        Janus.init({
            debug: "all",
            callback: () => {
                // Make sure the browser supports WebRTC.
                console.log('Does browser support webrtc?');
                if (!Janus.isWebrtcSupported()) {
                    console.error("No WebRTC support...");
                    return;
                } else {
                    console.log("WebRTC is supported.");
                }

                this.createSession();
            }
        });
    }

    public end() {
        this.unpublishOwnFeed();

        for (const [id, value] of Object.entries(this.feedStreams)) {
            this.unsubscribeFrom(id);
        }


        this.publisherJanusHandle.hangup();
        this.subscriberJanusHandle.hangup();
        if (this.screenshareJanusHandle) {
            this.screenshareJanusHandle.hangup();
        }
        this.janus.destroy();
    }

    private createSession() {
        this.janus = new Janus({
            server: this.serverUrl,
            success: () => {
                console.log('Janus handle created!');

                this.janus.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: this.opaqueId,
                    success: (pluginHandle: any) => {
                        this.publisherJanusHandle = pluginHandle;

                        Janus.log("Plugin attached!" + this.publisherJanusHandle.getPlugin() + ", id=" + this.publisherJanusHandle.getId() + ")");

                        // NOTE: probably a debug thing to leave this here. TODO remove
                        this.registerUsernameToJoinAsPublisher();

                        Janus.listDevices(this.initDeviceList);
                    },
                    iceState: (state: any) => {
                        console.log('ICE state changed to ' + state);
                    },
                    webrtcState: (on: any) => {
                        Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                    },
                    onmessage: (msg: any, jsep: any) => {
                        Janus.debug('::: Got a message (publisher) :::');
                        const event = msg["videoroom"];
                        if (event) {
                            if (event === "joined") {
                                this.messageHandle_OnJoinedEvent(msg);
                            } else if (event === "destroyed") {
                                this.messageHandle_OnDestroyedEvent(msg);
                            } else if (event === "event") {
                                this.messageHandle_OnGeneralEvent(msg);
                            }
                        }

                        if (jsep) {
                            Janus.debug("Handling SDP as well...", jsep);
                            this.publisherJanusHandle.handleRemoteJsep({jsep});
                            const audio = msg["audio_codec"];

                            if (this.myStream && this.myStream.getAudioStracks() && this.myStream.getAudioTracks().length > 0 && !audio) {
                                // Our audio has been rejected
                                Janus.warn("Our audio stream has been rejected, viewers won't hear us.");
                            }
                            const video = msg["video_codec"];
                            if (this.myStream && this.myStream.getVideoTracks() && this.myStream.getVideoTracks().length > 0 && !video) {
                                Janus.warn("Our video stream has been rejected, viewers won't see us.");
                            }
                        }
                    },
                    error: (cause: any) => {
                        Janus.error(cause);
                    },
                    destroyed: () => {
                        Janus.log("Janus destroyed");
                    },
                    onlocaltrack: (track: any, on: any) => {
                        Janus.debug("Got a local track event");
                        Janus.debug("Local track " + (on ? "added" : "removed") + ":", track);

                        var trackId = track.id.replace(/[{}]/g, "");
                        if (!on) {
                            // Track removed, get rid of the stream and the rendering
                            const removedStream = this.localTracks[trackId];
                            if (removedStream) {
                                try {
                                    var tracks = removedStream.stream.getTracks();
                                    for (var i in tracks) {
                                        var mst = tracks[i];
                                        if (mst)
                                            mst.stop();
                                    }
                                } catch (e) {
                                }
                            }
                            if (track.kind === "video") {

                            }
                            delete this.localTracks[trackId];
                            return;
                        }
                        // If we're here, a new track was added
                        var stream = this.localTracks[trackId];
                        if (stream) {
                            // We've been here already
                            return;
                        }
                        // Make sure there's a mute button and stuff
                        if (track.kind === "audio") {
                            // Local audio is ignored
                            for (const [key, value] of Object.entries(this.audioDevices)) {
                                if (value == track.label) {
                                    this.currentlyChosenOverrideAudioDeviceId = key;
                                    return;
                                }
                            }
                        } else {
                            // New local video track, create a stream out of it
                            const newStream = new MediaStream();
                            newStream.addTrack(track.clone());
                            this.localTracks[trackId] = {
                                stream: newStream,
                                feedId: trackId,
                                userName: this.myUsername + ' (You)',
                                isMyStream: true
                            };
                            Janus.log("Created local stream:", stream);
                            Janus.log(newStream.getTracks());
                            Janus.log(newStream.getVideoTracks());

                            for (const [key, value] of Object.entries(this.videoDevices)) {
                                if (value == track.label) {
                                    this.currentlyChosenOverrideVideoDeviceId = key;
                                    return;
                                }
                            }
                        }
                    },
                    onremotetrack: (track: any, mid: any, on: any) => {
                        // Pub stream is sendonly
                    },
                    oncleanup: () => {
                        Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
                        this.myStream = null;
                        if (this.myId) {
                            delete this.feedStreams[this.myId];
                        }
                    }
                })
            },
            error: (error: any) => {
                Janus.error(error);
            },
            destroyed: () => {
                console.log('Janus instance destroyed.');
            }
        });
    }

    public registerUsernameToJoinAsPublisher() {
        const register = {
            request: "join",
            room: this.myRoomId,
            ptype: "publisher",
            display: this.myUsername
        }

        this.publisherJanusHandle.send({message: register});
    }

    private publishOwnFeed(useAudio: boolean, audioDeviceIdOverride?: string, videoDeviceIdOverride?: string) {
        const mediaObject = {}

        if (audioDeviceIdOverride) {
            // @ts-ignore
            if (!mediaObject.audio) {
                // @ts-ignore
                mediaObject.audio = {};
            }
            // @ts-ignore
            mediaObject.audio = {
                deviceId: {
                    exact: audioDeviceIdOverride
                }
            };
            // @ts-ignore
            mediaObject.replaceAudio = true;
        }
        if (videoDeviceIdOverride) {
            // @ts-ignore
            if (!mediaObject.video) {
                // @ts-ignore
                mediaObject.video = {};
            }
            //@ts-ignore
            mediaObject.video = {
                deviceId: {
                    exact: videoDeviceIdOverride
                }
            }
            // @ts-ignore
            mediaObject.replaceVideo = true;
        }

        this.publisherJanusHandle.createOffer({
            media: {...mediaObject, audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true},
            simulcast: this.doSimulcast,
            success: (jsep: any) => {
                Janus.debug("Got a publisher SDP!", jsep);
                const publish = {request: "configure", audio: useAudio, video: true};

                // TODO you can force a codec here, check demo code

                this.publisherJanusHandle.send({message: publish, jsep});
            },
            error: (error: any) => {
                Janus.error("WebRTC error: ", error);
                if (useAudio) {
                    this.publishOwnFeed(false);
                } else {
                    // ?
                }
            }
        })
    }

    public toggleMute() {
        this.isMuted = this.publisherJanusHandle.isAudioMuted();
        Janus.log((this.isMuted ? "Unmuting" : "Muting") + " local stream...");
        if (this.isMuted)
            this.publisherJanusHandle.unmuteAudio();
        else
            this.publisherJanusHandle.muteAudio();
        this.isMuted = this.publisherJanusHandle.isAudioMuted();
    }

    public toggleCamera() {
        this.isVideoMuted = this.publisherJanusHandle.isVideoMuted();
        Janus.log((this.isMuted ? "Unmuting" : "Muting") + " local video stream...");
        if (this.isVideoMuted)
            this.publisherJanusHandle.unmuteVideo();
        else
            this.publisherJanusHandle.muteVideo();
        this.isVideoMuted = this.publisherJanusHandle.isVideoMuted();
    }

    private initDeviceList = (devices: any) => {
        this.audioDevices = {};
        this.videoDevices = {};

        for (const device of devices) {
            let label = device.label;


            if (!label || label === "") {
                label = device.deviceId;
            }

            console.log('Device found: ', label, device);

            if (device.kind === "audioinput") {
                this.audioDevices[device.deviceId] = label;
                console.log('audio devices', this.audioDevices);
            } else if (device.kind === "videoinput") {
                this.videoDevices[device.deviceId] = label;
            }
        }
    }

    public selectAudioDevice(key: string) {
        this.currentlyChosenOverrideAudioDeviceId = key;
        this.publishOwnFeed(true, key);
    }

    public selectVideoDevice(key: string) {
        this.currentlyChosenOverrideVideoDeviceId = key;
        this.publishOwnFeed(true, undefined, key);
    }

    private unpublishOwnFeed() {
        const unpublish = {request: "unpublish"};
        this.publisherJanusHandle.send({message: unpublish});
    }

    private messageHandle_OnJoinedEvent(msg: any) {
        this.myId = msg["id"];
        this.myPrivateId = msg["private_id"];

        Janus.log("Successfully joined room " + msg["room"] + " with ID " + this.myId + " and private ID " + this.myPrivateId);

        // Here, if subscriber_mode === true hide videojoin, else publishOwnFeed

        if (this.subscriberMode) {
            // ?
        } else {
            this.publishOwnFeed(true);
        }

        if (msg["publishers"]) {
            this.handlePublisherEvent(msg);
        }
    }

    private messageHandle_OnDestroyedEvent(msg: any) {
        Janus.warn("The room has been destroyed.");
    }

    private messageHandle_OnGeneralEvent(msg: any) {
        if (msg["streams"]) {
            // Could be a new stream to subscribe to
            const streams = msg["streams"];
            for (const streamIdx in streams) {
                const stream = streams[streamIdx];
                stream["id"] = this.myId;
                stream["display"] = this.myUsername;
            }

            if (!this.myId)
                return;

            this.feedStreams[this.myId] = {
                id: this.myId,
                display: this.myUsername,
                streams
            }
        } else if (msg["publishers"]) {
            const publisherList = msg["publishers"];
            Janus.debug("Got a list of available pubs: ", publisherList);

            this.handlePublisherEvent(msg);
        } else if (msg["leaving"]) {
            const leavingPublisher = msg["leaving"];
            Janus.log("A publisher left: " + leavingPublisher, msg);
            this.unsubscribeFrom(leavingPublisher);
        } else if (msg["unpublished"]) {
            const publisherLeft = msg["unpublished"];
            Janus.log("Publisher left: " + publisherLeft, msg);
            if (publisherLeft === 'ok') {
                // Apparently, we left if this is the cast? (Local instance)
                // thispluginhandle.hangup(); return;
            }

            this.unsubscribeFrom(publisherLeft);
        } else if (msg["error"]) {
            Janus.log("Some kind of error occurred.", msg["error"]);
        }
    }

    private handlePublisherEvent(msg: any) {
        const list = msg["publishers"];
        Janus.debug("Got a list of available publishers: ", list);

        let sources;
        for (const entryIdx in list) {
            if (list[entryIdx]["dummy"]) {
                continue;
            }

            const id = list[entryIdx]["id"];
            const display = list[entryIdx]["display"];
            const streams = list[entryIdx]["streams"];

            for (const streamIdx in streams) {
                const stream = streams[streamIdx];
                stream["id"] = id;
                stream["display"] = display;
            }

            this.feedStreams[id] = {
                id,
                display,
                streams
            }

            Janus.debug("Stream " + id + " display: " + display + " streams: ", streams);

            if (!sources) {
                sources = [];
            }

            if (id === this.screenshareId || id === this.myId) {
                continue;
            }
            sources.push(streams);
        }

        if (sources) {
            this.subscribeTo(sources);
        }
    }

    private subscribeTo(sources: any) {
        if (this.isCurrentlyCreatingASubscription) {
            setTimeout(() => {
                this.subscribeTo(sources);
            }, 500);
            return;
        }

        // Plugin handle for sub already exists

        if (this.subscriberJanusHandle) {
            const subscription = this.subscriber_HandleSubscription(sources);

            if (subscription.length > 0) {
                this.subscriberJanusHandle.send({
                    message: {
                        request: "subscribe",
                        streams: subscription
                    }
                });
            }

            return;
        }

        this.isCurrentlyCreatingASubscription = true;
        this.janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: this.opaqueId,
            success: (pluginHandle: any) => {
                this.subscriberJanusHandle = pluginHandle;
                this.remoteTracks = {};
                Janus.log("Plugin attached! (" + this.subscriberJanusHandle.getPlugin() + ", id=" + this.subscriberJanusHandle.getId() + ")");
                Janus.log("  -- This is a multistream subscriber");

                const subscription = this.subscriber_HandleSubscription(sources);

                const subscribe = {
                    request: "join",
                    room: this.myRoomId,
                    ptype: "subscriber",
                    streams: subscription,
                    private_id: this.myPrivateId
                };

                this.subscriberJanusHandle.send({message: subscribe});
            },
            error: (error: any) => {
                Janus.error("Error attaching plugin...", error);
            },
            iceState: (state: any) => {
                Janus.log("ICE state (remote feed) changed to " + state);
            },
            webrtcState: (on: any) => {
                Janus.log("Janus says this WebRTC PeerConnection (remote feed) is " + (on ? "up" : "down") + " now");
            },
            slowLink: (uplink: any, lost: any, mid: any) => {
                Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
                    " packets on mid " + mid + " (" + lost + " lost packets)");
            },
            onmessage: (msg: any, jsep: any) => {
                Janus.debug("Got a message (subscriber)", msg);

                const event = msg["videoroom"];

                Janus.debug("Event: ", event);
                if (msg["error"]) {
                    Janus.warn("Subscriber error: ", msg["error"]);
                } else if (event) {
                    if (event === "attached") {
                        // Now we have a working subscription, next requests will update this one
                        this.isCurrentlyCreatingASubscription = false;
                        Janus.log("Successfully attached to feed in room " + msg["room"]);
                    } else if (event === "event") {
                        this.subscriber_HandleGeneralEvent(msg);
                    }
                }

                if (msg["streams"]) {
                    this.subscriber_HandleStreamsEvent(msg);
                }

                if (jsep) {
                    Janus.debug("Handling SDP as well...", jsep);
                    // Answer and attach
                    const myRoom = this.myRoomId;
                    const remoteFeed = this.subscriberJanusHandle;
                    this.subscriberJanusHandle.createAnswer(
                        {
                            jsep: jsep,
                            // Add data:true here if you want to subscribe to datachannels as well
                            // (obviously only works if the publisher offered them in the first place)
                            media: {audioSend: false, videoSend: false},	// We want recvonly audio/video
                            success: function (jsep: any) {
                                Janus.debug("Got SDP!");
                                Janus.debug(jsep);
                                const body = {request: "start", room: myRoom};
                                remoteFeed.send({message: body, jsep: jsep});
                            },
                            error: function (error: any) {
                                Janus.error("WebRTC error:", error);
                            }
                        });
                }
            },
            onlocaltrack: (track: any, on: any) => {
                // Subscriber only receives data
            },
            onremotetrack: (track: any, mid: any, on: any) => {
                const sub = this.subStreams[mid];
                const feed = this.feedStreams[sub.feed_id];
                Janus.debug("This track is coming from feed " + sub.feed_id + ":", feed);
                let slot = this.slots[mid];
                if (feed && !slot) {
                    slot = feed.slot;
                    this.slots[mid] = feed.slot;
                    this.mids[feed.slot] = mid;
                }
                Janus.debug("mid " + mid + " is in slot " + slot);
                if (!on) {
                    // Track was removed, get rid of the stream and the rendering in the UI
                    const stream = this.remoteTracks[mid];
                    if (stream) {
                        try {
                            const tracks = stream.stream.getTracks();
                            for (const trackIdx in tracks) {
                                const mst = tracks[trackIdx];
                                if (mst) {
                                    mst.stop();
                                }
                            }
                        } catch (e) {
                        }
                    }
                    // Remove from UI!!!! (They are calling a jquery remove here TODO)
                    if (track.kind === "video" && feed) {
                        feed.remoteVideos--;
                        if (feed.remoteVideos === 0) {
                            // NO videos, show a placeholder instead!
                        }
                    }

                    this.ngZone.run(() => {
                        delete this.remoteTracks[mid];
                    });
                    delete this.mids[this.slots];
                    return;
                }
                // If we are here, a new track was added
                if (feed.spinner) {
                    feed.spinner.stop();
                    feed.spinner = null;
                }
                if (track.kind === "audio") {
                    // New audio track, create a stream out of it and use a hidden <audio> element to play it
                    const newStream = new MediaStream();
                    newStream.addTrack(track.clone());
                    this.ngZone.run(() => {
                        this.remoteTracks[mid] = {
                            stream: newStream,
                            feedId: feed.id,
                            userName: feed.display
                        };
                    });

                    const speechEvents = hark(newStream, {});

                    const that = this;

                    speechEvents.on('speaking', function () {
                        that.ngZone.run(() => {
                            that.talkingFeeds[feed.id] = true;
                            that.talkingFeedsSubject.next(that.talkingFeeds);
                        });
                        console.log('speaking: ', feed.id, that.talkingFeeds);
                    });

                    speechEvents.on('stopped_speaking', function () {
                        that.ngZone.run(() => {
                            that.talkingFeeds[feed.id] = false;
                            that.talkingFeedsSubject.next(that.talkingFeeds);
                        });
                        console.log('stopped_speaking: ', feed.id);
                    });

                    Janus.log("Created remote audio stream: ", newStream);

                    // They are calling:
                    // ($('#videoremote' + slot).append('<audio class="hide" id="remotevideo' + slot + '-' + mid + '" autoplay playsinline/>');
                    // Janus.attachMediaStream($('#remotevideo' + slot + '-' + mid).get(0), stream);

                    if (feed.remoteVideos === 0) {
                        // There is no video, at least for now. Show a placeholder in the video UI
                    }
                } else {
                    // New video track, create a stream out of it
                    feed.remoteVideos++;
                    const newStream = new MediaStream();
                    newStream.addTrack(track.clone());

                    let isScreenshare = false;
                    if (feed.display.includes("_screen")) {
                        isScreenshare = true;
                        this.screensharingIsActive = true;
                        this.screenshareStateSubject.next("start");
                        this.talkingFeedsSubject.next(this.talkingFeeds);
                    }
                    this.ngZone.run(() => {
                        this.remoteTracks[mid] = {
                            stream: newStream,
                            feedId: feed.id,
                            isScreenshare: isScreenshare,
                            userName: feed.display
                        };
                    });
                    Janus.log("Created remote video stream: ", newStream, "for feed: ", feed);
                    // Append video stream! (they are calling jquery)

                    // Bitrate timer stuff?
                    // TODO Does this just display the bitrate of the streams?
                }
            },
            oncleanup: () => {
                Janus.log("Got a cleanup notification (remote feed)");
            }
        })
    }

    private unsubscribeFrom(id: any) {
        const feed = this.feedStreams[id];
        if (!feed) {
            return;
        }

        Janus.debug("Feed " + id + " (" + feed.display + ") has left the room, detaching");

        delete this.simulcastStarted[feed.slot];
        delete this.feeds[feed.slot];
        delete this.feedStreams[id];

        const unsubscribe = {
            request: "unsubscribe",
            streams: [{feed: id}]
        };

        if (this.subscriberJanusHandle !== null) {
            this.subscriberJanusHandle.send({message: unsubscribe});
        }

        delete this.subscriptions[id];

        if (feed.display.includes("_screen")) {
            this.screenshareStateSubject.next("stop");
            this.talkingFeedsSubject.next(this.talkingFeeds);
        }
    }

    private subscriber_HandleSubscription(sources: any) {
        const subscription = [];
        for (const sourceIdx in sources) {
            const streams = sources[sourceIdx];
            for (const streamIdx in streams) {
                const stream = streams[streamIdx];

                // If the publisher is VP8/VP9 and this is an older Safari, let's avoid video
                if (stream.type === "video" && Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                    (stream.codec === "vp9" || (stream.codec === "vp8" && !Janus.safariVp8))) {
                    Janus.warn("Publisher is using " + stream.codec.toUpperCase +
                        ", but Safari doesn't support it: disabling video stream #" + stream.mindex);
                    continue;
                }
                if (stream.disabled) {
                    Janus.log("Disabled stream:", stream);
                    // TODO Skipping for now, we should unsubscribe
                    continue;
                }
                if (this.subscriptions[stream.id] && this.subscriptions[stream.id][stream.mid]) {
                    Janus.log("Already subscribed to stream, skipping:", stream);
                    continue;
                }

                // Find an empty slot in the UI for each new source
                if (!this.feedStreams[stream.id]?.slot) {
                    let slot;
                    for (let i = 1; i < 6; i++) {
                        if (!this.feeds[i]) {
                            slot = i;
                            this.feeds[slot] = stream.id;
                            this.feedStreams[stream.id].slot = slot;
                            this.feedStreams[stream.id].remoteVideos = 0;
                        }
                    }
                }
                subscription.push({
                    feed: stream.id,	// This is mandatory
                    mid: stream.mid		// This is optional (all streams, if missing)
                });
                if (!this.subscriptions[stream.id])
                    this.subscriptions[stream.id] = {};
                this.subscriptions[stream.id][stream.mid] = true;
            }
        }

        return subscription;
    }

    private subscriber_HandleGeneralEvent(msg: any) {
        const mid = msg["mid"];
        const substream = msg["substream"];
        const temporal = msg["temporal"];
        if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
            // Check which this feed this refers to
            const sub = this.subStreams[mid];
            const feed = this.feedStreams[sub.feed_id];
            const slot = this.slots[mid];
            if (!this.simulcastStarted[slot]) {
                this.simulcastStarted[slot] = true;
                // Add some new buttons
                // addSimulcastButtons(slot, true);
            }
            // We just received notice that there's been a switch, update the buttons
            // updateSimulcastButtons(slot, substream, temporal);
        } else {
            // ?
        }
    }


    private subscriber_HandleStreamsEvent(msg: any) {
        for (const streamIdx in msg["streams"]) {
            const mid = msg["streams"][streamIdx]["mid"];
            this.subStreams[mid] = msg["streams"][streamIdx];
            const feed = this.feedStreams[msg["streams"][streamIdx]["feed_id"]];
            if (feed && feed.slot) {
                this.slots[mid] = feed.slot;
                this.mids[feed.slot] = mid;
            }
        }
    }

    public startScreenshare() {

        this.janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: this.opaqueId,
            success: (pluginHandle: any) => {
                this.screenshareJanusHandle = pluginHandle;

                Janus.log("Plugin attached!" + this.screenshareJanusHandle.getPlugin() + ", id=" + this.screenshareJanusHandle.getId() + ")");

                // NOTE: probably a debug thing to leave this here. TODO remove
                const register = {
                    request: "join",
                    room: this.myRoomId,
                    ptype: "publisher",
                    display: this.myUsername + "_screen",
                }

                this.screenshareJanusHandle.send({message: register});

                //Janus.listDevices(this.initDeviceList);
            },
            iceState: (state: any) => {
                console.log('ICE state changed to ' + state);
            },
            webrtcState: (on: any) => {
                Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            },
            onmessage: (msg: any, jsep: any) => {
                Janus.debug('::: Got a message (publisher) :::');
                const event = msg["videoroom"];
                if (event) {
                    if (event === "joined") {
                        this.screenshareId = msg["id"];
                        this.privateScreenshareId = msg["private_id"];

                        Janus.log("Successfully joined room " + msg["room"] + " with ID " + this.screenshareId + " and private ID " + this.privateScreenshareId);

                        // Here, if subscriber_mode === true hide videojoin, else publishOwnFeed

                        this.screenshareJanusHandle.createOffer({
                            media: {
                                audioRecv: false,
                                videoRecv: false,
                                audioSend: false,
                                videoSend: true,
                                video: "screen"
                            },
                            simulcast: this.doSimulcast,
                            success: (jsep: any) => {
                                Janus.debug("Got a publisher SDP!", jsep);
                                const publish = {request: "configure", audio: true, video: true};

                                // TODO you can force a codec here, check demo code

                                this.screenshareJanusHandle.send({message: publish, jsep});
                            },
                            error: (error: any) => {
                                Janus.error("WebRTC error: ", error);
                                // TODO Notify that something went wrong
                            }
                        })

                        if (this.subscriberMode) {
                            // ?
                        } else {

                        }

                        if (msg["publishers"]) {
                            //this.handlePublisherEvent(msg);
                        }
                    } else if (event === "destroyed") {
                        this.messageHandle_OnDestroyedEvent(msg);
                    } else if (event === "event") {
                        this.messageHandle_OnGeneralEvent(msg);
                    }
                }

                if (jsep) {
                    Janus.debug("Handling SDP as well...", jsep);
                    this.screenshareJanusHandle.handleRemoteJsep({jsep});
                    const audio = msg["audio_codec"];

                    if (this.myScreenshareStream && this.myScreenshareStream.getAudioStracks() && this.myScreenshareStream.getAudioTracks().length > 0 && !audio) {
                        // Our audio has been rejected
                        Janus.warn("Our audio stream has been rejected, viewers won't hear us.");
                    }
                    const video = msg["video_codec"];
                    if (this.myScreenshareStream && this.myScreenshareStream.getVideoTracks() && this.myScreenshareStream.getVideoTracks().length > 0 && !video) {
                        Janus.warn("Our video stream has been rejected, viewers won't see us.");
                    }
                }
            },
            error: (cause: any) => {
                Janus.error(cause);
            },
            destroyed: () => {
                Janus.log("Janus destroyed");
            },
            onlocaltrack: (track: any, on: any) => {
                Janus.debug("Got a local track event");
                Janus.debug("Local track " + (on ? "added" : "removed") + ":", track);

                track.addEventListener('ended', () => {
                    this.stopScreenshare();
                });

                var trackId = track.id.replace(/[{}]/g, "");
                if (!on) {
                    // Track removed, get rid of the stream and the rendering
                    const removedStream = this.localTracks[trackId];
                    if (removedStream) {
                        try {
                            var tracks = removedStream.stream.getTracks();
                            for (var i in tracks) {
                                var mst = tracks[i];
                                if (mst)
                                    mst.stop();
                            }
                        } catch (e) {
                        }
                    }
                    if (track.kind === "video") {

                    }
                    delete this.localTracks[trackId];
                    return;
                }
                // If we're here, a new track was added
                var stream = this.localTracks[trackId];
                if (stream) {
                    // We've been here already
                    return;
                }
                // Make sure there's a mute button and stuff
                if (track.kind === "audio") {
                    // Local audio is ignored
                } else {
                    // New local video track, create a stream out of it
                    const newStream = new MediaStream();
                    newStream.addTrack(track.clone());
                    this.localTracks[trackId] = {
                        stream: newStream,
                        feedId: trackId,
                        isScreenshare: true,
                        userName: 'My Screenshare',
                        isMyStream: true
                    };
                    Janus.log("Created local stream:", stream);
                    Janus.log(newStream.getTracks());
                    Janus.log(newStream.getVideoTracks());
                }
            },
            onremotetrack: (track: any, mid: any, on: any) => {
                // Pub stream is sendonly
            },
            oncleanup: () => {
                Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
                this.myScreenshareStream = null;
                if (this.screenshareId) {
                    delete this.feedStreams[this.screenshareId];
                }
            }
        })

    }

    public stopScreenshare() {
        const unpublish = {request: "unpublish"};
        this.screenshareJanusHandle.send({message: unpublish});
    }

    public muteRemoteAudioLocallyForFeedId(feedId: string) {
        let mute = true;
        if (this.locallyMutedRemoteAudioFeeds[feedId]) {
            mute = false;
        }
        this.locallyMutedRemoteAudioFeeds[feedId] = mute;
    }


    public setOnData(consumer: (data: any) => void) {
        this.dataCallback = consumer;
    }
}
