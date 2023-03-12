import { Client } from '@stomp/stompjs';
import { EventSubService } from "./event.service";
import { Utils } from '../utils/utils';

export class P2PService extends EventTarget implements EventSubService {

	initialize(courseId: number, client: Client): void {
		client.subscribe("/topic/p2p/joined", (message) => {
			const peer = JSON.parse(message.body);

			document.dispatchEvent(Utils.createEvent("p2p-peer-joined", peer));
		});
		client.subscribe("/topic/p2p/left", (message) => {
			const peer = JSON.parse(message.body);

			document.dispatchEvent(Utils.createEvent("p2p-peer-left", peer));
		});
		client.subscribe("/topic/p2p/reorganize", (message) => {
			const peer = JSON.parse(message.body);

			document.dispatchEvent(Utils.createEvent("p2p-peer-reorganize", peer));
		});
		client.subscribe("/topic/p2p/document/done", (message) => {
			const peer = JSON.parse(message.body);

			document.dispatchEvent(Utils.createEvent("p2p-document-loaded", peer));
		});
	}
}