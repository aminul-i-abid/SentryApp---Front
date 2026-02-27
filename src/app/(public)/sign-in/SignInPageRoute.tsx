import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import FullScreenReversedSignInPage from './FullScreenReversedSignInPage';

const SignInPageRoute: FuseRouteItemType = {
	path: 'sign-in',
	element: <FullScreenReversedSignInPage />,
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

export default SignInPageRoute;
