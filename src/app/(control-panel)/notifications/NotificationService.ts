import apiFetch from '@/utils/apiFetch';
import { ApiResponse } from '@/utils/types';

const endpoint = '/Notification';

export interface UserWithFcmToken {
    id: number;
    name: string;
    email: string;
    fcmToken?: string;
    isActive: boolean;
}

export interface NotificationRequest {
    title: string;
    description: string;
    userIds: number[];
}

export interface MobileNotificationDto {
    id: number;
    title: string;
    description: string;
    created: string;
    sentToUsers: number;
    status: 'sent' | 'pending' | 'failed';
    audiencia?: AudienceNotification;
    companyId?: number;
    blockId?: number;
}

export interface PaginatedNotificationsDto {
    items: MobileNotificationDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export enum AudienceNotification {
    All = 0,
    Company = 1,
    InTheCamp = 2,
    InTheCampByCompany = 3,
    InTheCampByBlock = 4
}

export interface GetNotificationsParams {
    audiencia?: AudienceNotification;
    companyId?: number;
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
}

export interface CreateMobileNotificationCommand {
    Title: string;
    Description: string;
    Audiencia: AudienceNotification;
    CompanyId?: number | null;
    BlockId?: number | null;
}

export const createMobileNotification = async (command: CreateMobileNotificationCommand): Promise<ApiResponse<number>> => {
    try {
        const response = await apiFetch(`${endpoint}/mobile`, {
            method: 'POST',
            body: JSON.stringify(command),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating mobile notification:', error);
        return {
            succeeded: false,
            data: 0,
            errors: ['Error al crear la notificación móvil'],
            message: []
        };
    }
};

export const createNotifications = async (request: NotificationRequest): Promise<ApiResponse<boolean>> => {
    try {
        const response = await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(request),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating notifications:', error);
        return {
            succeeded: false,
            data: false,
            errors: ['Error al crear las notificaciones'],
            message: []
        };
    }
};

export const getNotifications = async (
    params: GetNotificationsParams = {}
): Promise<ApiResponse<PaginatedNotificationsDto>> => {
    const searchParams = new URLSearchParams();
    
    searchParams.append('pageNumber', String(params.pageNumber ?? 1));
    searchParams.append('pageSize', String(params.pageSize ?? 10));
    
    if (params.audiencia !== undefined) {
        searchParams.append('audiencia', params.audiencia.toString());
    }
    if (params.companyId) {
        searchParams.append('companyId', params.companyId.toString());
    }
    if (params.searchTerm && params.searchTerm.trim()) {
        searchParams.append('searchTerm', params.searchTerm.trim());
    }

    try {
        const response = await apiFetch(`${endpoint}?${searchParams.toString()}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting notifications:', error);
        return {
            succeeded: false,
            data: {
                items: [],
                totalCount: 0,
                pageNumber: 1,
                pageSize: 10
            },
            errors: ['Error al obtener las notificaciones'],
            message: []
        };
    }
};

// Legacy class wrapper for backward compatibility
export class NotificationService {
    static async CreateMobileNotification(command: CreateMobileNotificationCommand) {
        return createMobileNotification(command);
    }

    static async CreateNotifications(request: NotificationRequest) {
        return createNotifications(request);
    }
    
    static async GetNotifications(params: GetNotificationsParams = {}) {
        return getNotifications(params);
    }
}
