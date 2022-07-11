import {MediaPlayer} from "../media/media-player";

class SyncState {

    private mediaPlayer: MediaPlayer;
    
    constructor(mediaPlayer?: MediaPlayer) {
        if (mediaPlayer) {
            this.mediaPlayer = mediaPlayer;
        }
    }

    get audioTime(): number {
        if (this.mediaPlayer) {
            return this.mediaPlayer.time * 1000;
        } else {
            return 0;
        }
    }

}

export {SyncState};