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

	reset() {
		for (const prop of Object.getOwnPropertyNames(this)) {
			(this as unknown as Indexable)[prop] = {};
		}
	}
}

export const streamStatsStore = new StreamStatsStore();