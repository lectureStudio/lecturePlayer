import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { Color } from "../paint/color";
import { Font } from "../paint/font";
import { TextFontTool } from "../tool/text-font.tool";
import { ActionType } from "./action-type";

export class TextFontAction extends Action {

	private readonly handle: number;

	private readonly font: Font;

	private readonly textColor: Color;

	private readonly textAttributes: Map<string, boolean>;


	constructor(handle: number, font: Font, textColor: Color, textAttributes: Map<string, boolean>) {
		super();

		this.handle = handle;
		this.font = font;
		this.textColor = textColor;
		this.textAttributes = textAttributes;
	}

	execute(executor: ActionExecutor): void {
		executor.selectAndExecuteTool(new TextFontTool(this.handle, this.font, this.textColor, this.textAttributes));
	}

	getActionType(): ActionType {
		return ActionType.TEXT_FONT_CHANGE;
	}

	toBuffer(): ArrayBuffer {
		const encoder = new TextEncoder();
		const textBuffer = encoder.encode(this.font.family);

		const { buffer, dataView } = super.createBuffer(24 + textBuffer.length);

		dataView.setInt32(13, this.handle);
		dataView.setInt32(17, this.textColor.toRgbaNumber());
		dataView.setInt32(21, textBuffer.length);
		(<Uint8Array> buffer).set(textBuffer, 25);

		dataView.setFloat64(25 + textBuffer.length, this.font.size);
		dataView.setInt8(33 + textBuffer.length, 0);
		dataView.setInt8(34 + textBuffer.length, 0);
		dataView.setInt8(35 + textBuffer.length, 0);
		dataView.setInt8(36 + textBuffer.length, 0);

		return buffer;
	}
}