import { css } from 'lit';

export const streamStatsStyles = css`
	sl-tab::part(base) {
		padding: var(--sl-spacing-x-small);
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

	@media screen and (max-width: 481px) {
		table th,
		table td {
			font-size: .8rem;
		}

		.col-metric {
			padding-right: 6em;
		}
		.col-inbound {
			padding-right: 4em;
		}

		player-tabs::part(nav) {
			border-radius: 20px;
		}
	}
`;