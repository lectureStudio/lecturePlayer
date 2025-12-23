import { expect } from "@open-wc/testing";
import { participantStore } from "./participants.store.js";
import { CourseParticipant } from "../model/participant.js";
import { State } from "../utils/state.js";

/**
 * Check if MediaStream is available in this environment.
 */
const hasMediaStream = typeof MediaStream !== "undefined";

/**
 * Creates a mock MediaStream or null if not available.
 */
function createMockMediaStream(): MediaStream | null {
	return hasMediaStream ? new MediaStream() : null;
}

/**
 * Creates a mock CourseParticipant.
 */
function createMockParticipant(
	userId: string,
	firstName: string = "John",
	familyName: string = "Doe"
): CourseParticipant {
	return {
		userId,
		firstName,
		familyName,
		participantType: "PARTICIPANT",
		avatarImageData: null,
		canShowAvatar: false,
		canSeeOthersAvatar: false,
		streamState: State.DISCONNECTED,
		microphoneActive: false,
		microphoneStream: null,
		cameraActive: false,
		cameraStream: null,
		screenActive: false,
		screenStream: null,
	};
}

describe("ParticipantStore", () => {
	beforeEach(() => {
		// Reset store before each test
		participantStore.reset();
	});

	afterEach(() => {
		// Clean up
		participantStore.reset();
	});

	describe("participant management", () => {
		it("starts with empty participants list", () => {
			expect(participantStore.participants).to.have.length(0);
			expect(participantStore.count).to.equal(0);
		});

		it("adds participant", () => {
			const participant = createMockParticipant("user-1", "Alice", "Smith");

			participantStore.addParticipant(participant);

			expect(participantStore.participants).to.have.length(1);
			expect(participantStore.count).to.equal(1);
			expect(participantStore.participants[0].userId).to.equal("user-1");
		});

		it("adds multiple participants", () => {
			participantStore.addParticipant(createMockParticipant("user-1"));
			participantStore.addParticipant(createMockParticipant("user-2"));
			participantStore.addParticipant(createMockParticipant("user-3"));

			expect(participantStore.count).to.equal(3);
		});

		it("removes participant", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			participantStore.removeParticipant(participant);

			expect(participantStore.count).to.equal(0);
		});

		it("removes only matching participant", () => {
			const p1 = createMockParticipant("user-1");
			const p2 = createMockParticipant("user-2");

			participantStore.addParticipant(p1);
			participantStore.addParticipant(p2);

			participantStore.removeParticipant(p1);

			expect(participantStore.count).to.equal(1);
			expect(participantStore.participants[0].userId).to.equal("user-2");
		});

		it("updates participant", () => {
			const participant = createMockParticipant("user-1", "John", "Doe");
			participantStore.addParticipant(participant);

			const updated = { ...participant, firstName: "Jane" };
			participantStore.updateParticipant(updated);

			expect(participantStore.participants[0].firstName).to.equal("Jane");
		});

		it("sets all participants", () => {
			const participants = [
				createMockParticipant("user-1"),
				createMockParticipant("user-2"),
			];

			participantStore.setParticipants(participants);

			expect(participantStore.count).to.equal(2);
		});

		it("replaces all participants when setting", () => {
			participantStore.addParticipant(createMockParticipant("old-user"));

			participantStore.setParticipants([
				createMockParticipant("new-user"),
			]);

			expect(participantStore.count).to.equal(1);
			expect(participantStore.participants[0].userId).to.equal("new-user");
		});
	});

	describe("findByUserId", () => {
		it("finds participant by user ID", () => {
			const participant = createMockParticipant("target-user", "Target", "User");
			participantStore.addParticipant(createMockParticipant("other-user"));
			participantStore.addParticipant(participant);

			const found = participantStore.findByUserId("target-user");

			expect(found).to.exist;
			expect(found!.firstName).to.equal("Target");
		});

		it("returns undefined for non-existent user", () => {
			participantStore.addParticipant(createMockParticipant("user-1"));

			const found = participantStore.findByUserId("non-existent");

			expect(found).to.be.undefined;
		});
	});

	describe("microphone state", () => {
		it("sets microphone active state", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			participantStore.setParticipantMicrophoneActive("user-1", true);

			expect(participantStore.findByUserId("user-1")!.microphoneActive).to.be.true;
		});

		(hasMediaStream ? it : it.skip)("sets microphone stream", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			const mockStream = createMockMediaStream()!;
			participantStore.setParticipantMicrophoneStream("user-1", mockStream);

			expect(participantStore.findByUserId("user-1")!.microphoneStream).to.equal(mockStream);
		});

		(hasMediaStream ? it : it.skip)("removes microphone stream", () => {
			const participant = createMockParticipant("user-1");
			participant.microphoneStream = createMockMediaStream();
			participantStore.addParticipant(participant);

			participantStore.removeParticipantMicrophoneStream("user-1");

			expect(participantStore.findByUserId("user-1")!.microphoneStream).to.be.null;
		});
	});

	describe("camera state", () => {
		it("sets camera active state", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			participantStore.setParticipantCameraActive("user-1", true);

			expect(participantStore.findByUserId("user-1")!.cameraActive).to.be.true;
		});

		(hasMediaStream ? it : it.skip)("sets camera stream", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			const mockStream = createMockMediaStream()!;
			participantStore.setParticipantCameraStream("user-1", mockStream);

			expect(participantStore.findByUserId("user-1")!.cameraStream).to.equal(mockStream);
		});

		(hasMediaStream ? it : it.skip)("removes camera stream", () => {
			const participant = createMockParticipant("user-1");
			participant.cameraStream = createMockMediaStream();
			participantStore.addParticipant(participant);

			participantStore.removeParticipantCameraStream("user-1");

			expect(participantStore.findByUserId("user-1")!.cameraStream).to.be.null;
		});
	});

	describe("screen state", () => {
		it("sets screen active state", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			participantStore.setParticipantScreenActive("user-1", true);

			expect(participantStore.findByUserId("user-1")!.screenActive).to.be.true;
		});

		(hasMediaStream ? it : it.skip)("sets screen stream", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			const mockStream = createMockMediaStream()!;
			participantStore.setParticipantScreenStream("user-1", mockStream);

			expect(participantStore.findByUserId("user-1")!.screenStream).to.equal(mockStream);
		});

		(hasMediaStream ? it : it.skip)("removes screen stream", () => {
			const participant = createMockParticipant("user-1");
			participant.screenStream = createMockMediaStream();
			participantStore.addParticipant(participant);

			participantStore.removeParticipantScreenStream("user-1");

			expect(participantStore.findByUserId("user-1")!.screenStream).to.be.null;
		});
	});

	describe("stream state", () => {
		it("sets participant stream state", () => {
			const participant = createMockParticipant("user-1");
			participantStore.addParticipant(participant);

			participantStore.setParticipantStreamState("user-1", State.CONNECTED);

			expect(participantStore.findByUserId("user-1")!.streamState).to.equal(State.CONNECTED);
		});

		it("gets participants with active stream", () => {
			const p1 = createMockParticipant("user-1");
			const p2 = createMockParticipant("user-2");
			p2.streamState = State.CONNECTED;

			participantStore.addParticipant(p1);
			participantStore.addParticipant(p2);

			const withStream = participantStore.getWithStream();

			expect(withStream).to.have.length(1);
			expect(withStream[0].userId).to.equal("user-2");
		});
	});

	describe("screen sharing queries", () => {
		(hasMediaStream ? it : it.skip)("gets participant with screen stream", () => {
			const p1 = createMockParticipant("user-1");
			const p2 = createMockParticipant("user-2");
			p2.screenStream = createMockMediaStream();

			participantStore.addParticipant(p1);
			participantStore.addParticipant(p2);

			const withScreen = participantStore.getWithScreenStream();

			expect(withScreen).to.exist;
			expect(withScreen!.userId).to.equal("user-2");
		});

		it("returns undefined when no screen stream", () => {
			participantStore.addParticipant(createMockParticipant("user-1"));

			const withScreen = participantStore.getWithScreenStream();

			expect(withScreen).to.be.undefined;
		});

		(hasMediaStream ? it : it.skip)("checks if any participant has active screen stream", () => {
			const p1 = createMockParticipant("user-1");
			p1.screenStream = createMockMediaStream();
			p1.screenActive = true;

			participantStore.addParticipant(p1);

			expect(participantStore.hasScreenStream()).to.be.true;
		});

		(hasMediaStream ? it : it.skip)("returns false when screen stream exists but not active", () => {
			const p1 = createMockParticipant("user-1");
			p1.screenStream = createMockMediaStream();
			p1.screenActive = false;

			participantStore.addParticipant(p1);

			expect(participantStore.hasScreenStream()).to.be.false;
		});
	});

	describe("reset", () => {
		it("clears all participants", () => {
			participantStore.addParticipant(createMockParticipant("user-1"));
			participantStore.addParticipant(createMockParticipant("user-2"));

			participantStore.reset();

			expect(participantStore.count).to.equal(0);
		});
	});

	describe("error handling", () => {
		it("logs error when setting microphone active for non-existent user", () => {
			// Should not throw, just log error
			participantStore.setParticipantMicrophoneActive("non-existent", true);
		});

		(hasMediaStream ? it : it.skip)("logs error when setting camera stream for non-existent user", () => {
			// Should not throw, just log error
			participantStore.setParticipantCameraStream("non-existent", createMockMediaStream()!);
		});
	});
});

