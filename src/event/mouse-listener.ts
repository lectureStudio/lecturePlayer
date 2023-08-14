import { PenPoint } from "../geometry/pen-point";
import { ToolController } from "../tool/tool-controller";

export class MouseListener {

	// Keep function pointers in order to remove them as event listeners.
	private readonly mouseDownCallback = this.onMouseDown.bind(this);
	private readonly mouseUpCallback = this.onMouseUp.bind(this);
	private readonly mouseMoveCallback = this.onMouseMove.bind(this);

	private readonly toolController: ToolController;

	private mouseDown: boolean = false;


	constructor(toolController: ToolController) {
		this.toolController = toolController;
	}

	onMouseDown(event: MouseEvent) {
		const point = this.getCoordinates(event);

		this.mouseDown = true;

		this.toolController.beginTool(point);
	}

	onMouseUp(event: MouseEvent) {
		const point = this.getCoordinates(event);

		this.mouseDown = false;

		this.toolController.endTool(point);
	}

	onMouseMove(event: MouseEvent) {
		if (this.mouseDown) {
			const point = this.getCoordinates(event);

			this.toolController.executeTool(point);
		}
	}

	registerElement(element: HTMLElement) {
		element.addEventListener("mousedown", this.mouseDownCallback);
		element.addEventListener("mouseup", this.mouseUpCallback);
		element.addEventListener("mousemove", this.mouseMoveCallback);
	}

	unregisterElement(element: HTMLElement) {
		element.removeEventListener("mousedown", this.mouseDownCallback);
		element.removeEventListener("mouseup", this.mouseUpCallback);
		element.removeEventListener("mousemove", this.mouseMoveCallback);
	}

	/**
	 * Get coordinates relative to the target.
	 * 
	 * @param event The mouse event.
	 * 
	 * @returns A PenPoint with relative coordinates.
	 */
	private getCoordinates(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const rect = target.getBoundingClientRect();

		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		return new PenPoint(x, y, 1);
	}
}