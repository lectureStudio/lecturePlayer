import { Action } from "./action";
import { PenPoint } from "../geometry/pen-point";
import { course } from "../model/course";
import { ActionType } from "./action-type";

export abstract class ToolAction extends Action {

	point: PenPoint;


	constructor(point?: PenPoint) {
		super();

		this.point = point;
	}

	override toBuffer(): ArrayBuffer {
		const length = this.point ? 12 : 0;
		const { buffer, dataView } = super.createBuffer(length);

		if (this.point) {
			dataView.setFloat32(13, this.point.x); //x-Axis
			dataView.setFloat32(17, this.point.y); //y-Axis
			dataView.setFloat32(21, this.point.p); //Pressure
		}

		/* TODO
		Map mit Key für jeden Benutzer
		YDoc an anderen Benutzer verschicken, am bestern nur Änderung(delta)
		möglich zu testen zuert mit Text
		Publisher:
		const stateVector1 = Y.encodeStateVector(ydoc1) //Uint8Array
		const diff1 = Y.encodeStateAsUpdate(ydoc1, stateVector2) //Uint8Array
		Subscriber:
		Y.applyUpdate(ydoc2, diff1)
		*/
		let usr1 = course.YDoc.getMap("annotations").get(course.userId) as Map<number,PenPoint[]>;
		if(this.getActionType() == ActionType.TOOL_BEGIN){
			console.log("Begin!");
			usr1.set(usr1.size,[this.point]);
		}else if(this.getActionType() == ActionType.TOOL_END){
			console.log("End!");
			let PArray = usr1.get(usr1.size-1) as Array<PenPoint>;
			usr1.set(usr1.size-1,PArray.concat([this.point]));
			console.log("Points: ",usr1.get(usr1.size-1));
			console.log("Doc: ",course.YDoc);
			
		} else {
			console.log("Middle!");
			let PArray = usr1.get(usr1.size-1) as Array<PenPoint>;
			usr1.set(usr1.size-1,PArray.concat([this.point]));
		}
		//let s = JSON.stringify(course.YDoc);
		//console.log(s);
		//console.log(JSON.parse(s));

		return buffer;
	}
}