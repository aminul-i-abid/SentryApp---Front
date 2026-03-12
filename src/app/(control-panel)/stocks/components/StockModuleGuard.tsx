import { ReactNode, useEffect, useRef, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import { Box, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Routes } from 'src/utils/routesEnum';
import { User } from '@auth/user';
import { useTranslation } from 'react-i18next';
import { getStocks } from '../stockService';
import JwtAuthContext, { JwtAuthContextType } from '@auth/services/jwt/JwtAuthContext';

interface StockModuleGuardProps {
    children: ReactNode;
}

/**
 * Component to guard Stock routes based on user.modules.stock flag
 * If the user doesn't have access to the Stock module, shows an upgrade prompt
 * 
 * This component reads from authState (JwtAuthProvider) which is kept in sync
 * with the API interceptor via CustomEvent communication.
 * 
 * UX Enhancement: If the user doesn't have access, it silently revalidates
 * with the server in background to check if access has been granted recently.
 */
export default function StockModuleGuard({ children }: StockModuleGuardProps) {
    const jwtAuthContext = useContext(JwtAuthContext) as JwtAuthContextType;
    const { user, updateUserModules } = jwtAuthContext;
    const { t } = useTranslation('stocks');
    const revalidationAttemptedRef = useRef(false);
    
    const hasStockModule = user?.modules?.stock === true;
    
    // console.log('🔍 StockModuleGuard check:', {
    //     hasAccess: hasStockModule,
    //     userModules: user?.modules,
    //     userId: user?.uid
    // });

    /**
     * Silent background revalidation when user doesn't have access
     * This prevents the need to logout/login when module is activated
     */
    useEffect(() => {
        // Only attempt revalidation once and only if user doesn't have access
        if (!hasStockModule && !revalidationAttemptedRef.current && updateUserModules) {
            revalidationAttemptedRef.current = true;
            
            // console.log('🔄 Attempting silent revalidation of stock module...');
            
            // Silent validation request
            getStocks()
                .then((response) => {
                    // If request succeeds, it means the module has been activated
                    if (response.succeeded && response.data) {
                        // console.log('✅ Stock module is now accessible! Updating user state...');
                        updateUserModules({ stock: true });
                    }
                })
                .catch((error) => {
                    // Silent failure - user stays on Guard screen
                    // This is expected when module is actually disabled
                    console.log('ℹ️ Module revalidation: access still restricted (expected behavior)');
                });
        }
    }, [hasStockModule, updateUserModules]);

    if (!hasStockModule) {
        return (
            <Box className="flex items-center justify-center min-h-screen bg-gray-50">
                <Paper className="p-12 max-w-md text-center">
                    <Box className="mb-6">
                        <LockIcon sx={{ fontSize: 80 }} color="action" />
                    </Box>
                    
                    <Typography variant="h4" className="mb-4 font-bold">
                        {t('moduleGuard.title', 'Característica Plus')}
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" className="mb-6">
                        {t('moduleGuard.description', 'Este módulo no está disponible en tu plan actual. Solicita al administrador la activación del módulo de gestión de stock.')}
                    </Typography>

                    <Box className="space-y-3">
                        <Typography variant="body2" color="textSecondary" className="mb-4">
                            {t('moduleGuard.benefits.title', 'Con el módulo de Gestión de Stock puede:')}
                        </Typography>
                        <ul className="text-left space-y-2 mb-6">
                            <li className="text-sm text-gray-600">📦 {t('moduleGuard.benefits.inventory', 'Gestionar inventario en múltiples bodegas')}</li>
                            <li className="text-sm text-gray-600">🔄 {t('moduleGuard.benefits.transfers', 'Realizar transferencias de stock entre ubicaciones')}</li>
                            <li className="text-sm text-gray-600">📊 {t('moduleGuard.benefits.tracking', 'Seguimiento detallado de lotes y ubicaciones')}</li>
                            <li className="text-sm text-gray-600">✅ {t('moduleGuard.benefits.control', 'Control de stock en tiempo real')}</li>
                        </ul>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => window.location.href = Routes.DASHBOARD}
                        className="mt-4"
                    >
                        {t('moduleGuard.buttonBack', 'Volver al inicio')}
                    </Button>

                    <Typography variant="caption" color="textSecondary" className="block mt-4">
                        {t('moduleGuard.contactAdmin', 'Contacta al administrador para activar este módulo')}
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return <>{children}</>;
}
