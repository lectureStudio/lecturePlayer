import { course } from "../model/course";
import { Action } from "./action";
import * as Y from "yjs";
import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";
import { StreamAction } from "./stream.action";
import { StreamActionType } from "./stream.action-type";

export class ydocAction extends StreamAction{

    //TODO add variable diff1
    diff: Uint8Array;

    constructor(diff: Uint8Array){
        super();
        this.diff = diff;
    }

    execute(executor: ActionExecutor): void {
        throw new Error("Method not implemented.");
    }

    getActionType(): StreamActionType {
        return StreamActionType.YDOC;
    }
    
    override toBuffer(): ArrayBuffer {
        const stateVector1 = Y.encodeStateVector(course.YDoc); //Uint8Array
        const stateVector2 = Y.encodeStateVector(course.publicYDoc);

		const diff1 = Y.encodeStateAsUpdate(course.YDoc, stateVector2); //Uint8Array
        console.log("action.toBuffer, diff:" ,diff1);
        Y.applyUpdate(course.publicYDoc,diff1);

        const buffer = new Uint8Array(5+diff1.byteLength);
        const view = new DataView(buffer.buffer);
		view.setInt32(0, buffer.byteLength);
		view.setInt8(4, this.getActionType());
        buffer.set(diff1,5);
        //const length = 1 ? 12 : 0;
		//const { buffer, dataView } = super.createBuffer(length);
        
        //let s = JSON.stringify(this.doc);
        //dataView.setInt16(13, 15);
        
        return buffer;
    }
}