import { Injectable } from '@angular/core';
// @ts-ignore
import {Janus} from "janus-gateway";

@Injectable({
  providedIn: 'root'
})
export class JanusService {

  private readonly serverUrl = 'http://localhost:8088/janus';

  private janus?: Janus;

  private publisherLocalStream?: MediaStream;

  private publisherHandle?: Janus.PluginHandle;

  private publisherId?: Number;

  private remoteFeeds?: Janus.PluginHandle[];

  private myRoomId?: number;

  private opaqueId?: string;

  private deviceConstraints: any;

  private myUsername?: string;

  private dataCallback?: (data: any) => void;

  private errorCallback?: (data: any) => void;


  constructor() {
    this.remoteFeeds = [];

    this.opaqueId = "course-" + Janus.randomString(12);
    this.myUsername = Janus.randomString(12);
  }

  start() {
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
    this.janus?.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: this.opaqueId,
      success: (pluginHandle: Janus.PluginHandle) => {
        Janus.log("Plugin attached! (" + pluginHandle.getPlugin() + ", id=" + pluginHandle.getId() + ")");

        // this.getParticipants(pluginHandle);
      },
      onmessage: (message: any, jsep?: Janus.JSEP) => {
        console.log("init handler", message);
      },
      error: (cause: any) => {
        console.error("  -- Error attaching plugin...", cause);
      },
      ondetached: () => {
        console.log("detached main...");
      }
    });
  }
}
