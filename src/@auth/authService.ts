import apiService, { defaultApiError } from '@/utils/apiService';
import { ApiResponse, EndpointsDefinition } from '@/utils/types';

type LoginResponse = {
	id: string;
	userName: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: string[];
	forcePasswordChange: null;
	forcePasswordChangeDescription: null;
	fullName: string;
	enableTwoFA: boolean;
};

const endpoints: EndpointsDefinition = {
	base: '/Auth'
};

export const apiLogin = async (
	username: string,
	password: string
	//rememberMe: boolean
): Promise<ApiResponse<LoginResponse>> => {
	const { data } = await apiService.post<ApiResponse<LoginResponse>>(endpoints.base + '/Login', {
		UserName: username,
		Password: password
		//RememberMe: rememberMe
	});

	return data ?? defaultApiError;
};

export const apiLogin2FA = async (
	username: string,
	password: string,
	rememberMe: boolean,
	code: string
): Promise<ApiResponse<LoginResponse>> => {
	const { data } = await apiService.post<ApiResponse<LoginResponse>>(endpoints.base + '/login2fa', {
		Email: username,
		Password: password,
		RememberMe: rememberMe,
		Code: code
	});

	return data ?? defaultApiError;
};

export const apiAutologin = async (): Promise<ApiResponse<LoginResponse>> => {
	const { data } = await apiService.get<ApiResponse<LoginResponse>>(endpoints.base + '/me');

	return data ?? defaultApiError;
};

export const apiLogout = async () => {
	const { data } = await apiService.get(endpoints.base + '/logout');

	return data ?? defaultApiError;
};

export const apiRegister = async (name: string, email: string, password: string) => {
	const { data } = await apiService.post(endpoints.base + '/register', {
		Name: name,
		Email: email,
		Password: password
	});

	return data ?? defaultApiError;
};

export const apiForgotPassword = async (email: string) => {
	const { data } = await apiService.post(endpoints.base + '/forgot-password', {
		Email: email
	});

	return data ?? defaultApiError;
};

export const apiResetPassword = async (email: string, token: string, newPassword: string) => {
	const { data } = await apiService.post(endpoints.base + '/reset-password', {
		Email: email,
		Token: token,
		NewPassword: newPassword
	});

	return data ?? defaultApiError;
};

export const apiVerifyEmail = async (email: string, code: string) => {
	const { data } = await apiService.post(endpoints.base + '/verify-email', {
		Email: email,
		Code: code
	});

	return data ?? defaultApiError;
};
