import { User } from '@auth/user';
import UserModel from '@auth/user/models/UserModel';
import { PartialDeep } from 'type-fest';
import apiFetch from '@/utils/apiFetch';
import { API_BASE_URL, globalHeaders } from '@/utils/apiFetch';

/**
 * Refreshes the access token
 */
export async function authRefreshToken(): Promise<Response> {
	return apiFetch('/api/mock/auth/refresh', { method: 'POST' });
}

/**
 * Sign in
 */
export async function authSignIn(credentials: { email: string; password: string }): Promise<Response> {
	return apiFetch('/Auth/LoginWeb', {
		method: 'POST',
		body: JSON.stringify({
			username: credentials.email,
			password: credentials.password
		})
	});
}

/**
 * Zendesk: request JWT for messaging auth for the current user
 */
export async function authGetZendeskJwt(payload: { externalId: string; name: string; email: string }): Promise<string | null> {
    try {
        // Endpoint should accept POST body and return: { token: string }
        const res = await fetch(`${API_BASE_URL}/Auth/ZendeskJwt`, {
            method: 'POST',
            headers: {
                ...globalHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                external_id: payload.externalId,
                name: payload.name,
                email: payload.email,
				"email_verified": true,
				"scope": "user"
            })
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { token?: string };
        return data?.token ?? null;
    } catch (e) {
        console.warn('authGetZendeskJwt error', e);
        return null;
    }
}

/**
 * Sign up
 */
export async function authSignUp(data: { displayName: string; email: string; password: string }): Promise<Response> {
	return apiFetch('/api/mock/auth/sign-up', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

/**
 * Get user by id
 */
export async function authGetDbUser(userId: string): Promise<Response> {
	return apiFetch(`/api/mock/auth/user/${userId}`);
}

/**
 * Get user by email
 */
export async function authGetDbUserByEmail(email: string): Promise<Response> {
	return apiFetch(`/api/mock/auth/user-by-email/${email}`);
}

/**
 * Update user
 */
export function authUpdateDbUser(user: PartialDeep<User>) {
	return apiFetch(`/api/mock/auth/user/${user.id}`, {
		method: 'PUT',
		body: JSON.stringify(UserModel(user))
	});
}

/**
 * Create user
 */
export async function authCreateDbUser(user: PartialDeep<User>) {
	return apiFetch('/api/mock/users', {
		method: 'POST',
		body: JSON.stringify(UserModel(user))
	});
}