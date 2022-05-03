import { ReactiveController } from "lit";
import { PageAction } from "../../action/page.action";
import { ProgressiveDataView } from "../../action/parser/progressive-data-view";
import { StreamActionParser } from "../../action/parser/stream.action.parser";
import { StreamAction } from "../../action/stream.action";
import { StreamDocumentClosedAction } from "../../action/stream.document.closed.action";
import { StreamDocumentCreatedAction } from "../../action/stream.document.created.action";
import { StreamDocumentSelectedAction } from "../../action/stream.document.selected.action";
import { StreamPageSelectedAction } from "../../action/stream.page.selected.action";
import { StreamPagePlaybackAction } from "../../action/stream.playback.action";
import { StreamSpeechPublishedAction } from "../../action/stream.speech.published.action";
import { CourseState } from "../../model/course-state";
import { CourseStateDocument } from "../../model/course-state-document";
import { SlideDocument } from "../../model/document";
import { WhiteboardDocument } from "../../model/whiteboard.document";
import { CourseStateService } from "../../service/course.service";
import { JanusService } from "../../service/janus.service";
import { PlaybackService } from "../../service/playback.service";
import { State } from "../../utils/state";
import { PlayerView } from "./player-view";

export class PlayerViewController implements ReactiveController {

	private readonly host: PlayerView;

	private streamActionBuffer: {
		docId: bigint;
		bufferedActions: StreamAction[];
	};

	private janusService: JanusService;

	private courseStateService: CourseStateService;

	private playbackService: PlaybackService;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);

		this.courseStateService = new CourseStateService("https://" + window.location.host);
		this.janusService = new JanusService("https://" + window.location.hostname + ":8089/janus");
		this.playbackService = new PlaybackService();

		this.janusService.addEventListener("speech-state", (e: CustomEvent) => {
			console.log("speech-state", e.detail);
		}, false);
		this.janusService.addEventListener("publisher-state", (e: CustomEvent) => {
			this.pushConnectionEvent(e.detail.connected ? State.CONNECTED : State.DISCONNECTED);
		}, false);
	}

	hostConnected() {
		this.connect()
			.then((courseState: CourseState) => {
				this.host.courseState = courseState;
				this.host.chatVisible = courseState.messageFeature !== null;
			})
			.catch(error => {
				console.error(error);

				this.pushConnectionEvent(State.DISCONNECTED);
			});
	}

	private pushConnectionEvent(state: State): void {
		const event = new CustomEvent("player-connection-state", {
			bubbles: true,
			composed: true,
			detail: state
		});

		this.host.dispatchEvent(event);
	}

	private connect(): Promise<CourseState> {
		return new Promise<CourseState>((resolve, reject) => {
			this.courseStateService.getCourseState(this.host.courseId)
				.then((courseState: CourseState) => {
					console.log("Course state", courseState);

					// Load all initially opened documents.
					const promises = [];

					for (const value of Object.values(courseState.documentMap)) {
						const promise = this.courseStateService.getStateDocument(this.host.courseId, value);

						promises.push(promise);
					}

					Promise.all(promises)
						.then(documents => {
							try {
								this.setDocuments(courseState, documents);
							}
							catch (e) {
								reject(e);
								return;
							}

							resolve(courseState);
						})
						.catch(error => {
							reject(error);
						});
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	private setDocuments(courseState: CourseState, documents: SlideDocument[]) {
		this.playbackService.initialize(this.host, courseState, documents);

		this.janusService.setRoomId(this.host.courseId);
		this.janusService.setPlayerView(this.host);
		this.janusService.setOnData((data: ArrayBuffer) => {
			if (data instanceof Blob) {
				// Firefox...
				data.arrayBuffer().then(buffer => {
					this.processData(buffer);
				});
			}
			else {
				this.processData(data);
			}
		});
		this.janusService.start();
	}

	private processData(data: ArrayBuffer) {
		const dataView = new ProgressiveDataView(data);
		const length = dataView.getInt32();
		const type = dataView.getInt8();

		const action = StreamActionParser.parse(dataView, type, length);

		if (action instanceof StreamDocumentSelectedAction) {
			if (!this.bufferAction(action, action.documentId)) {
				this.playbackService.selectDocument(action.documentId);
			}
		}
		else if (action instanceof StreamDocumentCreatedAction) {
			if (action.documentType === 1) {
				const slideDoc = new WhiteboardDocument();
				slideDoc.setDocumentId(action.documentId);

				this.playbackService.addDocument(slideDoc);
			}
			else {
				this.streamActionBuffer = {
					bufferedActions: [],
					docId: BigInt(action.documentId)
				};
				
				const stateDoc: CourseStateDocument = {
					activePage: null,
					documentFile: action.documentFile,
					documentId: action.documentId,
					documentName: action.documentTitle,
					pages: null,
					type: "pdf"
				};

				this.courseStateService.getStateDocument(this.host.courseId, stateDoc)
					.then((doc: SlideDocument) => {
						this.playbackService.addDocument(doc);

						this.flushActionBuffer(doc.getDocumentId());
					})
					.catch(error => {
						console.error(error);
					});
			}
		}
		else if (action instanceof StreamDocumentClosedAction) {
			this.playbackService.removeDocument(action.documentId);
		}
		else if (action instanceof StreamPageSelectedAction) {
			if (!this.bufferAction(action, action.documentId)) {
				const pageAction = new PageAction(action.pageNumber);
				pageAction.timestamp = 0;

				this.playbackService.addAction(pageAction);
			}
		}
		else if (action instanceof StreamPagePlaybackAction) {
			if (!this.bufferAction(action, action.documentId)) {
				this.playbackService.addAction(action.action);
			}
		}
		else if (action instanceof StreamSpeechPublishedAction) {
			this.janusService.addPeer(action.publisherId);
		}
	}

	private bufferAction(action: StreamAction, docId: bigint): boolean {
		if (this.streamActionBuffer && this.streamActionBuffer.docId === BigInt(docId)) {
			this.streamActionBuffer.bufferedActions.push(action);
			return true;
		}

		return false;
	}

	private flushActionBuffer(docId: bigint): void {
		if (this.streamActionBuffer && this.streamActionBuffer.docId === BigInt(docId)) {
			this.streamActionBuffer.bufferedActions.forEach(action => {
				if (action instanceof StreamDocumentSelectedAction) {
					this.playbackService.selectDocument(action.documentId);
				}
				else if (action instanceof StreamPageSelectedAction) {
					const pageAction = new PageAction(action.pageNumber);
					pageAction.timestamp = 0;
		
					this.playbackService.addAction(pageAction);
				}
				else if (action instanceof StreamPagePlaybackAction) {
					this.playbackService.addAction(action.action);
				}
			});
		}

		this.streamActionBuffer = null;
	}
}