import React from 'react';

import { FuseAuthProviderType } from '@fuse/core/FuseAuthProvider/types/FuseAuthTypes';
import FuseAuthProvider from '@fuse/core/FuseAuthProvider';
import FuseAuthorization from '@fuse/core/FuseAuthorization';
import { User } from '@auth/user';
import JwtAuthProvider from './services/jwt/JwtAuthProvider';
/**
 * The Authentication providers.
 */
const authProviders: FuseAuthProviderType[] = [
	{
		name: 'jwt',
		Provider: JwtAuthProvider
	}
];

type AuthenticationProps = {
	children: React.ReactNode;
};

function Authentication(props: AuthenticationProps) {
	const { children } = props;

	return (
		<FuseAuthProvider providers={authProviders}>
			{(authState) => {
				const userRole = authState?.user?.role as User['role'];
				return <FuseAuthorization userRole={userRole}>{children}</FuseAuthorization>;
			}}
		</FuseAuthProvider>
	);
}

export default Authentication;
