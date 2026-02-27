import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import FullScreenReversedVerifyEmailPage from './FullScreenReversedVerifyEmailPage';

const VerifyEmailPageRoute: FuseRouteItemType = {
	path: 'verify-email/:email/:token',
	element: <FullScreenReversedVerifyEmailPage />,
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

export default VerifyEmailPageRoute;
