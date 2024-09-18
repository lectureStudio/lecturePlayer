import { ActionExecutor } from "./action-executor";
import { Tool } from "../tool/tool";
import { ToolContext } from "../tool/tool-context";
import { SlideDocument } from "../model/document";
import { PenPoint } from "../geometry/pen-point";
import { AtomicTool } from "../tool/atomic.tool";
import { RenderController } from "../controller/render.controller";
import { documentStore } from "../store/document.store";

export class StreamActionExecutor implements ActionExecutor {

	private readonly renderController: RenderController;

	private readonly toolContext: ToolContext;

	private document: SlideDocument | null = null;

	private tool: Tool | null = null;

	private previousTool: Tool | null = null;


	constructor(renderController: RenderController) {
		this.renderController = renderController;
		this.toolContext = new ToolContext(renderController);
	}

	setKeyEvent(keyEvent: KeyboardEvent): void {
		this.toolContext.keyEvent = keyEvent;
	}

	setSeek(seek: boolean): void {
		this.renderController.setSeek(seek);
	}

	getDocument(): SlideDocument | null {
		return this.document;
	}

	setDocument(document: SlideDocument) {
		this.document = document;
	}

	setPageNumber(pageNumber: number) {
		if (!this.document) {
			throw new Error("Document must not be null");
		}

		const page = this.document.getPage(pageNumber);

		this.toolContext.page = page;
		this.renderController.setPage(page);

		documentStore.setSelectedPage(page);
		documentStore.setSelectedPageNumber(pageNumber);
	}

	removePageNumber(pageNumber: number): void {
		if (!this.document) {
			throw new Error("Document must not be null");
		}

		this.document.deletePage(pageNumber);
	}

	setTool(tool: Tool): void {
		if (!tool) {
			throw new Error("Tool must not be null");
		}
		if (!this.tool && this.tool === tool) {
			return;
		}

		this.setPreviousTool(this.tool);

		this.tool = tool;
	}

	selectAndExecuteTool(tool: AtomicTool): void {
		this.executeAtomicTool(tool);
	}

	beginTool(point: PenPoint): void {
		if (!this.tool) {
			throw new Error("Tool must not be null");
		}

		this.tool.begin(point.clone(), this.toolContext);
	}

	executeTool(point: PenPoint): void {
		if (!this.tool) {
			throw new Error("Tool must not be null");
		}

		this.tool.execute(point.clone());
	}

	endTool(point: PenPoint): void {
		if (!this.tool) {
			throw new Error("Tool must not be null");
		}

		this.tool.end(point.clone());
	}

	private executeAtomicTool(tool: AtomicTool): void {
		const point = PenPoint.createZero();

		this.setTool(tool);

		this.beginTool(point);
		this.executeTool(point);
		this.endTool(point);

		this.setPreviousTool(this.previousTool);
	}

	private setPreviousTool(tool: Tool | null): void {
		if (!tool) {
			return;
		}

		if (tool instanceof AtomicTool) {
			// Do not remember atomic tools.
			return;
		}

		this.previousTool = tool;
	}
}