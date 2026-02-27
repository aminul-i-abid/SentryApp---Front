import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import FullScreenReversedConfirmationRequiredPage from './FullScreenReversedConfirmationRequiredPage';

const ConfirmationRequiredPagesRoute: FuseRouteItemType = {
	path: 'confirmation-required',
	element: <FullScreenReversedConfirmationRequiredPage />,
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

export default ConfirmationRequiredPagesRoute;
