import { css } from 'lit';

export const participantStyles = css`
	:host {
		display: flex;
		align-items: flex-start;
		column-gap: 0.5em;
	}

	sl-avatar {
		--size: 1.75em;
		display: flex;
		align-items: center;
	}

	participant-type {
		align-self: center;
	}

	[class^="icon-"],
	[class*=" icon-"] {
		font-size: 1.5em;
		margin-left: auto;
	}
`;