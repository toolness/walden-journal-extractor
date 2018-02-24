export interface GuiRequest {
    id: number;
    method: keyof RpcMethods;
    args: any[];
}

export interface GuiResponseSuccess {
    kind: 'success';
    id: number;
    returnValue: any;
}

export interface GuiResponseError {
    kind: 'error';
    id: number;
    message: string;
}

export type GuiResponse = GuiResponseSuccess | GuiResponseError;

export interface RpcMethods {
    sleep(timeout: number): Promise<void>;
    add(a: number, b: number): Promise<number>;
}
