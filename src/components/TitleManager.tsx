import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import navigationConfig from '@/configs/navigationConfig';
import type { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

function flattenNav(items: FuseNavItemType[]): FuseNavItemType[] {
	const result: FuseNavItemType[] = [];
	items.forEach((item) => {
		result.push(item);
		if (item.children && item.children.length > 0) {
			result.push(...flattenNav(item.children as FuseNavItemType[]));
		}
	});
	return result;
}

function TitleManager() {
	const { pathname } = useLocation();

	const flatNav = useMemo(() => flattenNav(navigationConfig), []);

	useEffect(() => {
		const matched = flatNav
			.filter((item) => typeof item.url === 'string' && item.url)
			.sort((a, b) => (String(b.url).length - String(a.url).length))
			.find((item) => pathname.startsWith(String(item.url)));

		const pageTitle = matched?.title ? `${matched.title} - SentryApp` : 'SentryApp';
		document.title = pageTitle;
	}, [pathname, flatNav]);

	return null;
}

export default TitleManager;


