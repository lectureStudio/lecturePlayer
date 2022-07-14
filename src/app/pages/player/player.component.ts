import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";
import {Router} from "@angular/router";
import {StreamPageSelectedAction} from "../../action/stream.page.selected.action";
import {PageAction} from "../../action/page.action";
import {StreamDocumentSelectedAction} from "../../action/stream.document.selected.action";
import {StreamAction} from "../../action/stream.action";
import {StreamPagePlaybackAction} from "../../action/stream.playback.action";
import {StreamDocumentClosedAction} from "../../action/stream.document.closed.action";
import {WhiteboardDocument} from "../../model/whiteboard.document";
import {StreamDocumentCreatedAction} from "../../action/stream.document.created.action";
import {StreamActionParser} from "../../action/parser/stream.action.parser";
import {ProgressiveDataView} from "../../action/parser/progressive-data-view";
import {CourseStateDocument} from "../../model/course-state-document";
import {SlideDocument} from "../../model/document";
import {CourseStateService} from "../../services/course.service";
import {PlaybackService} from "../../services/playback.service";
import {PlaybackModel} from "../../model/playback-model";
import {DocumentViewComponent} from "../../components/document-view/document-view.component";
import {DocumentType} from "../../model/document.type";
import {StreamPageDeletedAction} from "../../action/stream.page.deleted.action";
import {StreamPageCreatedAction} from "../../action/stream.page.created.action";

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

    public isSelectingMicrophone = false;
    public isSelectingCamera = false;
    public isSelectingViewMode = false;

    @ViewChild('microphoneSelection')
    private microphoneSelection: ElementRef;

    @ViewChild('cameraSelection')
    private cameraSelection: ElementRef;

    @ViewChild('viewModeSelection')
    private viewModeSelection: ElementRef;

    @ViewChild('slideView', {read: DocumentViewComponent}) slideView: DocumentViewComponent;

    public chosenViewMode = 'gallery';

    private prevViewMode = 'gallery';
    private screenShareActive = false;

    public availableViewModes = {
        gallery: 'Gallery view',
        speaker: 'Speaker view'
    }

    private streamActionBuffer: {
        docId: bigint;
        bufferedActions: StreamAction[];
    } | null;

    private courseStateService: CourseStateService;
    private playbackService: PlaybackService;

    private playbackModel: PlaybackModel;

    constructor(public janusService: JanusService, private router: Router,
    ) {
        this.courseStateService = new CourseStateService("fastrootserver.de");
        this.playbackModel = new PlaybackModel();
        this.playbackService = new PlaybackService(this.playbackModel);
    }

    ngOnInit(): void {
        this.janusService.start();
        this.janusService.setOnData((data: ArrayBuffer) => {
            if (data instanceof Blob) {
                // Firefox...
                data.arrayBuffer().then(buffer => {
                    this.processData(buffer);
                });
            } else {
                this.processData(data);
            }
        });

        document.addEventListener('click', () => {
            this.isSelectingCamera = false; // TODO refactor, see below
            this.isSelectingMicrophone = false;
            this.isSelectingViewMode = false;
        })

        this.janusService.screenshareStateSubject.subscribe(val => {
            if (val === "start") {
                if (!this.screenShareActive) {
                    this.prevViewMode = this.chosenViewMode;
                    this.chosenViewMode = 'speaker';
                    this.screenShareActive = true;
                }
            } else {
                if (this.screenShareActive) {
                    this.chosenViewMode = this.prevViewMode;
                    this.screenShareActive = false;
                }
            }
        });

        const fakeDoc = {
            documentName: 'CourseStateDoc',
            documentId: BigInt(0),
            documentFile: '/assets/sample.pdf',
            type: 'type',
            activePage: {
                pageNumber: 0
            },
            pages: new Map([[0, {pageNumber: 0}]])
        };


        // @ts-ignore
        this.courseStateService.getStateDocument(this.janusService.myRoomId, {
            documentFile: '/assets/sample.pdf',
            documentName: 'Dokument'
        })
            .then((doc: SlideDocument) => {
                doc.setDocumentId(BigInt(0));
                this.playbackService.addDocument(doc);

                this.playbackService.initialize(this.slideView, {
                    documentMap: new Map([[BigInt(0), fakeDoc]]),
                    avtiveDocument: fakeDoc
                }, [doc], BigInt(0));

                this.flushActionBuffer(doc.getDocumentId());
            })
            .catch(error => {
                console.error('(SlideDocumentError)', error);
            });

        console.log('(SlideDocument) Told it to load');
    }

    ngOnDestroy() {
        this.janusService.end();
    }

    get audioStreams() {
        return Object.values(this.janusService.remoteTracks).filter(e => e.stream.getAudioTracks().length > 0);
    }

    get videoStreams() {
        return Object.values({...this.janusService.remoteTracks, ...this.janusService.localTracks}).filter(e => e.stream.getVideoTracks().length > 0);
    }

    leave() {
        this.janusService.end();
        this.router.navigate(['/']);
    }

    showAvailableMicrophones(event: MouseEvent) {
        event.stopPropagation();

        console.log(event);
        console.log(event.target);

        // @ts-ignore
        const rect = event.target.getBoundingClientRect();

        // @ts-ignore
        const osL = rect.left;
        // @ts-ignore
        const osT = rect.top;

        this.isSelectingMicrophone = true;
        this.isSelectingCamera = false;
        this.microphoneSelection.nativeElement.style.top = osT + 'px';
        this.microphoneSelection.nativeElement.style.left = osL + 'px';
    }

    showAvailableCameras(event: MouseEvent) {
        event.stopPropagation();

        // @ts-ignore
        const rect = event.target.getBoundingClientRect();

        // @ts-ignore
        const osL = rect.left;
        // @ts-ignore
        const osT = rect.top;

        this.isSelectingCamera = true;
        this.isSelectingMicrophone = false;
        this.cameraSelection.nativeElement.style.top = osT + 'px';
        this.cameraSelection.nativeElement.style.left = osL + 'px';
    }

    showAvailableViewModes(event: MouseEvent) {
        event.stopPropagation();

        // @ts-ignore
        const rect = event.target.getBoundingClientRect();

        // @ts-ignore
        const osL = rect.left;
        // @ts-ignore
        const osT = rect.top;

        this.isSelectingCamera = false; // TODO Refactor this, make an actual component instead of spamming booleans and methods
        this.isSelectingMicrophone = false;
        this.isSelectingViewMode = true;
        this.viewModeSelection.nativeElement.style.top = osT + 'px';
        this.viewModeSelection.nativeElement.style.left = osL + 'px';
    }

    private processData(data: ArrayBuffer) {
        if (!this.janusService.myRoomId) {
            return;
        }

        const dataView = new ProgressiveDataView(data);
        const length = dataView.getInt32();
        const type = dataView.getInt8();

        const action = StreamActionParser.parse(dataView, type, length);

        if (action instanceof StreamDocumentSelectedAction) {
            if (!this.bufferAction(action, action.documentId)) {
                this.playbackService.selectDocument(action.documentId);
            }
        } else if (action instanceof StreamDocumentCreatedAction) {
            if (action.documentType === 1) {
                const slideDoc = new WhiteboardDocument();
                slideDoc.setDocumentId(action.documentId);

                this.playbackService.addDocument(slideDoc);
            } else {
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

                this.courseStateService.getStateDocument(this.janusService.myRoomId, stateDoc)
                    .then((doc: SlideDocument) => {
                        this.playbackService.addDocument(doc);

                        this.flushActionBuffer(doc.getDocumentId());
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        } else if (action instanceof StreamDocumentClosedAction) {
            this.playbackService.removeDocument(action.documentId);
        } else if (action instanceof StreamPageSelectedAction) {
            if (!this.bufferAction(action, action.documentId)) {
                const pageAction = new PageAction(action.pageNumber);
                pageAction.timestamp = 0;

                this.playbackService.addAction(pageAction);
            }
        } else if (action instanceof StreamPagePlaybackAction) {
            if (!this.bufferAction(action, action.documentId)) {
                this.playbackService.addAction(action.action);
            }
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
                } else if (action instanceof StreamPageSelectedAction) {
                    const pageAction = new PageAction(action.pageNumber);
                    pageAction.timestamp = 0;

                    this.playbackService.addAction(pageAction);
                } else if (action instanceof StreamPagePlaybackAction) {
                    this.playbackService.addAction(action.action);
                }
            });
        }

        this.streamActionBuffer = null;
    }
}
