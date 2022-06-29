import { css } from 'lit';

export const playerOfflineStyles = css`
	:host {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: inherit;
		justify-content: center;
	}
	:host > strong {
		color: #6c757d;
		padding-top: 0.5rem;
	}
	:host > svg {
		color: #0d6efd;
		width: 2.5rem;
		height: 2.5rem;
	}
`;