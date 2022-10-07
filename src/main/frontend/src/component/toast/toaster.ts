import { Toast, ToastContainer, ToastGravity, ToastPosition, ToastType } from "./toast";

interface ToasterOptions {
	duration: number;
	selector: string | HTMLElement | ShadowRoot;
	gravity: ToastGravity;
	position: ToastPosition;
	closeable: boolean;
	stopOnFocus: boolean;
	oldestFirst: boolean;
	onClosed: Function;
	onClick: Function;
	offset: { x: number, y: number };
}

export abstract class Toaster {

	private static readonly defaults: ToasterOptions = {
		duration: 3000,
		selector: undefined,
		gravity: ToastGravity.Top,
		position: ToastPosition.Center,
		closeable: false,
		stopOnFocus: true,
		oldestFirst: true,
		onClosed: function () { },
		onClick: function () { },
		offset: { x: 0, y: 0 },
	};

	private static options: Partial<ToasterOptions> = {};

	private static container: ToastContainer;


	public static init(options: Partial<ToasterOptions>) {
		this.options = Object.assign(this.defaults, options);
		this.options.stopOnFocus = options.stopOnFocus === undefined ? true : options.stopOnFocus;

		const initRootElement = () => {
			let rootElement: HTMLElement;

			// Getting the root element to with the toast needs to be added
			if (typeof this.options.selector === "string") {
				rootElement = document.getElementById(this.options.selector);
			}
			else if (this.options.selector instanceof HTMLElement || this.options.selector instanceof ShadowRoot) {
				rootElement = <HTMLElement>this.options.selector;
			}
			else {
				rootElement = document.body;
			}

			this.container = new ToastContainer();
			this.container.position = this.options.position;
			this.container.gravity = this.options.gravity;

			rootElement.appendChild(this.container);
		};

		if (document.readyState === "complete") {
			initRootElement();
		}
		else {
			document.addEventListener('DOMContentLoaded', () => {
				initRootElement();
			});
		}
	}

	public static show(message: string): void {
		this.showToast(message, ToastType.Default);
	}

	public static showInfo(message: string): void {
		this.showToast(message, ToastType.Info);
	}

	public static showSuccess(message: string): void {
		this.showToast(message, ToastType.Success);
	}

	public static showWarning(message: string): void {
		this.showToast(message, ToastType.Warning);
	}

	public static showError(message: string): void {
		this.showToast(message, ToastType.Error);
	}

	public static showToast(message: string, type: ToastType): void {
		// Validating if root element is present in DOM
		if (!this.container) {
			throw "Toast container is not defined";
		}

		// Creating the DOM object for the toast
		const toast = this.buildToast(message, type);

		// Adding the DOM element
		this.container.insertBefore(toast, this.container.firstChild);

		if (this.options.duration > 0) {
			toast.timeOutValue = window.setTimeout(() => {
					// Remove the toast from DOM
					this.removeElement(toast);
				},
				this.options.duration
			);
		}

		setTimeout(() => {
			toast.show = true;
		}, 10);
	}

	private static buildToast(message: string, type: ToastType): Toast {
		if (!this.options) {
			throw "Toaster is not initialized";
		}

		const toast = document.createElement("player-toast") as Toast;
		toast.message = message;
		toast.type = type;
		toast.closeable = this.options.closeable;

		if (this.options.closeable) {
			// Triggering the removal of toast from DOM on close click
			toast.addEventListener("toast-close", (event) => {
					event.stopPropagation();
					this.removeElement(toast);
					window.clearTimeout(toast.timeOutValue);
				}
			);
		}

		// Clear timeout while toast is focused
		if (this.options.stopOnFocus && this.options.duration > 0) {
			// stop countdown
			toast.addEventListener("mouseover", (event) => {
					window.clearTimeout(toast.timeOutValue);
				}
			);
			// add back the timeout
			toast.addEventListener("mouseleave",() => {
					toast.timeOutValue = window.setTimeout(() => {
							// Remove the toast from DOM
							this.removeElement(toast);
						},
						this.options.duration
					)
				}
			);
		}

		if (typeof this.options.onClick === "function") {
			toast.addEventListener("click", (event) => {
					event.stopPropagation();
					this.options.onClick();
				}
			);
		}

		return toast;
	}

	private static removeElement(toastElement: Toast): void {
		// Hiding the element
		toastElement.show = false;

		// Removing the element from DOM after transition end
		window.setTimeout(() => {
				// Remove the element from the DOM, only when the parent node was not removed before.
				if (toastElement.parentNode) {
					toastElement.parentNode.removeChild(toastElement);
				}

				// Calling the closed callback function
				this.options.onClosed.call(toastElement);
			},
			400
		);
	}
}