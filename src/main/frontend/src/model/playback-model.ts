import { Property } from "../utils/property";
import { ExecutableState } from "../utils/executable-state";

class PlaybackModel {

	private readonly _elementA = new Property<HTMLElement>();

	private readonly _state = new Property<ExecutableState>();

	private readonly _raisedHand = new Property<boolean>();

	private readonly _showQuiz = new Property<boolean>();

	private readonly _showChat = new Property<boolean>();

	private readonly _showQuizActive = new Property<boolean>();

	private readonly _webrtcConnected = new Property<boolean>();

	private readonly _webrtcPublisherConnected = new Property<boolean>();

	private readonly _videoAvailable = new Property<boolean>();

	private readonly _mainVideoAvailable = new Property<boolean>();

	private readonly _localVideoAvailable = new Property<boolean>();

	private readonly _selectedPageIndex = new Property<number>();

	private readonly _duration = new Property<number>();

	private readonly _time = new Property<number>();

	private readonly _volume = new Property<number>();

	private readonly _muted = new Property<boolean>();


	get elementAProperty() {
		return this._elementA;
	}

	get selectedPageIndexProperty() {
		return this._selectedPageIndex;
	}

	get selectedPageIndex() {
		return this._selectedPageIndex.value;
	}

	set selectedPageIndex(index: number) {
		this._selectedPageIndex.value = index;
	}

	get stateProperty() {
		return this._state;
	}

	get raisedHandProperty() {
		return this._raisedHand;
	}

	set raisedHand(raised: boolean) {
		this._raisedHand.value = raised;
	}

	get showChatProperty() {
		return this._showChat;
	}

	get showChat() {
		return this._showChat.value;
	}

	set showChat(show: boolean) {
		this._showChat.value = show;
	}

	get showQuizProperty() {
		return this._showQuiz;
	}

	set showQuiz(show: boolean) {
		this._showQuiz.value = show;
	}

	get showQuizActiveProperty() {
		return this._showQuizActive;
	}

	set showQuizActive(active: boolean) {
		this._showQuizActive.value = active;
	}

	get webrtcConnectedProperty() {
		return this._webrtcConnected;
	}

	set webrtcConnected(connected: boolean) {
		this._webrtcConnected.value = connected;
	}

	get webrtcPublisherConnectedProperty() {
		return this._webrtcPublisherConnected;
	}

	set webrtcPublisherConnected(connected: boolean) {
		this._webrtcPublisherConnected.value = connected;
	}

	get videoAvailableProperty() {
		return this._videoAvailable;
	}

	get videoAvailable() {
		return this._videoAvailable.value;
	}

	set videoAvailable(available: boolean) {
		this._videoAvailable.value = available;
	}

	get mainVideoAvailableProperty() {
		return this._mainVideoAvailable;
	}

	get mainVideoAvailable() {
		return this._mainVideoAvailable.value;
	}

	set mainVideoAvailable(available: boolean) {
		this._mainVideoAvailable.value = available;
	}

	get localVideoAvailableProperty() {
		return this._localVideoAvailable;
	}

	get localVideoAvailable() {
		return this._localVideoAvailable.value;
	}

	set localVideoAvailable(available: boolean) {
		this._localVideoAvailable.value = available;
	}

	getState(): ExecutableState {
		return this._state.value;
	}

	setState(state: ExecutableState): void {
		this._state.value = state;
	}

	get durationProperty() {
		return this._duration;
	}

	getDuration(): number {
		return this._duration.value;
	}

	setDuration(duration: number): void {
		this._duration.value = duration;
	}

	get timeProperty() {
		return this._time;
	}

	getTime(): number {
		return this._time.value;
	}

	setTime(time: number): void {
		this._time.value = time;
	}

	get volumeProperty() {
		return this._volume;
	}

	getVolume(): number {
		return this._volume.value;
	}

	setVolume(volume: number): void {
		this._volume.value = volume;
	}

	get mutedProperty() {
		return this._muted;
	}

	getMuted(): boolean {
		return this._muted.value;
	}

	setMuted(muted: boolean): void {
		this._muted.value = muted;
	}
}

export { PlaybackModel };