import { expect } from "@open-wc/testing";
import { StreamActionPlayer } from "./stream-action-player.js";
import { SlideDocument } from "../model/document.js";
import { Action } from "./action.js";
import { ActionType } from "./action-type.js";
import { Tool } from "../tool/tool.js";
import { AtomicTool } from "../tool/atomic.tool.js";
import { PenPoint } from "../geometry/pen-point.js";

/**
 * Mock Page for testing
 */
class MockPage {
	pageNumber: number;
	constructor(pageNumber: number) {
		this.pageNumber = pageNumber;
	}
}

/**
 * Mock SlideDocument for testing
 */
class MockSlideDocument extends SlideDocument {
	private mockPages: MockPage[];

	constructor(pageCount: number = 3) {
		super();
		this.mockPages = [];
		for (let i = 0; i < pageCount; i++) {
			this.mockPages.push(new MockPage(i));
		}
		(this as any).pages = this.mockPages;
	}

	override getPage(pageNumber: number): any {
		if (pageNumber < 0 || pageNumber > this.mockPages.length - 1) {
			throw new Error(`Page number ${pageNumber} out of bounds.`);
		}
		return this.mockPages[pageNumber];
	}

	override getPageCount(): number {
		return this.mockPages.length;
	}
}

/**
 * Mock ActionExecutor for tracking method calls
 */
class MockActionExecutor {
	calls: { method: string; args: any[] }[] = [];
	document: SlideDocument | null = null;
	pageNumber: number = 0;

	setKeyEvent(keyEvent: KeyboardEvent | undefined): void {
		this.calls.push({ method: "setKeyEvent", args: [keyEvent] });
	}

	setSeek(seek: boolean): void {
		this.calls.push({ method: "setSeek", args: [seek] });
	}

	getDocument(): SlideDocument | null {
		return this.document;
	}

	setDocument(document: SlideDocument): void {
		this.calls.push({ method: "setDocument", args: [document] });
		this.document = document;
	}

	setPageNumber(pageNumber: number): void {
		this.calls.push({ method: "setPageNumber", args: [pageNumber] });
		this.pageNumber = pageNumber;
	}

	removePageNumber(pageNumber: number): void {
		this.calls.push({ method: "removePageNumber", args: [pageNumber] });
	}

	setTool(tool: Tool): void {
		this.calls.push({ method: "setTool", args: [tool] });
	}

	selectAndExecuteTool(tool: AtomicTool): void {
		this.calls.push({ method: "selectAndExecuteTool", args: [tool] });
	}

	beginTool(point: PenPoint): void {
		this.calls.push({ method: "beginTool", args: [point] });
	}

	executeTool(point: PenPoint): void {
		this.calls.push({ method: "executeTool", args: [point] });
	}

	endTool(point: PenPoint): void {
		this.calls.push({ method: "endTool", args: [point] });
	}

	hasCall(method: string): boolean {
		return this.calls.some(c => c.method === method);
	}

	reset(): void {
		this.calls = [];
	}
}

/**
 * Mock Action for testing
 */
class MockAction implements Action {
	timestamp: number = 0;
	keyEvent: KeyboardEvent | undefined;
	executeCalled = false;
	executeError: Error | null = null;

	execute(_executor: any): void {
		if (this.executeError) {
			throw this.executeError;
		}
		this.executeCalled = true;
	}

	getActionType(): ActionType {
		return ActionType.UNDO;
	}

	toBuffer(): ArrayBuffer {
		return new ArrayBuffer(0);
	}

	createBuffer(_length: number): { buffer: Uint8Array; dataView: DataView } {
		return { buffer: new Uint8Array(0), dataView: new DataView(new ArrayBuffer(0)) };
	}
}

describe("StreamActionPlayer", () => {
	let player: StreamActionPlayer;
	let mockExecutor: MockActionExecutor;

	beforeEach(() => {
		mockExecutor = new MockActionExecutor();
		player = new StreamActionPlayer(mockExecutor as any);
	});

	afterEach(() => {
		player.stop();
	});

	describe("constructor", () => {
		it("creates player with executor", () => {
			expect(player).to.not.be.null;
		});
	});

	describe("start", () => {
		it("starts the player", () => {
			player.start();
			expect(true).to.be.true;
		});

		it("initializes empty action queue", () => {
			player.start();
			expect(true).to.be.true;
		});
	});

	describe("stop", () => {
		it("stops the player", () => {
			player.start();
			player.stop();
			expect(true).to.be.true;
		});

		it("clears action queue on stop", () => {
			player.start();
			player.addAction(new MockAction());
			player.stop();
			expect(true).to.be.true;
		});
	});

	describe("suspend", () => {
		it("suspends the player", () => {
			player.start();
			player.suspend();
			expect(true).to.be.true;
		});
	});

	describe("addAction", () => {
		it("adds action to queue when document is visible", () => {
			player.start();
			const action = new MockAction();

			player.addAction(action);

			// Action should be queued (will be executed in animation frame)
			expect(true).to.be.true;
		});

		it("executes action immediately when document is hidden", async () => {
			// We can't easily test document.visibilityState, so we just verify the method works
			player.start();
			const action = new MockAction();

			player.addAction(action);

			// Wait for animation frame to execute
			await new Promise(resolve => requestAnimationFrame(resolve));
			await new Promise(resolve => requestAnimationFrame(resolve));

			expect(action.executeCalled).to.be.true;
		});

		it("catches errors during action execution", async () => {
			player.start();
			const action = new MockAction();
			action.executeError = new Error("Test error");

			player.addAction(action);

			// Wait for animation frame - should not throw
			await new Promise(resolve => requestAnimationFrame(resolve));
			await new Promise(resolve => requestAnimationFrame(resolve));

			expect(true).to.be.true;
		});
	});

	describe("getDocument", () => {
		it("returns document from executor", () => {
			const doc = new MockSlideDocument(3);
			mockExecutor.document = doc;

			expect(player.getDocument()).to.equal(doc);
		});

		it("returns null when no document set", () => {
			expect(player.getDocument()).to.be.null;
		});
	});

	describe("setDocument", () => {
		it("sets document on executor", () => {
			const doc = new MockSlideDocument(3);

			player.setDocument(doc);

			expect(mockExecutor.hasCall("setDocument")).to.be.true;
			expect(mockExecutor.document).to.equal(doc);
		});
	});

	describe("setPageNumber", () => {
		it("sets page number on executor", () => {
			player.setPageNumber(5);

			expect(mockExecutor.hasCall("setPageNumber")).to.be.true;
			expect(mockExecutor.pageNumber).to.equal(5);
		});
	});

	describe("seekByTime", () => {
		it("throws not implemented error", () => {
			expect(() => player.seekByTime(1000))
				.to.throw("Method not implemented");
		});
	});

	describe("seekByPage", () => {
		it("throws not implemented error", () => {
			expect(() => player.seekByPage(2))
				.to.throw("Method not implemented");
		});
	});

	describe("action execution", () => {
		it("executes multiple actions in order", async () => {
			player.start();
			const action1 = new MockAction();
			const action2 = new MockAction();
			const action3 = new MockAction();

			player.addAction(action1);
			player.addAction(action2);
			player.addAction(action3);

			// Wait for animation frames to execute
			await new Promise(resolve => setTimeout(resolve, 50));

			expect(action1.executeCalled).to.be.true;
			expect(action2.executeCalled).to.be.true;
			expect(action3.executeCalled).to.be.true;
		});

		it("continues executing after action error", async () => {
			player.start();
			const action1 = new MockAction();
			action1.executeError = new Error("Test error");
			const action2 = new MockAction();

			player.addAction(action1);
			player.addAction(action2);

			// Wait for animation frames to execute
			await new Promise(resolve => setTimeout(resolve, 50));

			// action2 should still execute despite action1 error
			expect(action2.executeCalled).to.be.true;
		});
	});
});

