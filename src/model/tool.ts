import { Brush } from "../paint/brush";
import { Color } from "../paint/color";

export const opaquePalette = [
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

export const alphaPalette = [
	// Orange
	new Color(255, 209, 25, 0.7),
	// Cyan
	new Color(72, 248, 248, 0.7),
	// Light Green
	new Color(145, 255, 21, 0.7),
	// Magenta
	new Color(255, 86, 255, 0.7)
]

export const alphaPaletteRGB = [
	// Red
	new Color(255, 0, 0, 0.7),
	// Blue
	new Color(0, 0, 255, 0.7),
	// Green
	new Color(0, 210, 0, 0.7)
]

export interface ToolSettings {
	colorPalette: Array<Color>;
	thickness: number,
	customBrush: Brush
}
