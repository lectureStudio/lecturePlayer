export * from "./extension";

// Make components available to the document.
export * from "./component";
export * from "./pages";

import * as pdfjs from "pdfjs-dist";

class lectPlayer {

	constructor() {
		window.onload = function () {
			document.body.appendChild(document.createElement("lecture-player-styles"));
		}

		this.initPDF();
	}

	initPDF() {
		pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.js";
	}
}

new lectPlayer();
