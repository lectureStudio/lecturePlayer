import { css } from 'lit';

export const playerOfflineStyles = css`
	:host {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: inherit;
	}
	:host > div {
		display: flex;
		flex-direction: column;
		flex: 0 0 auto;
		width: 50%;
		padding-top: 3rem;
	}
	:host > div > strong {
		color: #6c757d;
		padding: 0.5rem 0;
		align-self: center;
	}
	:host > div > svg {
		color: #0d6efd;
		width: 2.5rem;
		height: 2.5rem;
		align-self: center;
	}
	:host > div > hr {
		width: 100%;
		border-width: 1px;
		border: 0;
		border-top: 1px solid #dee2e6;
		margin: 1rem 0;
	}
	:host p {
		margin-top: 0;
		margin-bottom: 1rem;
	}
`;