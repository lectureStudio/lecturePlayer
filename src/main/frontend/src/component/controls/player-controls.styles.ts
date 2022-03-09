import { css } from 'lit';

export const playerControlsStyles = css`
	:host {
		--seek-before-width: 0%;
		--volume-before-width: 100%;
		--buffered-width: 0%;
		width: 100%;
		position: relative;
		display: flex;
		flex-direction: row;
		background-color: rgba(233, 236, 239, 0.8);
		border-radius: 0.333em;
		padding: 0;
		margin: 0;
		align-items: center;
	}
	:host::before {
		position: absolute;
		content: '';
		z-index: -1;
	}
	:host path {
		stroke: #007db5;
	}
	:host .svg-icon > * {
		stroke-width: 0.1;
	}
	:host button {
		padding: 0;
		border: 0;
		background: transparent;
		border-radius: 0.333em;
		cursor: pointer;
		outline: none;
		min-width: 40px;
		width: 40px;
		min-height: 40px;
		height: 40px;
		font-size: 1.25em;
	}
	:host button:hover {
		color: rgba(0, 125, 181, 1);
		background-color: rgba(222, 226, 230, 0.9);
	}
	:host button.selected {
		background-color: rgba(0, 125, 181, 1);
	}
	:host button.selected:hover {
		background-color: rgba(0, 125, 181, 0.8);
	}
	:host button.active {
		color: rgba(0, 125, 181, 1);
	}
	:host button.active:hover {
		color: rgba(0, 125, 181, 0.8);
	}
	:host button.selected path {
		color: #F9FAFB;
		stroke: #F9FAFB;
	}
	:host #raiseHandButton button.active {
		background-color: rgba(25, 135, 84, 1);
	}
	:host #raiseHandButton button.active:hover {
		background-color: rgba(255, 193, 7, 1);
	}
	:host #raiseHandButton button.active path {
		stroke: #F9FAFB;
	}
	:host button svg {
		width: 23px;
		height: 23px;
		vertical-align: text-bottom;
	}
	:host #settingsButton path {
		stroke: #212529;
	}
	:host #playMediaButton {
		background-color: #FECACA;
	}
	:host #playMediaButton:hover {
		background-color: #FEE2E2;
	}
	:host #showQuizButton {
		color: #15803D;
	}
	:host .pulse {
		--animation-color: #15803D;
		animation: button-pulse 2s 5;
		z-index: 10;
	}
	:host .pulse-infinite {
		--animation-color: #007db5;
		animation: button-pulse 2s infinite;
		z-index: 10;
	}

	:host .col {
		flex: 1;
		display: flex;
		align-items: center;
	}
	:host .nav-left {
		flex: 1;
		justify-content: flex-start;
	}
	:host .nav-center {
		flex: 1;
		justify-content: center;
	}
	:host .nav-right {
		flex: 1;
		justify-content: flex-end;
	}

	:host #volumeSlider {
		margin: 10px 2.5%;
		width: 150px;
	}
	:host #volumeSlider::-webkit-slider-runnable-track {
		background: rgba(0, 125, 181, 0.6);
	}
	:host #volumeSlider::-moz-range-track {
		background: rgba(0, 125, 181, 0.6);
	}
	:host #volumeSlider::-ms-fill-upper {
		background: rgba(0, 125, 181, 0.6);
	}
	:host #volumeSlider::before {
		width: var(--volume-before-width);
	}
	:host #volumeIndicator {
		margin: 0 0;
	}
	:host input[type="range"] {
		position: relative;
		-webkit-appearance: none;
		width: 48%;
		margin: 0;
		padding: 0;
		height: 19px;
		margin: 30px 2.5% 20px 2.5%;
		float: left;
		outline: none;
		background: transparent;
	}
	:host input[type="range"]::-webkit-slider-runnable-track {
		width: 100%;
		height: 3px;
		cursor: pointer;
		background: linear-gradient(to right, rgba(0, 125, 181, 0.6) var(--buffered-width), rgba(0, 125, 181, 0.2) var(--buffered-width));
	}
	:host input[type="range"]::before {
		position: absolute;
		content: "";
		top: 8px;
		left: 0;
		width: var(--seek-before-width);
		height: 3px;
		background-color: #007db5;
		cursor: pointer;
	}
	:host input[type="range"]::-webkit-slider-thumb {
		position: relative;
		-webkit-appearance: none;
		box-sizing: content-box;
		border: 1px solid #007db5;
		height: 15px;
		width: 15px;
		border-radius: 50%;
		background-color: #fff;
		cursor: pointer;
		margin: -7px 0 0 0;
	}
	:host input[type="range"]:active::-webkit-slider-thumb {
		transform: scale(1.2);
		background: #007db5;
	}
	:host input[type="range"]::-moz-range-track {
		width: 100%;
		height: 3px;
		cursor: pointer;
		background: linear-gradient(to right, rgba(0, 125, 181, 0.6) var(--buffered-width), rgba(0, 125, 181, 0.2) var(--buffered-width));
	}
	:host input[type="range"]::-moz-range-progress {
		background-color: #007db5;
	}
	:host input[type="range"]::-moz-focus-outer {
		border: 0;
	}
	:host input[type="range"]::-moz-range-thumb {
		box-sizing: content-box;
		border: 1px solid #007db5;
		height: 15px;
		width: 15px;
		border-radius: 50%;
		background-color: #fff;
		cursor: pointer;
	}
	:host input[type="range"]:active::-moz-range-thumb {
		transform: scale(1.2);
		background: #007db5;
	}
	:host input[type="range"]::-ms-track {
		width: 100%;
		height: 3px;
		cursor: pointer;
		background: transparent;
		border: solid transparent;
		color: transparent;
	}
	:host input[type="range"]::-ms-fill-lower {
		background-color: #007db5;
	}
	:host input[type="range"]::-ms-fill-upper {
		background: linear-gradient(to right, rgba(0, 125, 181, 0.6) var(--buffered-width), rgba(0, 125, 181, 0.2) var(--buffered-width));
	}
	:host input[type="range"]::-ms-thumb {
		box-sizing: content-box;
		border: 1px solid #007db5;
		height: 15px;
		width: 15px;
		border-radius: 50%;
		background-color: #fff;
		cursor: pointer;
	}
	:host input[type="range"]:active::-ms-thumb {
		transform: scale(1.2);
		background: #007db5;
	}

	:host .hidden {
		display: none;
	}

	:host([fullscreen]) .fullscreen,
	:not([fullscreen]) .fullscreen-exit {
		display: none;
	}
	:host([fullscreen]) .fullscreen-exit,
	:not([fullscreen]) .fullscreen {
		display: initial;
	}


	@-webkit-keyframes button-pulse {
		0% {
			-webkit-box-shadow: 0 0 0 0 var(--animation-color);
		}
		70% {
			-webkit-box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
		}
		100% {
			-webkit-box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
		}
	}
	@keyframes button-pulse {
		0% {
			-moz-box-shadow: 0 0 0 0 var(--animation-color);
			box-shadow: 0 0 0 0 var(--animation-color);
		}
		70% {
			-moz-box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
			box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
		}
		100% {
			-moz-box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
		}
	}
`;