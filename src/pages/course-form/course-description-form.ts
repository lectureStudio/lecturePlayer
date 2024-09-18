import { CSSResultGroup, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import Quill from "quill";
import quillStyles from "./quill.css";
import styles from "./course-form-content.css";

@customElement('course-description-form')
export class CourseDescriptionForm extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		quillStyles,
		styles
	];

	@query("#description-editor")
	accessor editorDiv: HTMLElement;


	protected override firstUpdated() {
		const quill = new Quill(this.editorDiv, {
			modules: {
				toolbar: [
					["bold", "italic", "underline", "strike"],
					["link"],
					[{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
					[{ script: "sub" }, { script: "super" }],
					[{ indent: "-1" }, { indent: "+1" }],
					["clean"],
				],
			},
			theme: "snow"
		});
		quill.root.innerHTML = "";

		this.quillEmbedShadowRoot(quill);

		// Use translated text within Quill.
		this.setEditorTranslation(quill, "--editor-link", t("course.form.description.editor.link"));
		this.setEditorTranslation(quill, "--editor-save", t("course.form.description.editor.save"));
		// Toolbar tooltip translations.
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.bold"), "button[aria-label=\"bold\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.italic"), "button[aria-label=\"italic\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.underline"), "button[aria-label=\"underline\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.strike"), "button[aria-label=\"strike\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.link"), "button[aria-label=\"link\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.list.ordered"), "button[aria-label=\"list: ordered\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.list.unordered"), "button[aria-label=\"list: bullet\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.list.checked"), "button[aria-label=\"list: check\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.subscript"), "button[aria-label=\"script: sub\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.superscript"), "button[aria-label=\"script: super\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.outdent"), "button[aria-label=\"indent: -1\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.indent"), "button[aria-label=\"indent: +1\"]");
		this.setEditorTranslation(quill, "title", t("course.form.description.editor.clean"), "button[aria-label=\"clean\"]");
	}

	protected override render() {
		return html`
			<form class="validity-styles">
				<sl-input name="title" label="${t("course.form.description.title")}" help-text="${t("course.form.description.title.help")}" autocomplete="off" pattern="\\w{3,64}" required></sl-input>

				<label>${t("course.form.description")}</label>
				<div id="description-editor"></div>
			</form>
		`;
	}

	private setEditorTranslation(quill: Quill, key: string, value: string, selector: string | undefined = undefined) {
		if (selector) {
			const button = (quill.container.previousSibling as HTMLElement).querySelector<HTMLElement>(selector);
			if (button) {
				button.setAttribute(key, value);
			}
		}
		else {
			quill.container.style.setProperty(key, `'${value}'`);
		}
	}

	private quillEmbedShadowRoot(quill: Quill) {
		const normalizeNative = (nativeRange: any) => {
			if (nativeRange) {
				const range = nativeRange;

				if (range.baseNode) {
					range.startContainer = nativeRange.baseNode;
					range.endContainer = nativeRange.focusNode;
					range.startOffset = nativeRange.baseOffset;
					range.endOffset = nativeRange.focusOffset;

					if (range.endOffset < range.startOffset) {
						range.startContainer = nativeRange.focusNode;
						range.endContainer = nativeRange.baseNode;
						range.startOffset = nativeRange.focusOffset;
						range.endOffset = nativeRange.baseOffset;
					}
				}

				if (range.startContainer) {
					return {
						start: { node: range.startContainer, offset: range.startOffset },
						end: { node: range.endContainer, offset: range.endOffset },
						native: range
					};
				}
			}

			return null
		};

		quill.selection.getNativeRange = () => {
			const dom = quill.root.getRootNode();
			const selection = (dom as Document).getSelection();

			return normalizeNative(selection);
		};

		const selectionListener = (..._args: any[]) => {
			quill.selection.update();
		};

		const container = quill.container.querySelector<HTMLElement>(".ql-editor");

		if (container) {
			container.addEventListener("focus", () => {
				document.addEventListener("selectionchange", selectionListener);
			});
			container.addEventListener("blur", () => {
				document.removeEventListener("selectionchange", selectionListener);
			});
		}
	}
}
