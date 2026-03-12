import axios from 'axios';
import { saveAs } from 'file-saver';
import { ApiResponse, PaginatedResponse } from './types';
import { globalHeaders, API_BASE_URL } from './apiFetch';
//import { Paths } from "../router/paths"

const serviceInstance = axios.create({
	headers: { 
		'X-Requested-With': 'XMLHttpRequest',
		'Content-Type': 'application/json'
	},
	withCredentials: true,
	validateStatus: (status) => {
		return status < 500;
	},
	baseURL: API_BASE_URL
});

serviceInstance.interceptors.request.use((request) => {
	request.withCredentials = true;
	// Add globalHeaders to each request for authentication
	Object.entries(globalHeaders).forEach(([key, value]) => {
		request.headers.set(key, value);
	});
	return request;
});

serviceInstance.interceptors.response.use(
	(response) => {
		// Handle module access errors
		if (response.data && !response.data.succeeded && response.data.errors) {
			const errors = response.data.errors;
			
			// Check for ACTIVITY_MODULE_DISABLED error - only if errors is an array
			if (Array.isArray(errors) && errors.includes('ACTIVITY_MODULE_DISABLED')) {
				console.log('🔒 Activity module disabled - emitting event');
				window.dispatchEvent(
					new CustomEvent('APP_MODULE_STATUS_CHANGED', {
						detail: { module: 'activities', enabled: false }
					})
				);
			}
			
			// Check for STOCK_MODULE_DISABLED error - only if errors is an array
			if (Array.isArray(errors) && errors.includes('STOCK_MODULE_DISABLED')) {
				console.log('🔒 Stock module disabled - emitting event');
				window.dispatchEvent(
					new CustomEvent('APP_MODULE_STATUS_CHANGED', {
						detail: { module: 'stock', enabled: false }
					})
				);
			}
		}
		
		// Handle successful activities fetches - ensure module is enabled
		if (response.data?.succeeded && response.config?.url?.includes('/activities') && Array.isArray(response.data.data)) {
			console.log('✅ Activities loaded successfully - emitting event');
			window.dispatchEvent(
				new CustomEvent('APP_MODULE_STATUS_CHANGED', {
					detail: { module: 'activities', enabled: true }
				})
			);
		}
		
		// Handle successful stock fetches - ensure module is enabled
		if (response.data?.succeeded && (
			response.config?.url?.includes('/stocks') ||
			response.config?.url?.includes('/transfers') ||
			response.config?.url?.includes('/items') ||
			response.config?.url?.includes('/itemunitofmeasure') ||
			response.config?.url?.includes('/lots') ||
			response.config?.url?.includes('/suppliers') ||
			response.config?.url?.includes('/warehouses') ||
			response.config?.url?.includes('/locations') ||
			response.config?.url?.includes('/movementreasons') ||
			response.config?.url?.includes('/movements') ||
			response.config?.url?.includes('/supplierlots')
		)) {
			console.log('✅ Stock module data loaded successfully - emitting event');
			window.dispatchEvent(
				new CustomEvent('APP_MODULE_STATUS_CHANGED', {
					detail: { module: 'stock', enabled: true }
				})
			);
		}
		
		if (response.status === 401) {
			//window.location.href = Paths.Unauthorized
		}
		return response;
	},
	(error) => {
		if (error.response) {
			// El servidor respondió con un código de estado fuera del rango 2xx
			console.error('Error de respuesta:', error.response.data);
		} else if (error.request) {
			// La petición fue hecha pero no se recibió respuesta
			console.error('Error de red:', error.request);
		} else {
			// Algo sucedió al configurar la petición
			console.error('Error:', error.message);
		}
		return Promise.reject(error);
	}
);

const apiUpload = (url: string, body: any, file: any, onUploadProgress: any) => {
	const formData = new FormData();

	if (body) {
		body.map((element: any) => {
			formData.append(element.name, element.value);
		});
	}

	formData.append('file', file);

	return serviceInstance.post(url, formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		},
		onUploadProgress
	});
};

const apiDownload = (url: string, body: any) => {
	body.responseType = 'blob';
	return serviceInstance
		.post(url, body, {
			responseType: 'blob'
		})
		.then(async (response) => {
			let result = response.data;

			if (result?.type == 'application/json') {
				result = JSON.parse(await result.text());

				if (Array.isArray(result)) {
					throw new Error(result[0]);
				}
			}

			if (response?.status != 200) throw new Error('Download error');

			// Extract filename from content-disposition header
			const contentDisposition = response.headers['content-disposition'];
			let filename = 'download';
			
			// Debug: Log headers to see what's coming from the server
			
			if (contentDisposition) {
				// Try different patterns for filename extraction
				const filenameRegex = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i;
				const filenameMatch = contentDisposition.match(filenameRegex);
				if (filenameMatch && filenameMatch[1]) {
					filename = decodeURIComponent(filenameMatch[1]);
				}
			}
			
			// Fallback to filename header if content-disposition is not present
			if (response.headers.filename) {
				filename = response.headers.filename;
			}
			
			// Use fileName from request body if available and no filename in headers
			if ((!contentDisposition && !response.headers.filename) && body?.fileName) {
				filename = body.fileName;
			}
			

			// Create blob with correct content type
			const contentType = response.headers['content-type'] || response.data.type;
			const blob = new Blob([response.data], { type: contentType });
			saveAs(blob, filename);
			return result;
		});
};

export const defaultApiError: ApiResponse<any> = {
	data: undefined,
	succeeded: false,
	message: ['Unknown error'],
	errors: ['Unknown error']
};

export const defaultPaginatedApiError: PaginatedResponse<any> = {
	data: undefined,
	succeeded: false,
	message: ['Unknown error'],
	errors: ['Unknown error'],
	totalCount: 0
};

// Generic CRUD service methods
export const genericService = {
    getAll: async <T>(endpoint: string): Promise<ApiResponse<T[]>> => {
        try {
            const { data } = await serviceInstance.get<ApiResponse<T[]>>(endpoint);
            return data ?? defaultApiError;
        } catch (error) {
            console.error('Error in getAll:', error);
            return defaultApiError;
        }
    },

	get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
        try {
            const { data } = await serviceInstance.get<ApiResponse<T>>(endpoint);
            return data ?? defaultApiError;
        } catch (error) {
            console.error('Error in get:', error);
            return defaultApiError;
        }
    },

    getById: async <T>(endpoint: string, id: number): Promise<ApiResponse<T>> => {
        try {
            const { data } = await serviceInstance.get<ApiResponse<T>>(`${endpoint}/${id}`);
            return data ?? defaultApiError;
        } catch (error) {
            console.error('Error in getById:', error);
            return defaultApiError;
        }
    },

    create: async <T, D>(endpoint: string, entityData: D): Promise<ApiResponse<T>> => {
        try {
            const { data } = await serviceInstance.post<ApiResponse<T>>(endpoint, entityData);
            return data ?? defaultApiError;
        } catch (error) {
            console.error('Error in create:', error);
            return defaultApiError;
        }
    },

    update: async <T>(endpoint: string, id: number, entityData: Partial<T>): Promise<ApiResponse<T>> => {
        try {
            const { data } = await serviceInstance.put<ApiResponse<T>>(`${endpoint}/${id}`, entityData);
            return data ?? defaultApiError;
        } catch (error) {
            console.error('Error in update:', error);
            return defaultApiError;
        }
    },

    delete: async (endpoint: string, id: number): Promise<ApiResponse<void>> => {
        try {
            const { data } = await serviceInstance.delete<ApiResponse<void>>(`${endpoint}/${id}`);
            return data ?? defaultApiError;
        } catch (error) {
            console.error('Error in delete:', error);
            return defaultApiError;
        }
	},

	// Delete using a fully composed path (useful for nested resources)
	deletePath: async (endpointPath: string): Promise<ApiResponse<void>> => {
		try {
			const { data } = await serviceInstance.delete<ApiResponse<void>>(endpointPath);
			return data ?? defaultApiError;
		} catch (error) {
			console.error('Error in deletePath:', error);
			return defaultApiError;
		}
	}
};

export default {
	get: serviceInstance.get,
	getWithBody: serviceInstance.get,
	post: serviceInstance.post,
	put: serviceInstance.put,
	delete: serviceInstance.delete,
	upload: apiUpload,
	download: apiDownload,
	apiService: serviceInstance,
	genericService
};
