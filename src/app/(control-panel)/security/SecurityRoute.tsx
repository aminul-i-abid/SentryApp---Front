import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const Security = lazy(() => import('./Security'));
const UsersTab = lazy(() => import('./tabs/UsersTab'));
const UsersList = lazy(() => import('./tabs/UsersTab/list'));
const NewUser = lazy(() => import('./tabs/UsersTab/new'));
const EditUser = lazy(() => import('./tabs/UsersTab/edit'));
const RolesTab = lazy(() => import('./tabs/RolesTab'));
const PermissionsTab = lazy(() => import('./tabs/PermissionsTab'));

const SecurityRoute: FuseRouteItemType = {
	path: 'security',
	element: <Security />,
	settings: {
		layout: {
			config: {
				mode: 'container'
			}
		}
	},
	children: [
		{
			path: 'users',
			element: <UsersTab />,
			children: [
				{
					path: '',
					element: <UsersList />
				},
				{
					path: 'new',
					element: <NewUser />
				},
				{
					path: 'edit/:id',
					element: <EditUser />
				}
			]
		},
		{
			path: 'roles',
			element: <RolesTab />
		},
		{
			path: 'permissions',
			element: <PermissionsTab />
		}
	]
};

export default SecurityRoute;
