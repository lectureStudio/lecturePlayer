import { Brush } from "../paint/brush";
import { Color } from "../paint/color";
import { ToolType } from "../tool/tool";
import { createEvent, createStore } from "effector";

const opaquePalette = [
	// Black
	new Color(0, 0, 0),
	// Purple
	new Color(135, 25, 224),
	// Blue
	new Color(0, 0, 255),
	// Green
	new Color(0, 210, 0),
	// Red
	new Color(255, 0, 0)
]

const alphaPalette = [
	// Orange
	new Color(255, 209, 25, 0.7),
	// Blue Vivid
	new Color(33, 134, 235, 0.7),
	// Cyan
	new Color(72, 248, 248, 0.7),
	// Light Green
	new Color(145, 255, 21, 0.7),
	// Magenta
	new Color(255, 86, 255, 0.7)
]

const alphaPaletteRgb = [
	// Red
	new Color(255, 0, 0, 0.7),
	// Blue
	new Color(0, 0, 255, 0.7),
	// Green
	new Color(0, 210, 0, 0.7)
]

type ToolSettings = {
	colorPalette: Array<Color>;
	thickness: number,
	customBrush: Brush
}

type ToolStore = {
	selectedToolType: ToolType;
	selectedToolBrush: Brush;
	selectedToolSettings: ToolSettings;
}

const toolSettingsMap: Map<ToolType, ToolSettings> = new Map([
	[ToolType.PEN, {
		colorPalette: opaquePalette,
		thickness: 0.003,
		customBrush: new Brush(opaquePalette[0], 0.003)
	}],
	[ToolType.HIGHLIGHTER, {
		colorPalette: alphaPalette,
		thickness: 0.02,
		customBrush: new Brush(alphaPalette[0], 0.02)
	}],
	[ToolType.POINTER, {
		colorPalette: alphaPaletteRgb,
		thickness: 0.015,
		customBrush: new Brush(alphaPaletteRgb[0], 0.015)
	}],
]);

export const setToolType = createEvent<ToolType>();
export const setToolColor = createEvent<Color>();
export const setToolThickness = createEvent<number>();

export default createStore<ToolStore>({
	// Select cursor by default.
	selectedToolType: ToolType.CURSOR,
	selectedToolBrush: null,
	selectedToolSettings: null
})
	.on(setToolType, (state: ToolStore, type: ToolType) => {
		if (type !== state.selectedToolType) {
			const settings = toolSettingsMap.get(type);

			return {
				...state,
				selectedToolType: type,
				selectedToolSettings: settings,
				selectedToolBrush: settings ? settings.customBrush : null,
			};
		}
		return state;
	})
	.on(setToolColor, (state: ToolStore, color: Color) => {
		const brush = new Brush(color, state.selectedToolBrush.width);

		state.selectedToolSettings.customBrush = brush;

		return {
			...state,
			selectedToolBrush: brush
		};
	})
	.on(setToolThickness, (state: ToolStore, thickness: number) => {
		const brush = new Brush(state.selectedToolBrush.color, thickness);

		state.selectedToolSettings.customBrush = brush;

		return {
			...state,
			selectedToolBrush: brush
		};
	});