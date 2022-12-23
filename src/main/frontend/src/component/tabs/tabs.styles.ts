import { css } from 'lit';

export const playerTabsStyles = css`
	nav {
		display: flex;
		flex-wrap: wrap;
	}
	nav > ::slotted([slot="tab"]) {
		cursor: pointer;
		padding: 1rem 2rem;
		flex: 1 1 auto;
		color: var(--color-darkGrey);
		border-bottom: 2px solid lightgrey;
		text-align: center;
	}
	nav > ::slotted([slot="tab"][selected]) {
		border-color: black;
		color: #185ee0;
	}
	::slotted([slot="panel"]) {
		display: none;
	}
	::slotted([slot="panel"][selected]) {
		display: block;
	}
`;