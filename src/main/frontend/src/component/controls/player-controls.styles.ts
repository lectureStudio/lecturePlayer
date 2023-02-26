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
	:host([mutedMic]) .icon-mic,
	:not([mutedMic]) .icon-mic-muted {
		display: none;
	}
	:host([mutedMic]) .icon-mic-muted,
	:not([mutedMic]) .icon-mic {
		display: initial;
	}
	:host([mutedMic]) .icon-mic-muted {
		color: #DC2626;
	}
	:host([mutedCam]) .icon-cam,
	:not([mutedCam]) .icon-cam-muted {
		display: none;
	}
	:host([mutedCam]) .icon-cam-muted,
	:not([mutedCam]) .icon-cam {
		display: initial;
	}
	:host([mutedCam]) .icon-cam-muted {
		color: #DC2626;
	}
	:host([handUp]) #hand-button {
		background: rgba(21, 128, 61, 0.2);
		color: #166534;
	}
	:host(:not([isConference])) .conference-control {
		display: none;
	}


	media-device-button {
		margin-right: 0.75em;
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
`;