declare type BlobURL = string;
declare type BlobURLArray = Array<BlobURL>;
declare type TabID = Readonly<number>;
declare type RuntimeID = Readonly<typeof chrome.runtime.id>;

declare interface RobbiResponse {
    result: string;
    extraInfo: string | null;
}

declare type RobbiResultReturn = [RobbiResponse['result'], BlobURL];

declare type InjectResult<T> = {
    documentId: string;
    frameId: number;
    result: T;
};

type PopupStartMessageContent = {
    type: 'start';
    payload: {
        runtimeId: RuntimeID;
    };
};

type PopupStopMessageContent = {
    type: 'stop';
};

declare type PopupMessageContent = PopupStartMessageContent | PopupStopMessageContent;
