import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import FullScreenReversedSignOutPage from './FullScreenReversedSignOutPage';

const SignOutPageRoute: FuseRouteItemType = {
	path: 'sign-out',
	element: <FullScreenReversedSignOutPage />,
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
	auth: null
};

export default SignOutPageRoute;
