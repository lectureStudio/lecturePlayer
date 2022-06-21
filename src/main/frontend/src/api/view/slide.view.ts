import { View } from "./view";
import { RenderSurface } from "../../render/render-surface";
import { TextLayerSurface } from "../../render/text-layer-surface";
import { SlideRenderSurface } from "../../render/slide-render-surface";
import { RenderController } from "../../render/render-controller";

interface SlideView extends View {

	setRenderController(renderController: RenderController): void;

	getActionRenderSurface(): RenderSurface;

	getSlideRenderSurface(): SlideRenderSurface;

	getVolatileRenderSurface(): RenderSurface;

	getTextLayerSurface(): TextLayerSurface;

	repaint(): void;

}

export { SlideView };