export interface SwipeObserverConfig {

	/** Number of pixels or percent of viewport-axis a user must move before swipe fires. Default 20. */
	threshold: number;

	/** Unit of the threshold (can be either 'px', 'vh' or 'vw'). Default 'px'. */
	unit: "px" | "vh" | "vw";

	/** Number of milliseconds from touchstart to touchend. Default 500. */
	timeout: number;

}

/**
 * Observe swipe (left, right, up, down) gestures on DOM elements.
 * 
 * The code is based on 'swiped-events' by John Doherty licensed under the MIT License.
 */
export class SwipeObserver {

	private config: SwipeObserverConfig;
	private xDown: number = null;
	private yDown: number = null;
	private xDiff: number = null;
	private yDiff: number = null;
	private timeDown: number = null;
	private startEl: HTMLElement = null;


	/**
	 * Create a new SwipeObserver for the given element to observe.
	 * 
	 * @param {object} element - the element to observe.
	 */
	constructor(element: HTMLElement, config?: SwipeObserverConfig) {
		this.config = config || {
			threshold: 20,
			timeout: 500,
			unit: "px"
		};

		element.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
		element.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
		element.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
	}

	/**
	 * Fires swiped event if swipe detected on touchend.
	 * 
	 * @param {object} e - browser event object.
	 * 
	 * @returns {void}
	 */
	private handleTouchEnd(e: TouchEvent) {
		// If the user released on a different target, cancel!
		if (this.startEl !== e.target) {
			return;
		}

		const timeDiff = Date.now() - this.timeDown;
		const changedTouches: TouchList | [] = e.changedTouches || e.touches || [];
		let swipeThreshold = this.config.threshold;
		let eventType = '';

		if (this.config.unit === 'vh') {
			// Get percentage of viewport height in pixels.
			swipeThreshold = Math.round((swipeThreshold / 100) * document.documentElement.clientHeight);
		}
		if (this.config.unit === 'vw') {
			// Get percentage of viewport height in pixels.
			swipeThreshold = Math.round((swipeThreshold / 100) * document.documentElement.clientWidth);
		}

		if (Math.abs(this.xDiff) > Math.abs(this.yDiff)) { // most significant
			if (Math.abs(this.xDiff) > swipeThreshold && timeDiff < this.config.timeout) {
				if (this.xDiff > 0) {
					eventType = 'swiped-left';
				}
				else {
					eventType = 'swiped-right';
				}
			}
		}
		else if (Math.abs(this.yDiff) > swipeThreshold && timeDiff < this.config.timeout) {
			if (this.yDiff > 0) {
				eventType = 'swiped-up';
			}
			else {
				eventType = 'swiped-down';
			}
		}

		if (eventType !== '') {
			const eventData = {
				dir: eventType.replace(/swiped-/, ''),
				touchType: 'direct',
				xStart: this.xDown || 10,
				xEnd: (changedTouches[0] || {}).clientX || -1 || 10,
				yStart: this.yDown || 10,
				yEnd: (changedTouches[0] || {}).clientY || -1 || 10
			};

			// Fire `swiped` event event on the element that started the swipe.
			this.startEl.dispatchEvent(new CustomEvent('swiped', { bubbles: true, cancelable: true, detail: eventData }));

			// Fire `swiped-dir` event on the element that started the swipe.
			this.startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: eventData }));
		}

		// Reset values.
		this.xDown = null;
		this.yDown = null;
		this.timeDown = null;
	}

	/**
	 * Records current location on touchstart event.
	 * 
	 * @param {object} e - browser event object.
	 * 
	 * @returns {void}
	 */
	private handleTouchStart(e: TouchEvent) {
		this.startEl = e.target as HTMLElement;

		this.timeDown = Date.now();
		this.xDown = e.touches[0].clientX;
		this.yDown = e.touches[0].clientY;
		this.xDiff = 0;
		this.yDiff = 0;
	}

	/**
	 * Records location diff in px on touchmove event.
	 * 
	 * @param {object} e - browser event object.
	 * 
	 * @returns {void}
	 */
	private handleTouchMove(e: TouchEvent) {
		if (!this.xDown || !this.yDown) {
			return;
		}

		const xUp = e.touches[0].clientX;
		const yUp = e.touches[0].clientY;

		this.xDiff = this.xDown - xUp;
		this.yDiff = this.yDown - yUp;
	}
}