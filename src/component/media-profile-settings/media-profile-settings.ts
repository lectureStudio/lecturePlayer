import { SlChangeEvent, SlRadioGroup } from "@shoelace-style/shoelace";
import { t } from "i18next";
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { MediaProfile } from "../../model/ui-state";
import { uiStateStore } from "../../store/ui-state.store";
import { Component } from "../component";

@customElement("media-profile-settings")
export class MediaProfileSettings extends Component {

	private onMediaProfile(e: SlChangeEvent) {
		const value = (e.target as SlRadioGroup).value.toUpperCase();

		uiStateStore.setMediaProfile(MediaProfile[value as keyof typeof MediaProfile]);
	}

	protected override render() {
		return html`
			<form id="profile-form">
				<sl-radio-group name="profile" .value="${uiStateStore.mediaProfile}" @sl-change=${this.onMediaProfile}>
					<sl-radio value="${MediaProfile.HOME}">${t("settings.ui.media.profile.home")}</sl-radio>
					<span class="help-text">${t("settings.ui.media.profile.home.description")}</span>
					<sl-radio value="${MediaProfile.CLASSROOM}">${t("settings.ui.media.profile.classroom")}</sl-radio>
					<span class="help-text">${t("settings.ui.media.profile.classroom.description")}</span>
				</sl-radio-group>
			</form>
		`;
	}

}
