import { css } from 'lit';

export const settingsModalStyles = css`
	:host(:not([enabled])) article {
		pointer-events: none;
		opacity: 0.4;
	}
	:host([enabled]) player-loading,
	:host([error]) player-loading {
		display: none;
	}
	:host([error]) #save-button {
		display: none;
	}
	:host player-loading {
		width: 100%;
		flex-direction: row;
		justify-content: left;
	}
`;