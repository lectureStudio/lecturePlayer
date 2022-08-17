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
		padding: 0;
		margin: 0;
		align-items: center;
	}
	:host::before {
		position: absolute;
		content: '';
		z-index: -1;
	}
	:host .invisible {
		display: none;
	}
	:host button {
		display: flex;
		align-items: center;
		justify-content: center;
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
		font-size: 1.65em;
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
	:host #quiz-button {
		color: #15803D;
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
		display: none;
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

	:host([fullscreen]) .icon-fullscreen,
	:not([fullscreen]) .icon-fullscreen-exit {
		display: none;
	}
	:host([fullscreen]) .icon-fullscreen-exit,
	:not([fullscreen]) .icon-fullscreen {
		display: initial;
	}

	:host(:not([hasChat])) #chat-button,
	:host(:not([hasParticipants])) #participants-button {
		display: none;
	}
	:host([chatVisible]) #chat-button,
	:host([participantsVisible]) #participants-button {
		color: #007db5;
	}

	:host([hasQuiz]) #quiz-button {
		animation: button-pulse 2s 5;
	}
	:host(:not([hasQuiz])) #quiz-button {
		display: none;
	}

	:host([handUp]) #hand-button {
		background: rgba(21, 128, 61, 0.2);
		color: #166534;
	}

	#volumeIndicator > span {
		display: none;
	}
	:host([volumeState="0"]) #volumeIndicator span:nth-child(1),
	:host([volumeState="1"]) #volumeIndicator span:nth-child(2),
	:host([volumeState="2"]) #volumeIndicator span:nth-child(3),
	:host([volumeState="3"]) #volumeIndicator span:nth-child(4),
	:host([volumeState="4"]) #volumeIndicator span:nth-child(5) {
		display: inherit;
	}


	@keyframes button-pulse {
		0% {
			background: rgba(21, 128, 61, 0);
		}
		50% {
			background: rgba(21, 128, 61, 0.2);
			color: #166534;
		}
		100% {
			background: rgba(21, 128, 61, 0.0);
		}
	}

	@media (min-width: 576px) {
		:host #volumeSlider {
			display: block;
		}
	}
`;