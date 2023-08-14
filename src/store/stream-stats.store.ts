import { makeAutoObservable } from "mobx";
import { AudioStats, DataStats, DocumentStats, VideoStats } from "../model/stream-stats";

class StreamStatsStore {

	audioStats: AudioStats = {};

	cameraStats: VideoStats = {};

	screenStats: VideoStats = {};

	dataStats: DataStats = {};

	documentStats: DocumentStats = {};


	constructor() {
		makeAutoObservable(this);
	}
}

export const streamStatsStore = new StreamStatsStore();