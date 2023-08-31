import { ProgressiveDataView } from "./progressive-data-view";
import { ActionParser } from "./action.parser";
import { RecordedPage } from "../../model/recorded-page";

export namespace RecordedPageParser {

	export function parseBuffer(buffer: ArrayBuffer): RecordedPage[] {
		if (!buffer) {
			throw Error("Received empty course document");
		}

		const dataView = new ProgressiveDataView(buffer);
		const bufferLength = buffer.byteLength;

		const recordedPages: RecordedPage[] = [];

		while (dataView.byteOffset < bufferLength) {
			const entryLength = dataView.getInt32();

			if (entryLength < 0) {
				console.error("Invalid page to parse");
			}

			const recordedPage = RecordedPageParser.parse(dataView);

			if (recordedPage) {
				recordedPages.push(recordedPage);
			}
		}

		return recordedPages;
	}

	export function parse(dataView: ProgressiveDataView): RecordedPage {
		const recordedPage = new RecordedPage();

		const number = dataView.getInt32();
		const timestamp = dataView.getInt32();

		recordedPage.pageNumber = number;
		recordedPage.timestamp = timestamp;

		const staticActionSize = dataView.getInt32();

		if (staticActionSize > 0) {
			const end = dataView.byteOffset + staticActionSize;

			while (dataView.byteOffset < end) {
				const length = dataView.getInt32();
				const type = dataView.getInt8();
				const timestamp = dataView.getInt32();

				const action = ActionParser.parse(dataView, type, length);
				action.timestamp = timestamp;

				if (action) {
					recordedPage.staticActions.push(action);
				}
			}
		}

		const playbackActionSize = dataView.getInt32();
		if (playbackActionSize > 0) {
			const end = dataView.byteOffset + playbackActionSize;

			while (dataView.byteOffset < end) {
				const length = dataView.getInt32();
				const type = dataView.getInt8();
				const timestamp = dataView.getInt32();

				const action = ActionParser.parse(dataView, type, length);
				action.timestamp = timestamp;

				if (action) {
					recordedPage.playbackActions.push(action);
				}
			}
		}

		return recordedPage;
	}

}