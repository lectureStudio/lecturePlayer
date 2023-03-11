import { css } from 'lit';

export const documentNavigationStyles = css`
	:host {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1em;
	}

	.document-navigation-button {
		font-size: 2rem;
	}
	.document-navigation-button::part(base) {
		padding: 0;
	}
`;