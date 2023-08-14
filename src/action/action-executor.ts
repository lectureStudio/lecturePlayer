import { Tool } from "../tool/tool";
import { AtomicTool } from "../tool/atomic.tool";
import { PenPoint } from "../geometry/pen-point";
import { SlideDocument } from "../model/document";

export interface ActionExecutor {

	setSeek(seek: boolean): void;

	setKeyEvent(keyEvent: KeyboardEvent): void;

	getDocument(): SlideDocument;

	setDocument(document: SlideDocument): void;

	setPageNumber(pageNumber: number): void;

	removePageNumber(pageNumber: number): void;

	setTool(tool: Tool): void;

	selectAndExecuteTool(tool: AtomicTool): void;

	beginTool(point: PenPoint): void;

	executeTool(point: PenPoint): void;

	endTool(point: PenPoint): void;

}