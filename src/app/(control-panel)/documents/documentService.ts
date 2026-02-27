import apiService from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';

const endpoint = '/Documents';

export interface Document {
    id: number;
    name: string;
    size: string;
    fileName: string;
    uri: string;
    companyId?: number;
    companyName?: string;
    created: string;
    createdBy: string;
    lastModified: string;
    lastModifiedBy: string;
}

export interface DeleteDocumentRequest {
    fileName: string;
}

export interface DownloadDocumentRequest {
    fileName: string;
}

export interface UploadDocumentResponse {
    fileName: string;
    message?: string;
}

/**
 * Upload a document
 */
export const uploadDocument = async (file: File, name?: string): Promise<ApiResponse<UploadDocumentResponse>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        // The backend expects the optional `name` as a query parameter ([FromQuery] string? name)
        const config: any = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        if (name && name.trim() !== '') {
            config.params = { name: name.trim() };
        }

        const response = await apiService.post<ApiResponse<UploadDocumentResponse>>(endpoint, formData, config);

        return response.data ?? {
            data: undefined,
            succeeded: false,
            message: ['Error al subir el documento'],
            errors: ['Error al subir el documento']
        };
    } catch (error) {
        console.error('Error in uploadDocument:', error);
        return {
            data: undefined,
            succeeded: false,
            message: ['Error al subir el documento'],
            errors: ['Error al subir el documento']
        };
    }
};

/**
 * Get all documents
 */
export const getAllDocuments = async (): Promise<ApiResponse<Document[]>> => {
    try {
        const response = await apiService.get<ApiResponse<Document[]>>(endpoint);
        return response.data ?? {
            data: [],
            succeeded: false,
            message: ['Error al obtener documentos'],
            errors: ['Error al obtener documentos']
        };
    } catch (error) {
        console.error('Error in getAllDocuments:', error);
        return {
            data: [],
            succeeded: false,
            message: ['Error al obtener documentos'],
            errors: ['Error al obtener documentos']
        };
    }
};

/**
 * Delete a document by ID
 */
export const deleteDocument = async (fileName: string): Promise<ApiResponse<void>> => {
    try {
        const request: DeleteDocumentRequest = { fileName };
        const response = await apiService.delete<ApiResponse<void>>(endpoint, {
            data: request
        });
        return response.data ?? {
            data: undefined,
            succeeded: false,
            message: ['Error al eliminar documento'],
            errors: ['Error al eliminar documento']
        };
    } catch (error) {
        console.error('Error in deleteDocument:', error);
        return {
            data: undefined,
            succeeded: false,
            message: ['Error al eliminar documento'],
            errors: ['Error al eliminar documento']
        };
    }
};

/**
 * Download a document by ID
 */
export const downloadDocument = async (fileName: string): Promise<void> => {
    try {
        const request: DownloadDocumentRequest = { fileName };
        await apiService.download(`${endpoint}/download`, request);
    } catch (error) {
        console.error('Error in downloadDocument:', error);
        throw new Error('Error al descargar el documento');
    }
};
