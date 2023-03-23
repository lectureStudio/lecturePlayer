import { createEvent, createStore } from "effector";

export enum ContentFocus {

	/** Focus opened documents. */
	Document,
	/** Focus shared screen. */
	ScreenShare,
	/** Focus participants (gallery, speaker), hiding both above. */
	Participants

}

export enum ContentLayout {

	Gallery,
	PresentationTop,
	PresentationRight,
	PresentationBottom,
	PresentationLeft

}

type PresentationStore = {
	contentFocus: ContentFocus;
	contentLayout: ContentLayout;
}

export const setContentLayout = createEvent<ContentLayout>();
export const setContentFocus = createEvent<ContentFocus>();

export default createStore<PresentationStore>({
	contentFocus: ContentFocus.Participants,
	contentLayout: ContentLayout.Gallery
})
	.on(setContentLayout, (state: PresentationStore, layout: ContentLayout) => {
		if (layout !== state.contentLayout) {
			return {
				...state,
				contentLayout: layout,
			};
		}
		return state;
	})
	.on(setContentFocus, (state: PresentationStore, focus: ContentFocus) => {
		if (focus !== state.contentFocus) {
			return {
				...state,
				contentFocus: focus,
			};
		}
		return state;
	});