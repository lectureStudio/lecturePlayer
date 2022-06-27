import { Action } from "../action/action";

export class RecordedPage {

	staticActions: Action[] = [];

	playbackActions: Action[] = [];

	pageNumber: number;

	timestamp: number;

}