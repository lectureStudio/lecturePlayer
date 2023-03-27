import { css } from 'lit';

export const mediaSettingsStyles = css`
	:host {
		display: flex;
		flex-direction: column;
		gap: 1.0em;
	}
	:host(:not([enabled])) form {
		pointer-events: none;
		opacity: 0.4;
	}
	:host player-loading {
		position: absolute;
		left: 0;
		bottom: 0;
		margin: 0.5em;
		flex-direction: row;
		justify-content: left;
	}
	:host([enabled]) player-loading,
	:host([error]) player-loading {
		display: none;
	}
	:host([error]) #save-button {
		display: none;
	}
`;