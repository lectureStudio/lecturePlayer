import { privilegeStore } from "../store/privilege.store";
import { CourseParticipantApi } from "../transport/course-participant-api";

export class ModerationService {

	private  courseId: number;


	initialize(courseId: number): void {
		this.courseId = courseId;
	}

	banUser(userId: string): Promise<void> {
		if (!privilegeStore.canBanParticipants()) {
			return Promise.reject("Not allowed");
		}

		return CourseParticipantApi.banParticipant(this.courseId, userId);
	}
}
