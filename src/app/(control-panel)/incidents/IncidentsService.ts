import apiFetch from "@/utils/apiFetch";
import { ApiResponse } from "@/utils/types";

const endpoint = "/Incidents";

export interface IncidentItem {
    id: number;
    title: string;
    description: string;
    status: number;
    roomId: number;
    roomNumber?: string;
    created: string;
    createdName?: string;
    imageBase64?: string | null;
    updated?: string;
    commentsResolution?: string | null;
}

export interface IncidentPaginatedResponse {
    items: IncidentItem[];
    totalCount: number;
}

export interface GetIncidentsParams {
    pageNumber?: number;
    pageSize?: number;
    roomId?: number | null;
    status?: number | null;
    searchTerm?: string;
}

export interface UpdateIncidentRequest {
    id: number;
    status: number;
    commentsResolution?: string | null;
}

export const getIncidents = async (
    params: GetIncidentsParams = {}
): Promise<ApiResponse<IncidentPaginatedResponse>> => {
    const searchParams = new URLSearchParams();

    searchParams.append("PageNumber", String(params.pageNumber ?? 1));
    searchParams.append("PageSize", String(params.pageSize ?? 10));

    if (params.roomId) {
        searchParams.append("RoomId", String(params.roomId));
    }

    if (params.status !== undefined && params.status !== null && params.status !== -1) {
        searchParams.append("Status", String(params.status));
    }

    if (params.searchTerm && params.searchTerm.trim()) {
        searchParams.append("SearchTerm", params.searchTerm.trim());
    }

    try {
        const response = await apiFetch(`${endpoint}?${searchParams.toString()}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching incidents:", error);
        return {
            succeeded: false,
            data: { items: [], totalCount: 0 },
            message: [],
            errors: ["Error fetching incidents"],
        };
    }
};

export const updateIncident = async (
    incidentId: number,
    payload: UpdateIncidentRequest
): Promise<ApiResponse<IncidentItem>> => {
    try {
        const response = await apiFetch(`${endpoint}/${incidentId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating incident:", error);
        return {
            succeeded: false,
            data: undefined,
            message: [],
            errors: ["Error updating incident"],
        };
    }
};

export const resolveIncident = async (
    incidentId: number,
    commentsResolution?: string | null
): Promise<ApiResponse<IncidentItem>> => {
    const payload: UpdateIncidentRequest = {
        id: incidentId,
        status: 1,
        commentsResolution: commentsResolution ?? null,
    };

    return updateIncident(incidentId, payload);
};
