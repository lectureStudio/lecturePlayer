import { PenPoint } from "../geometry/pen-point";
import { SlideDocument } from "../model/document";
import { RenderController } from "../render/render-controller";
import { AtomicTool } from "./atomic.tool";
import { ClearShapesTool } from "./clear-shapes.tool";
import { HighlighterTool } from "./highlighter.tool";
import { PenTool } from "./pen.tool";
import { PointerTool } from "./pointer.tool";
import { RedoTool } from "./redo.tool";
import { RubberTool } from "./rubber.tool";
import { Tool, ToolType } from "./tool";
import { ToolContext } from "./tool-context";
import { UndoTool } from "./undo.tool";
import $toolStore, { setToolType } from "../model/tool-store";

export class ToolController {

	private readonly toolContext: ToolContext;

	private tool: Tool;

	private previousTool: Tool;

	private document: SlideDocument;


	constructor(renderController: RenderController) {
		this.toolContext = new ToolContext(renderController);

		$toolStore.watch(() => {
			this.onToolStoreChange();
		});
	}

	getDocument(): SlideDocument {
		return this.document;
	}

	setDocument(document: SlideDocument): void {
		this.document = document;
	}

	setPageNumber(pageNumber: number): void {
		this.toolContext.page = this.document.getPage(pageNumber);
	}

	setKeyEvent(keyEvent: KeyboardEvent): void {
		this.toolContext.keyEvent = keyEvent;
	}

	setTool(tool: Tool): void {
		if (!tool) {
			throw new Error("Tool must not be null");
		}
		if (!this.tool && this.tool === tool) {
			return;
		}

		console.log("set tool", tool.getType());

		this.setPreviousTool(this.tool);

		this.tool = tool;

		setToolType(tool.getType());
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

	private onToolStoreChange(): void {
		switch ($toolStore.getState().selectedToolType) {
			case ToolType.CURSOR:

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

	private selectHighlighterTool() {
		const highlighterTool = new HighlighterTool();
		highlighterTool.brush = $toolStore.getState().selectedToolBrush;

		this.setTool(highlighterTool);
	}

	private selectPenTool() {
		const penTool = new PenTool();
		penTool.brush = $toolStore.getState().selectedToolBrush;

		this.setTool(penTool);
	}

	private selectPointerTool() {
		const pointerTool = new PointerTool();
		pointerTool.brush = $toolStore.getState().selectedToolBrush;

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
		const slideSize = this.toolContext.renderController.getSlideSize();

		// Convert pixel coordinates to values in the domain [0; 1].
		const x_rel = point.x / slideSize.width * pageRect.width * window.devicePixelRatio;
		const y_rel = point.y / slideSize.width * pageRect.width * window.devicePixelRatio;

		point.x = pageRect.x + x_rel;
		point.y = pageRect.y + y_rel;
	}
}