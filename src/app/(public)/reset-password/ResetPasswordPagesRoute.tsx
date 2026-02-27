import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import FullScreenReversedResetPasswordPage from './FullScreenReversedResetPasswordPage';

const ResetPasswordPageRoute: FuseRouteItemType = {
	path: 'reset-password/:email',
	element: <FullScreenReversedResetPasswordPage />,
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

export default ResetPasswordPageRoute;
