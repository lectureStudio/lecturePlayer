import { RenderController } from "./render.controller";
import { PenPoint } from "../geometry/pen-point";
import { SlideDocument } from "../model/document";
import { AtomicTool } from "../tool/atomic.tool";
import { CursorTool } from "../tool/cursor.tool";
import { ClearShapesTool } from "../tool/clear-shapes.tool";
import { HighlighterTool } from "../tool/highlighter.tool";
import { PenTool } from "../tool/pen.tool";
import { PointerTool } from "../tool/pointer.tool";
import { RedoTool } from "../tool/redo.tool";
import { RubberTool } from "../tool/rubber.tool";
import { Tool, ToolType } from "../tool/tool";
import { ToolContext } from "../tool/tool-context";
import { UndoTool } from "../tool/undo.tool";
import { Action } from "../action/action";
import { autorun, runInAction } from "mobx";
import { documentStore } from "../store/document.store";
import { toolStore } from "../store/tool.store";
import { uiStateStore } from "../store/ui-state.store";

export class ToolController {

	private readonly toolContext: ToolContext;

	private tool: Tool;

	private previousTool: Tool;

	private document: SlideDocument | undefined;


	constructor(renderController: RenderController) {
		this.toolContext = new ToolContext(renderController);
		this.toolContext.actionListener = this.recordAction.bind(this);

		autorun(() => {
			this.setDocument(documentStore.selectedDocument);
		});
		autorun(() => {
			this.setPageNumber(documentStore.selectedPageNumber);
		});
		autorun(() => {
			runInAction(() => {
				this.selectTool(toolStore.selectedToolType);
			})
		});
	}

	setDocument(document: SlideDocument | undefined): void {
		this.document = document;
	}

	setPageNumber(pageNumber: number | undefined): void {
		if (!this.document || !pageNumber) {
			return;
		}

		this.toolContext.page = this.document.getPage(pageNumber);
		this.toolContext.pageNumber = pageNumber;
	}

	setKeyEvent(keyEvent: KeyboardEvent): void {
		this.toolContext.keyEvent = keyEvent;
	}

	setTool(tool: Tool): void {
		if (tool == null) {
			throw new Error("Tool must not be null");
		}
		if (!this.tool && this.tool === tool) {
			return;
		}

		this.setPreviousTool(this.tool);

		this.tool = tool;

		toolStore.setSelectedToolType(tool.getType());
	}

	beginTool(point: PenPoint): void {
		this.normalizePoint(point);

		this.tool.begin(point.clone(), this.toolContext);
	}

	executeTool(point: PenPoint): void {
		this.normalizePoint(point);

		this.tool.execute(point.clone());
	}

	endTool(point: PenPoint): void {
		this.normalizePoint(point);

		this.tool.end(point.clone());
	}

	private setPreviousTool(tool: Tool): void {
		if (!tool) {
			return;
		}
		if (tool instanceof AtomicTool) {
			// Do not remember atomic tools.
			return;
		}

		this.previousTool = tool;
	}

	private selectTool(toolType: ToolType): void {
		switch (toolType) {
			case ToolType.CURSOR:
				this.selectCursorTool();
				break;

			case ToolType.HIGHLIGHTER:
				this.selectHighlighterTool();
				break;

			case ToolType.PEN:
				this.selectPenTool();
				break;

			case ToolType.POINTER:
				this.selectPointerTool();
				break;

			case ToolType.RUBBER:
				this.selectRubberTool();
				break;

			case ToolType.DELETE_ALL:
				this.selectAndExecuteTool(new ClearShapesTool());
				break;

			case ToolType.UNDO:
				this.selectAndExecuteTool(new UndoTool());
				break;

			case ToolType.REDO:
				this.selectAndExecuteTool(new RedoTool());
				break;

			default:
				console.error("Selected unknown tool");
		}
	}

	private selectCursorTool() {
		this.setTool(new CursorTool());
	}

	private selectHighlighterTool() {
		const highlighterTool = new HighlighterTool();
		highlighterTool.brush = toolStore.selectedToolBrush;

		this.setTool(highlighterTool);
	}

	private selectPenTool() {
		const penTool = new PenTool();
		penTool.brush = toolStore.selectedToolBrush;

		this.setTool(penTool);
	}

	private selectPointerTool() {
		const pointerTool = new PointerTool();
		pointerTool.brush = toolStore.selectedToolBrush;

		this.setTool(pointerTool);
	}

	private selectRubberTool() {
		this.setTool(new RubberTool());
	}

	private selectAndExecuteTool(tool: AtomicTool): void {
		const point = PenPoint.createZero();

		this.setTool(tool);

		this.beginTool(point);
		this.executeTool(point);
		this.endTool(point);

		this.setTool(this.previousTool);
	}

	private normalizePoint(point: PenPoint) {
		const pageRect = this.toolContext.page.getSlideShape().bounds;
		const slideSize = uiStateStore.slideSurfaceSize;

		// Convert pixel coordinates to values in the domain [0; 1].
		const x_rel = point.x / slideSize.width * pageRect.width * window.devicePixelRatio;
		const y_rel = point.y / slideSize.width * pageRect.width * window.devicePixelRatio;

		point.x = pageRect.x + x_rel;
		point.y = pageRect.y + y_rel;
	}

	private recordAction(action: Action) {
		action.keyEvent = this.toolContext.keyEvent;
		action.timestamp = new Date().valueOf();

		// const docId = this.document.getDocumentId();
		// const pageNumber = this.toolContext.pageNumber;

		// addStreamAction(new StreamPagePlaybackAction(docId, pageNumber, action));
	}
}
