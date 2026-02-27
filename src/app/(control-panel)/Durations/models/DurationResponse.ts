export interface DurationResponse {
    id: number;
    description: string;
    days: number;
    created: string;
}

export interface DurationRequest {
    Description: string;
    Days: string;
}

export interface DurationUpdateRequest extends DurationRequest {
    id: number;
}
