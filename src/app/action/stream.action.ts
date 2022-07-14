import {StreamActionType} from "./stream.action-type";

abstract class StreamAction {

    public abstract getType(): StreamActionType;

    public abstract toByteBuffer(): ArrayBuffer;

    public createDataView(payloadLength: number): DataView {
        // Create ArrayBuffer with 5 Bytes for the header and length Bytes for the payload
        let buffer = new ArrayBuffer(5 + payloadLength);
        let dataView = new DataView(buffer);

        // Write header.
        dataView.setInt32(0, payloadLength);
        dataView.setInt8(4, this.getType());

        return dataView;
    }

}

export { StreamAction };