import { useContext } from 'react';
import CookieAuthContext from './CookieAuthContext';

function UseCookieAuth() {
	const context = useContext(CookieAuthContext);

	if (context === undefined) {
		throw new Error('CookieAuthContext must be used within a CookieAuthProvider');
	}

	return context;
}

export default UseCookieAuth;
