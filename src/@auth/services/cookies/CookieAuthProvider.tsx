import { User } from '@auth/user';
import { FuseAuthProviderComponentProps, FuseAuthProviderState } from '@fuse/core/FuseAuthProvider/types/FuseAuthTypes';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import CookieAuthContext, { CookieAuthContextType } from './CookieAuthContext';
import {
	apiAutologin,
	apiForgotPassword,
	apiLogin,
	apiLogout,
	apiRegister,
	apiResetPassword,
	apiVerifyEmail
} from '@auth/authService';

export type CookieSignInPayload = {
	userName: string;
	password: string;
	rememberMe?: boolean;
	otp?: string;
};

export type CookieSignUpPayload = {
	displayName: string;
	email: string;
	password: string;
};

const CookieAuthProvider = forwardRef<any, FuseAuthProviderComponentProps>((props, ref) => {
	const { children, onAuthStateChanged } = props;

	/**
	 * Fuse Auth Provider State
	 */
	const [authState, setAuthState] = useState<FuseAuthProviderState<User>>({
		authStatus: 'configuring',
		isAuthenticated: false,
		user: null
	});

	/**
	 * Watch for changes in the auth state
	 * and pass them to the FuseAuthProvider
	 */
	useEffect(() => {
		if (onAuthStateChanged) {
			onAuthStateChanged(authState);
		}
	}, [authState, onAuthStateChanged]);

	useEffect(() => {
		const attemptAutoLogin = async () => {
			try {
				const apiResponse = await apiAutologin();

				if (apiResponse.succeeded) {
					return {
						id: apiResponse.data.id,
						role: apiResponse.data.roles,
						displayName: apiResponse.data.fullName,
						photoURL: '',
						email: apiResponse.data.email,
						shortcuts: [],
						settings: {},
						loginRedirectUrl: '/'
					};
				}

				return false;
			} catch {
				return false;
			}
		};

		if (!authState.isAuthenticated) {
			attemptAutoLogin().then((userData) => {
				if (userData) {
					setAuthState({
						authStatus: 'authenticated',
						isAuthenticated: true,
						user: userData
					});
				} else {
					setAuthState({
						authStatus: 'unauthenticated',
						isAuthenticated: false,
						user: null
					});
				}
			});
		}

		// eslint-disable-next-line
    }, [authState.isAuthenticated]);

	/**
	 * Sign in
	 */
	const signIn: CookieAuthContextType['signIn'] = useCallback(async (credentials) => {
		const apiResponse = await apiLogin(credentials.userName, credentials.password);

		if (apiResponse.succeeded) {
			const newState: FuseAuthProviderState<User> = {
				authStatus: 'authenticated' as const,
				isAuthenticated: true,
				user: {
					id: '1123',
					role: 'admin',
					displayName: apiResponse.data.fullName,
					photoURL: '',
					email: apiResponse.data.email,
					shortcuts: [],
					settings: {},
					loginRedirectUrl: '/'
				}
			};
			setAuthState(newState);
		}

		return new Response(JSON.stringify(apiResponse), {
			status: apiResponse.succeeded ? 200 : 400,
			statusText: apiResponse.succeeded ? apiResponse.message.join(', ') : apiResponse.errors.join(', ')
		});
	}, [authState]);

	/**
	 * Sign up
	 */
	const signUp: CookieAuthContextType['signUp'] = useCallback(async (data) => {
		const apiResponse = await apiRegister(data.displayName, data.email, data.password);

		return new Response(JSON.stringify(apiResponse), {
			status: apiResponse.result.succeeded ? 200 : 400,
			statusText: apiResponse.result.succeeded
				? apiResponse.result.messages.join(', ')
				: apiResponse.result.errors.join(', ')
		});
	}, []);

	/**
	 * Verify email
	 */
	const verifyEmail: CookieAuthContextType['verifyEmail'] = useCallback(async (email, code) => {
		const apiResponse = await apiVerifyEmail(email, code);

		return new Response(JSON.stringify(apiResponse), {
			status: apiResponse.result.succeeded ? 200 : 400,
			statusText: apiResponse.result.succeeded
				? apiResponse.result.messages.join(', ')
				: apiResponse.result.errors.join(', ')
		});
	}, []);

	/**
	 * Forgot password
	 */
	const forgotPassword: CookieAuthContextType['forgotPassword'] = useCallback(async (email) => {
		const apiResponse = await apiForgotPassword(email);

		return new Response(JSON.stringify(apiResponse), {
			status: apiResponse.result.succeeded ? 200 : 400,
			statusText: apiResponse.result.succeeded
				? apiResponse.result.messages.join(', ')
				: apiResponse.result.errors.join(', ')
		});
	}, []);

	/**
	 * Reset password
	 */
	const resetPassword: CookieAuthContextType['resetPassword'] = useCallback(async (email, code, password) => {
		const apiResponse = await apiResetPassword(email, code, password);

		return new Response(JSON.stringify(apiResponse), {
			status: apiResponse.result.succeeded ? 200 : 400,
			statusText: apiResponse.result.succeeded
				? apiResponse.result.messages.join(', ')
				: apiResponse.result.errors.join(', ')
		});
	}, []);

	/**
	 * Sign out
	 */
	const signOut: CookieAuthContextType['signOut'] = useCallback(async () => {
		const apiResponse = await apiLogout();

		if (apiResponse.result.succeeded) {
			setAuthState({
				authStatus: 'unauthenticated',
				isAuthenticated: false,
				user: null
			});
		}

		return new Response(JSON.stringify(apiResponse), {
			status: apiResponse.result.succeeded ? 200 : 400,
			statusText: apiResponse.result.succeeded
				? apiResponse.result.messages.join(', ')
				: apiResponse.result.errors.join(', ')
		});
	}, []);

	/**
	 * Update user
	 */
	const updateUser: CookieAuthContextType['updateUser'] = useCallback(async (_user) => {
		try {
			//return await authUpdateDbUser(_user);
			return Promise.resolve(_user);
		} catch (error) {
			console.error('Error updating user:', error);
			return Promise.reject(error);
		}
	}, []);

	/**
	 * Auth Context Value
	 */
	const authContextValue = useMemo(
		() =>
			({
				...authState,
				signIn,
				signOut,
				signUp,
				verifyEmail,
				forgotPassword,
				resetPassword,
				updateUser
			}) as CookieAuthContextType,
		[authState, signIn, signOut, signUp, verifyEmail, forgotPassword, resetPassword, updateUser]
	);

	useImperativeHandle(ref, () => ({
		signOut,
		updateUser: async (user: User) => {
			setAuthState((state) => ({
				...state,
				user
			}));
			return new Response();
		}
	}));

	return <CookieAuthContext.Provider value={authContextValue}>{children}</CookieAuthContext.Provider>;
});

export default CookieAuthProvider;
