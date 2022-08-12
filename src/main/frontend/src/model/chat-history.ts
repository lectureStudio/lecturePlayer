import { MessageServiceMessage } from '../service/message.service';
import { Utils } from '../utils/utils';

class ChatHistory extends EventTarget {

	private _history: MessageServiceMessage[] = [];


	get history(): MessageServiceMessage[] {
		return this._history;
	}

	set history(history: MessageServiceMessage[]) {
		this._history = history;

		this.dispatchEvent(Utils.createEvent("all"));
	}

	add(message: MessageServiceMessage) {
		// const index = this._history.findIndex(m => {
		// 	return m.messageId === message.messageId;
		// });

		// if (index === -1) {
			this._history.push(message);

			this.dispatchEvent(Utils.createEvent("added", message));
		// }
	}

	remove(message: MessageServiceMessage) {
		// const index = this._history.findIndex(m => {
		// 	return m.messageId === message.messageId;
		// });

		// if (index > -1) {
			// this._history.splice(index, 1);

			this.dispatchEvent(Utils.createEvent("removed", message));
		// }
	}

	clear() {
		this._history = [];

		this.dispatchEvent(Utils.createEvent("cleared"));
	}
}

export const chatHistory = new ChatHistory();