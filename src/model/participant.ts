import { t } from "../component/i18n-mixin";
import { userStore } from "../store/user.store";
import { State } from "../utils/state";

export type ParticipantType = "ORGANISATOR" | "CO_ORGANISATOR" | "PARTICIPANT" | "GUEST_LECTURER";

export interface CourseParticipant {

	readonly userId: string;

	readonly firstName: string;

	readonly familyName: string;

	readonly participantType: ParticipantType;

	readonly avatarImageData: string | null;

	readonly canShowAvatar: boolean;

	readonly canSeeOthersAvatar: boolean;

	streamState: State;

	microphoneActive: boolean;

	microphoneStream: MediaStream | null;

	cameraActive: boolean;

	cameraStream: MediaStream | null;

	screenActive: boolean;

	screenStream: MediaStream | null;

}

export interface CourseParticipantPresence extends CourseParticipant {

	readonly presence: "CONNECTED" | "DISCONNECTED";

}

export namespace Participant {

	export function getInitials(participant: CourseParticipant) {
		return `${participant.firstName.charAt(0)}${participant.familyName.charAt(0)}`;
	}

	export function getFullName(participant: CourseParticipant) {
		let name = `${participant.firstName} ${participant.familyName}`;

		if (participant.userId === userStore.userId) {
			name += ` (${t("course.participants.me")})`;
		}

		return name;
	}

	export function getAvatar(participant: CourseParticipant) {
		return participant.avatarImageData;
	}

	export function hasAvatar(participant: CourseParticipant) {
		return !!participant.avatarImageData;
	}

	export function canShowAvatar(participant: CourseParticipant) {
		return participant.canShowAvatar;
	}

	export function canSeeOthersAvatar(participant: CourseParticipant) {
		return participant.canSeeOthersAvatar;
	}
}
