import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";

export enum ToolType {

	UNDO,
	REDO,
	PEN,
	HIGHLIGHTER,
	RUBBER,
	DELETE_ALL,
	LATEX,
	TEXT,
	ZOOM,
	ZOOM_OUT,
	PANNING,
	TEXT_SELECTION,
	POINTER,
	EXTEND_VIEW,
	ARROW,
	LINE,
	RECTANGLE,
	ELLIPSE,
	SELECT,
	SELECT_GROUP,
	CLONE,
	CURSOR

}

export interface Tool {

	begin(point: Point, context: ToolContext): void;

	execute(point: Point): void;

	end(point: Point): void;

}