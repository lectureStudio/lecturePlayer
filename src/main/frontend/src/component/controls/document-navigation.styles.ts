import { css } from 'lit';

export const documentNavigationStyles = css`
	:host {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1em;
		padding: 0.15em 0;
	}

	.document-toolbar-button {
		font-size: 1.5rem;
		padding: 0.15em;
	}
	.document-toolbar-button::part(base) {
		padding: 0;
	}

	.tool-button-active {
		background: var(--sl-color-neutral-300);
		border-radius: var(--sl-border-radius-small);
	}

	sl-divider {
		height: 1.25rem;
	}
`;