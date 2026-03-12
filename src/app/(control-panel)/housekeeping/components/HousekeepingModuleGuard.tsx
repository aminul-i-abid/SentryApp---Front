import { ReactNode, useContext } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Routes } from 'src/utils/routesEnum';
import { useTranslation } from 'react-i18next';
import JwtAuthContext, { JwtAuthContextType } from '@auth/services/jwt/JwtAuthContext';

interface HousekeepingModuleGuardProps {
    children: ReactNode;
}

/**
 * Component to guard Housekeeping routes based on user.modules.housekeeping flag.
 * If the user does not have access to the Housekeeping module, shows an upgrade prompt.
 *
 * Reads from authState (JwtAuthProvider) which is kept in sync with the API
 * interceptor via CustomEvent communication.
 *
 * This guard is intentionally simple: no background revalidation, no API calls.
 * It renders children when access is granted, or the upgrade banner otherwise.
 */
export default function HousekeepingModuleGuard({ children }: HousekeepingModuleGuardProps) {
    const jwtAuthContext = useContext(JwtAuthContext) as JwtAuthContextType;
    const { user } = jwtAuthContext;
    const { t } = useTranslation('housekeeping');

    const hasHousekeepingModule = user?.modules?.housekeeping === true;

    if (!hasHousekeepingModule) {
        return (
            <Box className="flex items-center justify-center min-h-screen bg-gray-50">
                <Paper className="p-12 max-w-md text-center">
                    <Box className="mb-6">
                        <LockIcon sx={{ fontSize: 80 }} color="action" />
                    </Box>

                    <Typography variant="h4" className="mb-4 font-bold">
                        {t('moduleGuard.title')}
                    </Typography>

                    <Typography variant="body1" color="textSecondary" className="mb-6">
                        {t('moduleGuard.description')}
                    </Typography>

                    <Box className="space-y-3">
                        <Typography variant="body2" color="textSecondary" className="mb-4">
                            {t('moduleGuard.benefits.title')}
                        </Typography>
                        <ul className="text-left space-y-2 mb-6">
                            <li className="text-sm text-gray-600">🏠 {t('moduleGuard.benefits.facilities')}</li>
                            <li className="text-sm text-gray-600">📋 {t('moduleGuard.benefits.booking')}</li>
                            <li className="text-sm text-gray-600">✓ {t('moduleGuard.benefits.tracking')}</li>
                            <li className="text-sm text-gray-600">✅ {t('moduleGuard.benefits.approval')}</li>
                        </ul>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => { window.location.href = Routes.DASHBOARD; }}
                        className="mt-4"
                    >
                        {t('moduleGuard.buttonBack')}
                    </Button>

                    <Typography variant="caption" color="textSecondary" className="block mt-4">
                        {t('moduleGuard.contactAdmin')}
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return <>{children}</>;
}
