import authRoles from '@auth/authRoles';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const SecurityNavigation: FuseNavItemType = {
	id: 'security',
	title: 'Security',
	type: 'collapse',
	icon: 'heroicons-outline:cog-6-tooth',
	url: '/security',
	auth: authRoles.user,
	children: [
		{
			id: 'security.users',
			icon: 'heroicons-outline:user-circle',
			title: 'Users',
			type: 'item',
			url: '/security/users',
			subtitle: 'Manage the users'
		},
		{
			id: 'security.roles',
			icon: 'heroicons-outline:lock-closed',
			title: 'Roles',
			type: 'item',
			url: '/security/roles',
			subtitle: 'Manage the roles'
		},
		{
			id: 'security.permissions',
			icon: 'heroicons-outline:shield-check',
			title: 'Permissions',
			type: 'item',
			url: '/security/permissions',
			subtitle: 'Manage the permissions'
		}
	]
};

export default SecurityNavigation;
