import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { User } from '@auth/user';

/**
 * Creates a new user object with the specified data.
 */
export function UserModel(data?: PartialDeep<User>): User {
	data = data || {};

	return _.defaults(data, {
		id: null,
		role: null, // guest
		displayName: null,
		photoURL: '',
		email: '',
		shortcuts: [],
		settings: {},
		loginRedirectUrl: '/',
		modules: {
			activities: false,
			ttlock: false,
			stock: false
		}
	}) as User;
}

export default UserModel;
