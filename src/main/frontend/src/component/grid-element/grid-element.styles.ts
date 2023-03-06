import { css } from 'lit';

export const gridElementStyles = css`
	:host {
		height: 100%;
		width: 100%;
	}

	:host .inner-container {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		width: 100%;
		height: 100%;
	}

	:host(:not([isVisible])) {
		display: none;
	}

	:host([isTalking]) {
		border: 3px solid rgb(60, 217, 60);
	}
`;