import { css } from 'lit';

export const playerViewStyles = css`
	:host {
		display: flex;
		flex-direction: column;
		background-color: rgb(248, 249, 250);
		width: 100%;
		height: 100%;
	}
	:host > div {
		display: flex;
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
	:host .left-container,
	:host .right-container {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		background-color: white;
	}
	:host .video-feeds {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 0.25em;
		order: 1;
	}
	:host .video-feeds > * {
		max-width: 250px;
	}
	:host .feature-container {
		display: none;
		flex-direction: row;
		margin-top: auto;
		order: 6;
		height: 100%;
	}
	:host chat-box {
		height: 100%;
	}
	:host participant-box {
		height: 100%;
	}
	:host(:not([chatVisible])) chat-box {
		display: none;
	}
	:host(:not([participantsVisible])) .left-container {
		display: none;
	}


	@media (min-width: 576px) {
		:host {
			flex-direction: row;
		}
		:host .center-container {
			order: 0;
		}
		:host .video-feeds {
			order: 2;
		}
		:host .feature-container {
			order: 6;
			display: block;
		}
	}
`;