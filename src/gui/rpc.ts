export interface GuiRequest {
    ms: number;
    id: number;
}

export interface GuiResponse {
    id: number;
    error: string | null;
}
