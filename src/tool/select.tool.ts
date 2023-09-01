import { Tool, ToolType } from "./tool";
import { ToolContext } from "./tool-context";
import { PenPoint } from "../geometry/pen-point";
import { Shape } from "../model/shape/shape";
import { Action } from "../action/action";
import { SelectAction } from "../action/select.action";

export class SelectTool extends Tool {

	private sourcePoint: PenPoint;

	private selectedShape: Shape | null;


	override begin(point: PenPoint, context: ToolContext): void {
		super.begin(point, context);

		this.sourcePoint = point.clone();
		this.selectedShape = this.getTopLevelShape(point);

		this.removeSelection();

		if (this.selectedShape != null) {
			this.selectedShape.setSelected(true);
		}
	}

	override execute(point: PenPoint): void {
		if (this.selectedShape != null) {
			this.sourcePoint.subtract(point);

			this.context.beginBulkRender();
			this.selectedShape.moveByDelta(this.sourcePoint);
			this.context.endBulkRender();

			this.sourcePoint = point.clone();

			super.execute(point);
		}
	}

	override end(point: PenPoint): void {
		if (this.selectedShape != null) {
			this.context.beginBulkRender();
			this.selectedShape.setSelected(false);
			this.context.endBulkRender();

			super.end(point);
		}
	}

	getType(): ToolType {
		return ToolType.SELECT;
	}

	createAction(): Action {
		return new SelectAction();
	}

	getTopLevelShape(point: PenPoint) {
		let shape = null;

		for (const s of this.context.page.getShapes()) {
			if (s.contains(point)) {
				shape = s;
			}
		}
		return shape;
	}

	removeSelection(): void {
		this.context.beginBulkRender();

		for (const shape of this.context.page.getShapes()) {
			if (shape.isSelected()) {
				shape.setSelected(false);
			}
		}

		this.context.endBulkRender();
	}

}