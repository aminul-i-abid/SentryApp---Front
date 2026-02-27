import { ApiResponse, EndpointsDefinition } from '@/utils/types';
import apiService, { defaultApiError, defaultPaginatedApiError } from '@/utils/apiService';
import { User, UserListRequest, UsersApiResponse, UserWithPassword } from './types';
import { serializeParams } from '@/utils/misc';

const endpoints: EndpointsDefinition = {
	base: '/SecurityManagement',
	users: '/users'
};

export const getUsers = async (request: UserListRequest): Promise<UsersApiResponse> => {
	const { data } = await apiService.get<UsersApiResponse>(`${endpoints.base}${endpoints.users}`, {
		params: request,
		paramsSerializer: serializeParams
	});
	return data ?? defaultPaginatedApiError;
};

export const createUser = async (request: UserWithPassword): Promise<ApiResponse<void>> => {
	const { data } = await apiService.post<ApiResponse<void>>(`${endpoints.base}${endpoints.users}`, request);
	return data ?? defaultApiError;
};

export const updateUser = async (request: UserWithPassword): Promise<ApiResponse<void>> => {
	const { data } = await apiService.put<ApiResponse<void>>(`${endpoints.base}${endpoints.users}`, request);
	return data ?? defaultApiError;
};

export const deleteUser = async (request: User): Promise<ApiResponse<void>> => {
	const { data } = await apiService.delete<ApiResponse<void>>(`${endpoints.base}${endpoints.users}/${request.id}`);
	return data ?? defaultApiError;
};

export const getUser = async (userId: string): Promise<ApiResponse<User>> => {
	const { data } = await apiService.get<ApiResponse<User>>(`${endpoints.base}${endpoints.users}/${userId}`);
	return data ?? defaultApiError;
};
