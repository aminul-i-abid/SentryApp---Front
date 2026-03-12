import { ReactNode, useEffect, useRef, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import { Box, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Routes } from 'src/utils/routesEnum';
import { User } from '@auth/user';
import { useTranslation } from 'react-i18next';
import { getActivities } from '../activitiesService';
import JwtAuthContext, { JwtAuthContextType } from '@auth/services/jwt/JwtAuthContext';

interface ActivityModuleGuardProps {
    children: ReactNode;
}

/**
 * Component to guard Activity routes based on user.modules.activities flag
 * If the user doesn't have access to the Activities module, shows an upgrade prompt
 * 
 * This component reads from authState (JwtAuthProvider) which is kept in sync
 * with the API interceptor via CustomEvent communication.
 * 
 * UX Enhancement: If the user doesn't have access, it silently revalidates
 * with the server in background to check if access has been granted recently.
 */
export default function ActivityModuleGuard({ children }: ActivityModuleGuardProps) {
    const jwtAuthContext = useContext(JwtAuthContext) as JwtAuthContextType;
    const { user, updateUserModules } = jwtAuthContext;
    const { t } = useTranslation('activities');
    const revalidationAttemptedRef = useRef(false);
    
    const hasActivitiesModule = user?.modules?.activities === true;
    
    // console.log('🔍 ActivityModuleGuard check:', {
    //     hasAccess: hasActivitiesModule,
    //     userModules: user?.modules,
    //     userId: user?.uid
    // });

    /**
     * Silent background revalidation when user doesn't have access
     * This prevents the need to logout/login when module is activated
     */
    useEffect(() => {
        // Only attempt revalidation once and only if user doesn't have access
        if (!hasActivitiesModule && !revalidationAttemptedRef.current && updateUserModules) {
            revalidationAttemptedRef.current = true;
            
            console.log('🔄 Attempting silent revalidation of activities module...');
            
            // Silent validation request
            getActivities()
                .then((response) => {
                    // If request succeeds, it means the module has been activated
                    if (response.succeeded && response.data) {
                        console.log('✅ Activities module is now accessible! Updating user state...');
                        updateUserModules({ activities: true });
                    }
                })
                .catch((error) => {
                    // Silent failure - user stays on Guard screen
                    // This is expected when module is actually disabled
                    console.log('ℹ️ Module revalidation: access still restricted (expected behavior)');
                });
        }
    }, [hasActivitiesModule, updateUserModules]);

    if (!hasActivitiesModule) {
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
                            <li className="text-sm text-gray-600">📋 {t('moduleGuard.benefits.facilities')}</li>
                            <li className="text-sm text-gray-600">🎯 {t('moduleGuard.benefits.booking')}</li>
                            <li className="text-sm text-gray-600">📊 {t('moduleGuard.benefits.tracking')}</li>
                            <li className="text-sm text-gray-600">✅ {t('moduleGuard.benefits.approval')}</li>
                        </ul>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => window.location.href = Routes.DASHBOARD}
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
