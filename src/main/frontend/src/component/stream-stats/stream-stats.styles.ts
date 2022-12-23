import { css } from 'lit';

export const streamStatsStyles = css`
	:host article {
		padding: 1em;
	}

	player-tabs::part(nav) {
		background: #F3F4F699;
		border: 0;
		border-radius: 99px;
		padding: 0.25rem;
		margin-bottom: 0.5em;
	}
	player-tabs p[slot="tab"] {
		border: 0;
		border-radius: 99px;
		padding: 0.25em;
		margin: 0;
	}
	player-tabs p[slot="tab"][selected] {
		background: #e6eef9;
		color: #185ee0;
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