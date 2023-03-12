import { css } from 'lit';

export const playerViewStyles = css`
	:host {
		display: flex;
		flex-direction: row;
		background-color: rgb(248, 249, 250);
		width: 100%;
		height: 100%;
	}

	sl-split-panel {
		width: 100%;
		height: 100%;
	}
	:host #outer-split-panel {
		--min: 350px;
		--max: 550px;
	}
	:host #inner-split-panel {
		--min: calc(100% - 350px);
		--max: calc(100% - 300px);
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
		position: relative;
		height: 100%;
		margin: 5px;
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
		width: 20%
	}
	:host .feature-container {
		display: none;
		flex-direction: row;
		margin-top: auto;
		order: 6;
		height: 100%;
	}
	:host .left-top {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1em;
	}
	:host .left-top > span {
		padding-bottom: 0.5em;
	}
	:host .controls {
		padding: 1em;
	}
	:host .controls {
		padding: 1em;
	}
	:host .controls form > * {
		padding-bottom: 0.5em;
	}

	:host(:not([rightContainerVisible])) #inner-split-panel {
		--min: 100;
	}
	:host(:not([rightContainerVisible])) #inner-split-panel::part(divider),
	:host(:not([rightContainerVisible])) .right-container {
		display: none;
	}
	:host(:not([participantsVisible])) #outer-split-panel {
		--min: 0;
	}
	:host(:not([participantsVisible])) #outer-split-panel::part(divider),
	:host(:not([participantsVisible])) .left-container {
		display: none;
	}
	:host([screenVisible]) slide-view {
		display: none !important;
	}

	.selected-node {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		padding: 1em;
		font-size: var(--sl-input-label-font-size-small);
	}
	.selected-node sl-button {
		width: fit-content;
	}

	#network-panel {
		width: 100%;
		height: 100%;
		border: 1px solid lightgray;
	}

	@media (min-width: 576px) {
		:host > div {
			flex-direction: row;
		}
		:host .center-container {
			order: 0;
			flex-basis: initial;
		}
		:host .video-feeds {
			order: 2;
		}
		:host .feature-container {
			order: 6;
			display: block;
		}
	}
	@media (max-width: 575px) {
		:host .center-container,
		:host .right-container {
			flex-basis: initial !important;
		}
		:host .left-container {
			display: none;
		}
		.gutter {
			display: none;
		}
	}
`;