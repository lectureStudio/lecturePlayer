import { Action } from "../action/action";
import { ToolBeginAction } from "../action/tool-begin.action";
import { ToolEndAction } from "../action/tool-end.action";
import { ToolExecuteAction } from "../action/tool-execute.action";
import { PenPoint } from "../geometry/pen-point";
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

export abstract class Tool {

	protected context: ToolContext;


	/**
	 * Begins the tool action at the given point with a tool context.
	 *
	 * @param point The point at which the action has occurred.
	 * @param context The context containing relevant information for this tool.
	 */
	begin(point: PenPoint, context: ToolContext): void {
		this.context = context;

		this.context.recordAction(this.createAction());
		this.context.recordAction(new ToolBeginAction(point));
	}

	/**
	 * Executes this tool at the given point.
	 * 
	 * @param point The point at which the action has occurred.
	 */
	execute(point: PenPoint): void {
		this.context.recordAction(new ToolExecuteAction(point));
	}

	/**
	 * Ends this tool at the given point.
	 * 
	 * @param point The point at which the action has occurred.
	 */
	end(point: PenPoint): void {
		this.context.recordAction(new ToolEndAction(point));
	}

	/**
	 * Returns the type of this tool.
	 */
	abstract getType(): ToolType;

	/**
	 * Creates an action for this tool which can be recorded and executed for playback.
	 */
	abstract createAction(): Action;

}