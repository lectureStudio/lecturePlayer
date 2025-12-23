import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";

describe("ApplicationContext", () => {
	let context: ApplicationContext;
	let host: LecturePlayer;

	beforeEach(async () => {
		host = await fixture(html`<lecture-player></lecture-player>`);

		context = {
			host,
			eventEmitter: new EventEmitter(),
			chatService: new ChatService(),
			moderationService: new ModerationService()
		};
	});

	describe("properties", () => {
		it("has host property", () => {
			expect(context.host).to.equal(host);
		});

		it("has eventEmitter property", () => {
			expect(context.eventEmitter).to.be.instanceOf(EventEmitter);
		});

		it("has chatService property", () => {
			expect(context.chatService).to.be.instanceOf(ChatService);
		});

		it("has moderationService property", () => {
			expect(context.moderationService).to.be.instanceOf(ModerationService);
		});
	});
});

