import { css } from 'lit';

export const participantBoxStyles = css`
	:host {
		display: flex;
		flex-direction: column;
	}
	header {
		align-self: center;
		font-weight: 600;
		padding: 0.25em;
		line-height: 1.2;
	}
	section {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow-y: hidden;
		align-items: stretch;
	}

	.participants {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
	}
	.participant-log {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		overflow-y: auto;
		height: 100px;
	}
	.participant-log > * {
		cursor: default;
		padding: 0.15em 0.5em;
	}
	.participant-log > *:hover {
		background-color: #F1F5F9;
	}
	.participant {
		display: flex;
		align-items: end;
	}

	[class^="icon-"],
	[class*=" icon-"] {
		font-size: 1.4em;
		margin-left: auto;
	}
`;