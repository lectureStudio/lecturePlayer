import { html } from 'lit';
import { fixture, expect, elementUpdated } from '@open-wc/testing';

import type { PlayerLoading } from '../../../src/component/loading/player-loading.js';
import '../../../src/component/loading/player-loading.js';

describe('Player Loading', () => {
	let element: PlayerLoading;
	
	beforeEach(async () => {
		element = await fixture(html`<player-loading></player-loading>`);
	});

	it('renders custom text', async () => {
		const text = "Player is loading!";
		element.text = text;

		await elementUpdated(element);

		const span = element.shadowRoot!.querySelector('span')!;

		expect(span).to.exist;
		expect(span.textContent).to.equal(text);
	});
});