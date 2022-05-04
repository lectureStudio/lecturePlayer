/**
 * Took parts of code from:
 *    Toastify js 1.11.2
 *    https://github.com/apvarun/toastify-js
 *    license: MIT licensed
 *    Copyright (C) 2018 Varun A P
 */

import { Toast, ToastGravity, ToastPosition, ToastType } from "../component/toast/toast";

interface offset {
	[pos: string]: number;
};

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

	private static rootElement: HTMLElement;


	public static init(options: Partial<ToasterOptions>) {
		this.options = Object.assign(this.defaults, options);

		this.options.stopOnFocus = options.stopOnFocus === undefined ? true : options.stopOnFocus;

		// Getting the root element to with the toast needs to be added
		if (typeof this.options.selector === "string") {
			this.rootElement = document.getElementById(this.options.selector);
		}
		else if (this.options.selector instanceof HTMLElement || this.options.selector instanceof ShadowRoot) {
			this.rootElement = <HTMLElement> this.options.selector;
		}
		else {
			this.rootElement = document.body;
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
		if (!this.rootElement) {
			throw "Root element is not defined";
		}

		// Creating the DOM object for the toast
		const toast = this.buildToast(message, type);

		// Adding the DOM element
		this.rootElement.insertBefore(toast, this.rootElement.firstChild);

		setTimeout(() => {
			// Repositioning the toasts in case multiple toasts are present
			this.reposition();
		}, 10);

		if (this.options.duration > 0) {
			toast.timeOutValue = window.setTimeout(() => {
					// Remove the toast from DOM
					this.removeElement(toast);
				},
				this.options.duration
			);
		}
	}

	private static buildToast(message: string, type: ToastType): Toast {
		if (!this.options) {
			throw "Toaster is not initialized";
		}

		const toast = new Toast(message);
		toast.show = true;
		toast.closeable = this.options.closeable;
		toast.position = this.options.position;
		toast.gravity = this.options.gravity;
		toast.type = type;

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

		// Adding offset
		if (typeof this.options.offset === "object") {
			const x = this.getAxisOffsetAValue("x", this.options);
			const y = this.getAxisOffsetAValue("y", this.options);

			const xOffset = this.options.position == ToastPosition.Left ? x : `-${x}`;
			const yOffset = this.options.gravity == ToastGravity.Top ? y : `-${y}`;

			toast.style.transform = `translate(${xOffset},${yOffset})`;
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

				// Repositioning the toasts again
				this.reposition();
			},
			400
		);
	}

	private static reposition(): void {
		// Top margins with gravity
		let topLeftOffsetSize: offset = {
			top: 15,
			bottom: 15,
		};
		let topRightOffsetSize: offset = {
			top: 15,
			bottom: 15,
		};
		let offsetSize: offset = {
			top: 15,
			bottom: 15,
		};

		// Get all toast messages that have been added to the container (selector)
		let allToasts = <Toast[]><any> this.rootElement.querySelectorAll("player-toast");

		let classUsed: string;

		// Modifying the position of each toast element
		for (let i = 0; i < allToasts.length; i++) {
			// Getting the applied gravity
			if (allToasts[i].gravity === ToastGravity.Top) {
				classUsed = "top";
			}
			else {
				classUsed = "bottom";
			}

			const height = allToasts[i].offsetHeight;

			// Spacing between toasts
			const offset = 15;

			let width = window.innerWidth > 0 ? window.innerWidth : screen.width;

			// Show toast in center if screen with less than or equal to 360px
			if (width <= 360) {
				// Setting the position
				allToasts[i].style.setProperty(classUsed, `${offsetSize[classUsed]}px`);

				offsetSize[classUsed] += height + offset;
			}
			else {
				if (allToasts[i].position === ToastPosition.Left) {
					// Setting the position
					allToasts[i].style.setProperty(classUsed, `${topLeftOffsetSize[classUsed]}px`);

					topLeftOffsetSize[classUsed] += height + offset;
				}
				else {
					// Setting the position
					allToasts[i].style.setProperty(classUsed, `${topRightOffsetSize[classUsed]}px`);

					topRightOffsetSize[classUsed] += height + offset;
				}
			}
		}
	}

	private static getAxisOffsetAValue(axis: string, options: any): string {
		if (options.offset[axis]) {
			if (isNaN(options.offset[axis])) {
				return options.offset[axis];
			}
			else {
				return `${options.offset[axis]}px`;
			}
		}

		return '0px';
	}
}