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

	/**
	 * Begins the tool action at the given point with a tool context.
	 *
	 * @param point The point at which the action has occurred.
	 * @param context The context containing relevant information for this tool.
	 */
	begin(point: Point, context: ToolContext): void;

	/**
	 * Executes this tool at the given point.
	 * 
	 * @param point The point at which the action has occurred.
	 */
	execute(point: Point): void;

	/**
	 * Ends this tool at the given point.
	 * 
	 * @param point The point at which the action has occurred.
	 */
	end(point: Point): void;

	/**
	 * Returns the type of this tool.
	 */
	getType(): ToolType;

}