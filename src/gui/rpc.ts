export interface GuiRequest {
    ms: number;
}

export interface GuiResponse {
}

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
