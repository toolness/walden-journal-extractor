export interface GuiSleepRequest {
    kind: 'sleep';
    ms: number;
}

export interface GuiAddRequest {
    kind: 'add';
    a: number;
    b: number;
}

export type GuiRequest = GuiSleepRequest | GuiAddRequest;

export interface GuiNullResponse {
    kind: 'null';
}

export interface GuiNumberResponse {
    kind: 'number';
    value: number;
}

export type GuiResponse = GuiNullResponse | GuiNumberResponse;

export interface GuiRequestWrapper {
    id: number;
    payload: GuiRequest;
}

export interface GuiResponseSuccess {
    kind: 'success';
    id: number;
    payload: GuiResponse;
}

export interface GuiResponseError {
    kind: 'error';
    id: number;
    message: string;
}

export type GuiResponseWrapper = GuiResponseSuccess | GuiResponseError;
