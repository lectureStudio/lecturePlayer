const specKeys = {
	fullscreenEnabled: 0,
	fullscreenElement: 1,
	requestFullscreen: 2,
	exitFullscreen: 3,
	fullscreenchange: 4,
	fullscreenerror: 5,
};

const webkit = [
	'webkitFullscreenEnabled',
	'webkitFullscreenElement',
	'webkitRequestFullscreen',
	'webkitExitFullscreen',
	'webkitfullscreenchange',
	'webkitfullscreenerror',
];

const moz = [
	'mozFullScreenEnabled',
	'mozFullScreenElement',
	'mozRequestFullScreen',
	'mozCancelFullScreen',
	'mozfullscreenchange',
	'mozfullscreenerror',
];

const ms = [
	'msFullscreenEnabled',
	'msFullscreenElement',
	'msRequestFullscreen',
	'msExitFullscreen',
	'MSFullscreenChange',
	'MSFullscreenError',
];

const spec = Object.keys(specKeys);
let vendor: string[] | null = null;

for (const v of [spec, webkit, moz, ms]) {
	if (v[specKeys.fullscreenEnabled] in document) {
		vendor = v;
		break;
	}
}

if (vendor != null) {
	let proto: Element | Document = Element.prototype;
	proto.requestFullscreen = (proto as unknown as Indexable)[vendor[specKeys.requestFullscreen]] as (options?: FullscreenOptions) => Promise<void>;

	proto = Document.prototype;
	proto.exitFullscreen = (proto as unknown as Indexable)[vendor[specKeys.exitFullscreen]] as (() => Promise<void>);

	const fullscreenElement = spec[specKeys.fullscreenElement];
	const fullscreenEnabled = spec[specKeys.fullscreenEnabled];

	if (!(fullscreenElement in document)) {
		Object.defineProperty(document, fullscreenElement, {
			get: function () {
				return vendor ? (document as unknown as Indexable)[vendor[specKeys.fullscreenElement]] : undefined;
			}
		});
		Object.defineProperty(document, fullscreenEnabled, {
			get: function () {
				return vendor ? (document as unknown as Indexable)[vendor[specKeys.fullscreenEnabled]] : undefined;
			}
		});
	}

	if (spec !== vendor) {
		const proxyListener = (event: Event) => {
			const actionType = event.type.replace(/^(webkit|moz|MS)/, '').toLowerCase();
			let newEvent;

			if (typeof (Event) === 'function') {
				newEvent = new Event(actionType, event);
			}
			else {
				newEvent = document.createEvent('Event');
				newEvent.initEvent(actionType, event.bubbles, event.cancelable);
			}

			event.target?.dispatchEvent(newEvent);
		};

		document.addEventListener(vendor[specKeys.fullscreenchange], proxyListener);
		document.addEventListener(vendor[specKeys.fullscreenerror], proxyListener);
	}
}

export { }