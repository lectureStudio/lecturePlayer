import { course } from "../model/course";
import { Action } from "./action";
import * as Y from "yjs";
import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";
import { StreamAction } from "./stream.action";
import { StreamActionType } from "./stream.action-type";
import { PenPoint } from "../geometry/pen-point";
import { ToolBeginAction } from "./tool-begin.action";
import { PenAction } from "./pen.action";
import { ToolExecuteAction } from "./tool-execute.action";
import { Brush } from "../paint/brush";
import { Color } from "../paint/color";
import { ToolEndAction } from "./tool-end.action";
import { YMap } from "yjs/dist/src/internals";
import { RubberAction } from "./rubber.action";
import { UndoAction } from "./undo.action";
import { RedoAction } from "./redo.action";
import { ZoomOutAction } from "./zoom-out.action";
import { HighlighterAction } from "./highlighter.action";
import { ClearShapesAction } from "./clear-shapes.action";
import { PointerAction } from "./pointer.action";
import { ZoomAction } from "./zoom.action";
import { KeyAction } from "./key.action";
import { PageAction } from "./page.action";

export class ydocAction extends StreamAction{

    diff: Uint8Array; //difference between the written Document and the Public Document

    usr: string; //user who did a annotation

    constructor(){
        super();
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
        
        Y.applyUpdate(course.publicYDoc,diff1);
        
        const usrBuffer = Uint8Array.from(Array.from(course.userId).map(c => c.charCodeAt(0)));
        const buffer = new Uint8Array(7+diff1.byteLength+usrBuffer.byteLength);
        const view = new DataView(buffer.buffer);
		view.setInt32(0, buffer.byteLength);
		view.setInt8(4, this.getActionType());
        
        view.setInt8(5,usrBuffer.byteLength);
        buffer.set(usrBuffer,6);
        buffer.set(diff1,6+usrBuffer.byteLength);
        
        return buffer;
    }

    /**
     * Adds the action from the parameters to the YDoc in course, using the userId from the caller user.
     * @param action Action to add to the YDoc
     * @returns 
     */
    addAction(action: Action){
        let usrAnnotations = course.YDoc.getMap("annotations").get(course.userId) as YMap<YMap<any>>;

        //set Map
        const map = new Y.Map <any>;
        map.set("action",ActionType[action.getActionType()]); 

        switch(ActionType[action.getActionType()]){
            case "TOOL_BEGIN":
            case "TOOL_EXECUTE":
            case "TOOL_END":
                let point = (action as ToolBeginAction).point;
                map.set("x",point.x);
                map.set("y",point.y);
                map.set("p",point.p);
                break;
            case "PEN":
            case "HIGHLIGHTER":
            case "POINTER":
                map.set("shapehandle", (action as PenAction).shapeHandle);
                map.set("brush-width",(action as PenAction).brush.width);
                map.set("rgb",(action as PenAction).brush.color.toRgba());
                break;
            case "ZOOM":
                map.set("shapehandle", (action as PenAction).shapeHandle);
                map.set("brush-width",(action as PenAction).brush.width);
                map.set("rgb",(action as PenAction).brush.color.toRgba());
                break;
            case "PAGE":
                map.set("pageNumber",(action as PageAction).getPageNumber());
                break;
            case "RUBBER_EXT":
                map.set("shapehandle",(action as RubberAction).giveShapeHandle());
                break;
            case "UNDO":
            case "REDO":
            case "CLEAR_SHAPES":
            case "ZOOM_OUT":
            case "KEY":
                break; //handled with just the ActionType 
            default:
                throw new Error("ActionType not implemented.");
        }
        
        usrAnnotations.set(usrAnnotations.size.toString(),map);
    }
    
    /**
     * Extracts Actions from the YDoc, from the YMap "this.usr"
     * @param nrOfActions the number of Action to be extracted from the YMap
     * @returns Array of Actions convertet from the YDoc
     */
    diffToActions(nrOfActions: number): Action[]{
        let ActionArr = new Array<Action>;
        let usrAnnotations = course.YDoc.getMap("annotations").get(this.usr) as YMap<YMap<any>>;

        for(let i = nrOfActions; i > 0; i--){
            let key = (usrAnnotations.size-i).toString(); //index of the next Map
            let ActionMap;
            if(usrAnnotations.has(key)){
                ActionMap = usrAnnotations.get(key);
            } else{
                throw new Error("Key -"+key+" not availbale in user annotation map");
            }
            ActionArr = ActionArr.concat(this.mapToAction(ActionMap));
        }

        return ActionArr;
    }

    /**
     * Goes through the whole YDoc in course, all users and Actions, and converts them to actions
     * @returns Action Array with all the Actions in the YDoc
     */
    docToActions(): Action[]{
        let ActionArr = new Array<Action>;
        let usrMap = course.YDoc.getMap("annotations") as YMap<Map<number,YMap<any>>>;
        for(let usr of usrMap.keys()){ //for every user
            let usrAnnotations = course.YDoc.getMap("annotations").get(usr) as Map<number,YMap<any>>;
            for(let index of usrAnnotations.keys()){ // for every action
                ActionArr = ActionArr.concat(this.mapToAction(usrAnnotations.get(index))); // add to the Action Array
            }
        }
        return ActionArr;
    
    }

    /**
     * Converts a Map to Actions
     * @param ActionMap Map to be converted
     * @returns Action Array
     */
    mapToAction(ActionMap:YMap<any>):Action[]{
        let ActionArr = new Array<Action>;
        let p = new PenPoint(ActionMap.get("x"),ActionMap.get("y"),ActionMap.get("p")) //set PenPoints for Action

        let actionString = ActionMap.get("action") as string;

        let sH = ActionMap.get("shapehandle") as number;
        let brushWidth = ActionMap.get("brush-width") as number;
        let rgb = ActionMap.get("rgb") as string;
        let pageNumber = ActionMap.get("pageNumber") as number;
        
        switch(actionString){
            case "TOOL_BEGIN":
                ActionArr.push(new ToolBeginAction(p));
                break;
            case "TOOL_EXECUTE":
                ActionArr.push(new ToolExecuteAction(p));
                break;
            case "TOOL_END":
                ActionArr.push(new ToolEndAction(p));
                break;
            case "PEN":
                ActionArr.push(new PenAction(sH,new Brush(Color.fromRGBString(rgb),brushWidth)));
                break;
            case "HIGHLIGHTER":
                ActionArr.push(new HighlighterAction(sH,new Brush(Color.fromRGBString(rgb),brushWidth)));
                break;
            case "POINTER":
                ActionArr.push(new PointerAction(sH,new Brush(Color.fromRGBString(rgb),brushWidth)));
                break;
            case "UNDO":
                ActionArr.push(new UndoAction());
                break;
            case "REDO":
                ActionArr.push(new RedoAction());
                break;
            case "CLEAR_SHAPES":
                ActionArr.push(new ClearShapesAction());
                break;
            case "ZOOM":
                ActionArr.push(new ZoomAction(sH,new Brush(Color.fromRGBString(rgb),brushWidth)));
                break;
            case "ZOOM_OUT":
                ActionArr.push(new ZoomOutAction());
                break;
            case "KEY":
                ActionArr.push(new KeyAction());
                break;
            case "PAGE":
                ActionArr.push(new PageAction(pageNumber));
            case "RUBBER_EXT":
                ActionArr.push(new RubberAction(sH));
                break;
            default:
                throw new Error(actionString+" - is not implemented.");
        }
        return ActionArr;
    }
}