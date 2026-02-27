/**
 * The authRoles object defines the authorization roles for the Fuse application.
 */
const authRoles = {
	/**
	 * The admin role grants access to users with the 'Sentry_Admin' or 'Company_Admin' role.
	 */
	admin: ['Sentry_Admin'],

	/**
	 * The staff role grants access to users with the 'Sentry_Admin', 'Company_Admin', or 'staff' role.
	 */
	company: ['Sentry_Admin', 'Company_Admin'],

	/**
	 * The user role grants access to users with the 'Sentry_Admin', 'Company_Admin', 'staff', or 'user' role.
	 */
	user: ['Sentry_Admin', 'Company_Admin', 'staff', 'user'],

	/**
	 * The onlyGuest role grants access to unauthenticated users.
	 */
	onlyGuest: []
};

export default authRoles;
