import { MediaType } from "../model/media-type";
import { StreamAction } from "./stream.action";

export class StreamMediaChangeAction extends StreamAction {

	readonly type: MediaType;

	readonly enabled: boolean;


	constructor(type: MediaType, enabled: boolean) {
		super();

		this.type = type;
		this.enabled = enabled;
	}
}