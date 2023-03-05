export class Utils {

	static isFirefox() {
		return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
	}

	static createEvent<T>(type: string, payload?: T): CustomEvent<T> {
		return new CustomEvent(type, {
			detail: payload,
			bubbles: true,
			composed: true,
		});
	}

	static async openFile(options: OpenFileOptions = {}) {
		return new Promise<File | File[]>((resolve, reject) => {
			const input = document.createElement("input");
			input.type = "file";

			const accept = [
				...options.mimeTypes || [],
				...options.extensions || [],
			].join();

			input.multiple = options.multiple || false;
			input.accept = accept || ''; // Empty string allows everything.
			input.style.display = 'none';

			const cancel = () => {
				window.removeEventListener("focus", cancel);
				input.remove();
			};

			input.addEventListener("change", () => {
				window.removeEventListener("focus", cancel);
				input.remove();

				resolve(input.multiple ? Array.from(input.files) : input.files[0]);
			});

			// Append to the DOM, else Safari on iOS won't fire the 'change' event reliably.
			document.body.append(input);

			setTimeout(_ => {
				if ("showPicker" in HTMLInputElement.prototype) {
					input.showPicker();
				}
				else {
					input.click();
				}

				window.addEventListener("focus", cancel);
			}, 0);
		});
	}

	static async readFile(file: File): Promise<Uint8Array> {
		return new Promise<Uint8Array>((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("loadend", e => resolve(new Uint8Array(e.target.result as ArrayBuffer)));
			reader.addEventListener("error", reject);
			reader.readAsArrayBuffer(file);
		});
	}
}