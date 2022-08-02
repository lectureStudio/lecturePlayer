import { Utils } from '../utils/utils';
import { CourseParticipant } from './course-state';

class Participants extends EventTarget {

	private _participants: CourseParticipant[] = [];


	get participants(): CourseParticipant[] {
		return this._participants;
	}

	set participants(participants: CourseParticipant[]) {
		this._participants = participants;

		this.dispatchEvent(Utils.createEvent("all"));
	}

	add(participant: CourseParticipant) {
		const index = this._participants.findIndex(p => {
			return p.userId === participant.userId;
		});

		if (index === -1) {
			this._participants.push(participant);
			// Sort participants by family-name in ascending order.
			this._participants.sort(function (p1, p2) {
				let a = p1.familyName.toUpperCase(),
					b = p2.familyName.toUpperCase();

				return a == b ? 0 : a > b ? 1 : -1;
			});

			this.dispatchEvent(Utils.createEvent("added", participant));
		}
	}

	remove(participant: CourseParticipant) {
		const index = this._participants.findIndex(p => {
			return p.userId === participant.userId;
		});

		if (index > -1) {
			this._participants.splice(index, 1);

			this.dispatchEvent(Utils.createEvent("removed", participant));
		}
	}
}

export const participants = new Participants();