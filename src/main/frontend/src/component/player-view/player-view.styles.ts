import { css } from 'lit';

export const playerViewStyles = css`
	:host {
		display: flex;
		flex-direction: row;
		background-color: rgb(248, 249, 250);
		width: 100%;
		height: 100%;
	}
	:host .center-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		order: 2;
	}
	:host .slide-container {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		margin: 5px;
	}
	:host .controls-container {
		display: flex;
		align-items: flex-end;
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
		flex-direction: column;
	}
	:host .right-container {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		background-color: white;
		width: 15em;
		max-width: 15em;
	}
	:host .video-feeds {
		display: flex;
		flex-direction: column;
		order: 1;
	}

	:host .chat-container {
		display: none;
		flex-direction: row;
		margin-top: auto;
		order: 6;
	}
	:host(:not([chatVisible])) chat-box {
		display: none;
	}


	@media (min-width: 576px) {
		:host .center-container {
			order: 0;
		}
		:host .chat-container {
			display: block;
			order: 6;
		}
	}
	@media (min-width: 768px) {
		.flex-md-column {
			flex-direction: column;
		}
		.order-md-0 {
			order: 0;
		}
		.order-md-2 {
			order: 2;
		}
	}
`;