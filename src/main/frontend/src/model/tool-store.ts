import { Brush } from "../paint/brush";
import { Color } from "../paint/color";
import { ToolType } from "../tool/tool";
import { createEvent, createStore } from "effector";

type ToolStore = {
	selectedToolType: ToolType;
	selectedToolBrush: Brush;
}

export const setToolType = createEvent<ToolType>();
export const setToolColor = createEvent<Color>();
export const setToolThickness = createEvent<number>();

export default createStore<ToolStore>({
	selectedToolType: ToolType.PEN,
	selectedToolBrush: new Brush(Color.fromHex("#000000"), 0.02),
})
	.on(setToolType, (state: ToolStore, type: ToolType) => {
		if (type !== state.selectedToolType) {
			return {
				...state,
				selectedToolType: type,
			};
		}
		return state;
	})
	.on(setToolColor, (state: ToolStore, color: Color) => ({
		...state,
		selectedToolBrush: new Brush(color, state.selectedToolBrush.width),
	}))
	.on(setToolThickness, (state: ToolStore, thickness: number) => ({
		...state,
		selectedToolBrush: new Brush(state.selectedToolBrush.color, thickness),
	}));