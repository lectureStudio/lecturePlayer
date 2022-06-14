import './style.css';

export * from './extension';
export * from './component';
export * from './view';

const pdfjs = require('pdfjs-dist');
const PdfjsWorker = require("worker-loader?esModule=false&filename=[name].js!pdfjs-dist/build/pdf.worker.js");

if (typeof window !== "undefined" && "Worker" in window) {
	pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();
}

import { CourseState } from './model/course-state';
import { CourseStateService } from './service/course.service';
import { SlideDocument } from './model/document';
import { JanusService } from './service/janus.service';
import { ProgressiveDataView } from './action/parser/progressive-data-view';
import { StreamActionParser } from './action/parser/stream.action.parser';
import { StreamPagePlaybackAction } from './action/stream.playback.action';
import { StreamPageSelectedAction } from './action/stream.page.selected.action';
import { PageAction } from './action/page.action';
import { PlayerView } from './view';
import { PlaybackService } from './service/playback.service';
import { StreamDocumentSelectedAction } from './action/stream.document.selected.action';
import { Observer } from './utils/observable';
import { PlaybackModel } from './model/playback-model';
import { StreamSpeechPublishedAction } from './action/stream.speech.published.action';
import { StreamDocumentCreatedAction } from './action/stream.document.created.action';
import { WhiteboardDocument } from './model/whiteboard.document';
import { CourseStateDocument } from './model/course-state-document';
import { StreamDocumentClosedAction } from './action/stream.document.closed.action';
import { StreamAction } from './action/stream.action';
import { StreamPageDeletedAction } from './action/stream.page.deleted.action';
import { PageDeleteAction } from './action/page-delete.action';

class LecturePlayer {

	private readonly playbackModel: PlaybackModel;

	private streamActionBuffer: {
		docId: bigint;
		bufferedActions: StreamAction[];
	};

	private courseStateService: CourseStateService;

	private janusService: JanusService;

	private playbackService: PlaybackService;

	private container: HTMLElement;

	private onSettingsConsumer: Observer<boolean>;

	private roomId: number;

	private startTime: bigint;


	constructor() {
		this.playbackModel = new PlaybackModel();
		this.courseStateService = new CourseStateService("https://" + window.location.host);
		this.janusService = new JanusService("https://" + window.location.hostname + ":8089/janus", this.playbackModel);
		this.playbackService = new PlaybackService(this.playbackModel);
	}

	start(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.courseStateService.getCourseState(this.roomId)
				.then((courseState: CourseState) => {
					console.log("Course state", courseState);

					// Load all initially opened documents.
					const promises = [];

					for (const value of Object.values(courseState.documentMap)) {
						const promise = this.courseStateService.getStateDocument(this.roomId, value);

						promises.push(promise);
					}

					Promise.all(promises)
						.then(documents => {
							// console.log(documents);

							try {
								this.setDocuments(courseState, documents);
							}
							catch (e) {
								reject(e);
								return;
							}

							resolve();
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

	addPeer(peerId: BigInt) {
		this.janusService.addPeer(peerId);
	}

	startSpeech(deviceConstraints: any): void {
		this.janusService.startSpeech(deviceConstraints);
	}

	stopSpeech(): void {
		this.janusService.stopSpeech();
		this.setRaiseHand(false);
	}

	setDeviceConstraints(deviceConstraints: any): void {
		this.janusService.setDeviceConstraints(deviceConstraints);
	}

	setContainer(container: HTMLElement): void {
		this.container = container;
	}

	setContainerA(element: HTMLElement): void {
		this.playbackModel.elementAProperty.value = element;
	}

	setOnError(consumer: Observer<any>): void {
		this.janusService.setOnError(consumer);
	}

	setOnConnectedState(consumer: Observer<boolean>): void {
		this.playbackModel.webrtcConnectedProperty.subscribe(consumer);
	}

	setOnConnectedSpeechState(consumer: Observer<boolean>): void {
		this.playbackModel.webrtcPublisherConnectedProperty.subscribe(consumer);
	}

	setOnSettings(consumer: Observer<boolean>): void {
		this.onSettingsConsumer = consumer;
	}

	setOnRaiseHand(consumer: Observer<boolean>): void {
		this.playbackModel.raisedHandProperty.subscribe(consumer);
	}

	setOnShowQuiz(consumer: Observer<boolean>): void {
		this.playbackModel.showQuizProperty.subscribe(consumer);
	}

	setShowQuiz(show: boolean): void {
		this.playbackModel.showQuiz = show;
	}

	setQuizActive(active: boolean): void {
		this.playbackModel.showQuizActive = active;
	}

	setRaiseHand(raise: boolean): void {
		this.playbackModel.raisedHand = raise;
	}

	setStartTime(startTime: bigint) {
		this.startTime = startTime;
	}

	setMuted(muted: boolean) {
		this.playbackModel.setMuted(muted);
	}

	setUserId(userId: string) {
		this.janusService.setUserId(userId);
	}

	setRoomId(id: number) {
		this.roomId = id;

		this.janusService.setRoomId(id);
	}

	private setDocuments(courseState: CourseState, documents: SlideDocument[]) {
		const playerView = new PlayerView(this.playbackModel);

		this.setView(playerView);

		this.playbackService.initialize(playerView, courseState, documents, this.startTime);

		this.janusService.setPlayerView(playerView);
		this.janusService.setOnData(this.onData.bind(this));
		this.janusService.start();
	}

	private onData(data: ArrayBuffer) {
		if (data instanceof Blob) {
			// Firefox...
			data.arrayBuffer().then(buffer => {
				this.processData(buffer);
			});
		}
		else {
			this.processData(data);
		}
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

				this.courseStateService.getStateDocument(this.roomId, stateDoc)
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
		else if (action instanceof StreamPageDeletedAction) {
			if (!this.bufferAction(action, action.documentId)) {
				const pageAction = new PageDeleteAction(action.pageNumber, action.documentId);
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

	private setView(view: PlayerView): void {
		if (!(view instanceof HTMLElement)) {
			throw new Error("View is expected to be of type HTMLElement");
		}

		if (this.container.firstElementChild) {
			this.container.removeChild(this.container.firstElementChild);
		}

		this.container.appendChild(view);

		if (this.onSettingsConsumer) {
			view.setOnSettings(this.onSettingsConsumer);
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

export { LecturePlayer };