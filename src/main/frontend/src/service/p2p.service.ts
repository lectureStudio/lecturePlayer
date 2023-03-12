import { Client } from '@stomp/stompjs';
import { EventSubService } from "./event.service";
import { Utils } from '../utils/utils';

export class P2PService extends EventTarget implements EventSubService {

	private courseId: number;

	private client: Client;


	initialize(courseId: number, client: Client): void {
		this.courseId = courseId;
		this.client = client;

		client.subscribe("/topic/p2p/joined", (message) => {
			const client = JSON.parse(message.body);

			document.dispatchEvent(Utils.createEvent("p2p-peer-joined", client));
		});
		client.subscribe("/topic/p2p/left", (message) => {
			const client = JSON.parse(message.body);

			document.dispatchEvent(Utils.createEvent("p2p-peer-left", client));
		});
		client.subscribe("/topic/p2p/document/done", (message) => {
			const client = JSON.parse(message.body);

			document.dispatchEvent(Utils.createEvent("p2p-document-loaded", client));
		});
	}
}