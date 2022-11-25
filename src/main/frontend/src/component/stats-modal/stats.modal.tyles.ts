import { css } from 'lit';

export const statsModalStyles = css`
	:host article {
		padding: 1em;
	}

	.col-metric {
		padding-right: 8em;
	}
	.col-inbound {
		padding-right: 5em;
	}

	.codec::first-letter {
		text-transform:capitalize;
	}
`;