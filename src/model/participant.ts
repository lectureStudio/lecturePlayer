import { t } from "../component/i18n-mixin";
import { userStore } from "../store/user.store";
import { State } from "../utils/state";

export type ParticipantType = "ORGANISATOR" | "CO_ORGANISATOR" | "PARTICIPANT" | "GUEST_LECTURER";

export interface CourseParticipant {

	readonly userId: string;

	readonly firstName: string;

	readonly familyName: string;

	readonly participantType: ParticipantType;

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

}
