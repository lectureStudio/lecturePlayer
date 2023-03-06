import { css } from 'lit';

export const gridElementStyles = css`
	:host {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		width: 100%;
		height: 100%;
	}

	:host participant-view::part(base) {
		height: inherit;
		padding: 0;
	}

	:host(:not([isVisible])) {
		display: none;
	}

	:host([isTalking]) participant-view {
		border: 2px solid rgb(60, 217, 60);
	}
`;