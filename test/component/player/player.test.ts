import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import type { LecturePlayer } from '../../../src/component/player/player.js';
import '../../../src/component/player/player.js';

describe('Lecture Player', () => {
	let element: LecturePlayer;

	beforeEach(async () => {
		element = await fixture(html`<lecture-player></lecture-player>`);
	});

	it('can override courseId via attribute', async () => {
		const courseId = 77;
		const element = await fixture<LecturePlayer>(
			html`<lecture-player courseId="${courseId}"></lecture-player>`,
		);

		expect(element.courseId).to.equal(courseId);
	});
});