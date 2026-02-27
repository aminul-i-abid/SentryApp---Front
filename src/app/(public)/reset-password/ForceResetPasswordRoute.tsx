import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import ForceResetPasswordPage from './ForceResetPasswordPage';

const ForceResetPasswordRoute: FuseRouteItemType = {
	path: 'force-reset-password',
	element: <ForceResetPasswordPage />,
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				toolbar: {
					display: false
				},
				footer: {
					display: false
				},
				leftSidePanel: {
					display: false
				},
				rightSidePanel: {
					display: false
				}
			}
		}
	},
	auth: authRoles.onlyGuest // []
};

export default ForceResetPasswordRoute; 