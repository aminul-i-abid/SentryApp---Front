import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';

/**
 * Controls Zendesk visibility based on current route.
 * Hides the widget on public pages; shows it elsewhere.
 */
function ZendeskController() {
    const { pathname } = useLocation();

    const isPublicPath = useMemo(() => {
        const publicPrefixes = [
            '/sign-in',
            '/sign-up',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
            '/sign-out',
            '/confirmation-required',
            '/401',
            '/404'
        ];
        return publicPrefixes.some((prefix) => pathname.includes(prefix));
    }, [pathname]);

    useEffect(() => {
        const ze: any = (window as any).zE;
        if (!ze) {
            return;
        }

        const hideAll = () => {
            try {
                ze('webWidget', 'hide');
            } catch {}
            try {
                ze('messenger', 'hide');
            } catch {}
        };

        const showAll = () => {
            try {
                ze('webWidget', 'show');
            } catch {}
            try {
                ze('messenger', 'show');
            } catch {}
        };

        // Ensure calls execute when Zendesk is fully initialized
        try {
            ze(() => {
                if (isPublicPath) {
                    hideAll();
                } else {
                    showAll();
                }
            });
        } catch {
            // Fallback attempt without the ready callback
            if (isPublicPath) {
                hideAll();
            } else {
                showAll();
            }
        }
    }, [isPublicPath]);

    return null;
}

export default ZendeskController;


