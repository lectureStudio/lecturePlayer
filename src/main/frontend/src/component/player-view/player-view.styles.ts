import { css } from 'lit';

export const playerViewStyles = css`
	:host {
		display: flex;
		flex-direction: row !important;
		background-color: rgb(248, 249, 250);
		width: 100%;
		height: 100%;
	}
	:host .center-container {
		display: flex;
		flex-direction: column !important;
		width: 100%;
		height: 100%;
		order: 2 !important;
	}
	:host .slide-container {
		display: flex;
		flex-direction: row !important;
		width: 100%;
		height: 100%;
	}
	:host .controls-container {
		display: flex;
		align-items: flex-end !important;
		width: 100%;
	}
	:host slide-view {
		display: flex;
		width: 100%;
		height: 100%;
		flex-grow: 1;
	}
	:host .feed-container {
		display: flex;
		flex-grow: 0;
		flex-direction: column !important;
	}
	:host .right-container {
		display: flex;
		flex-direction: column !important;
		background-color: white;
	}
	:host .video-feed-container {
		display: flex;
		flex-direction: row !important;
		order: 1 !important;
	}
	:host .feed-container video {
		border: 2px solid #94A3B8;
		max-width: 15em;
	}

	:host .chat-container {
		display: none !important;
		flex-direction: row !important;
		margin-top: auto !important;
		order: 6 !important;
	}
	:host .chat-container > * {
		min-width: 15em;
	}
	:host(:not([chatVisible])) chat-box {
		display: none;
	}


	@media (min-width: 576px) {
		:host .center-container {
			order: 0 !important;
		}
		:host .chat-container {
			display: block !important;
			order: 6 !important;
		}
	}
	@media (min-width: 768px) {
		.flex-md-column {
			flex-direction: column !important;
		}
		.order-md-0 {
			order: 0 !important;
		}
		.order-md-2 {
			order: 2 !important;
		}
	}
`;