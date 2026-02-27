import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from "@tailwindcss/vite";
import { endpoints } from './endpoints';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		react({
			jsxImportSource: '@emotion/react',
			// Desactivar Fast Refresh automático para archivos específicos
			exclude: /node_modules/,
		}),
		tsconfigPaths({
			parseNative: false
		}),
		svgrPlugin(),
		{
			name: 'custom-hmr-control',
			handleHotUpdate({ file, server }) {
				if (file.includes('src/app/configs/')) {
					server.ws.send({
						type: 'full-reload'
					});
					return [];
				}
			}
		},
		tailwindcss(),
	],
	build: {
		outDir: 'build',
		chunkSizeWarningLimit: 1000,
		// Configuración conservadora para evitar problemas de dependencias circulares
		rollupOptions: {
			output: {
				// Estrategia: agrupar todo el ecosistema React/MUI/Emotion junto
				manualChunks: {
					// Un solo vendor con todo el ecosistema React
					'vendor': [
						'react',
						'react-dom',
						'@emotion/react',
						'@emotion/styled',
						'@emotion/cache',
						'@mui/material',
						'@mui/system',
						'@mui/base',
						'@mui/utils',
						'@mui/icons-material',
						'react-router-dom',
						'react-router'
					],
					// Redux separado (no depende de React hooks directamente)
					'redux': [
						'@reduxjs/toolkit',
						'react-redux'
					]
				}
			}
		}
	},
	server: {
		port: 5173,
		proxy: endpoints,
		// Optimizaciones para el servidor de desarrollo
		hmr: {
			overlay: false // Desactivar overlay de errores que puede causar lentitud
		},
		watch: {
			// Reducir el uso de CPU en Windows
			usePolling: false,
			// Ignorar node_modules para mejorar rendimiento
			ignored: ['**/node_modules/**', '**/.git/**']
		},
		// Prevenir reinicios innecesarios
		fs: {
			strict: false
		}
	},
	define: {
		'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://suris.sentryapp.io'),
		global: 'window'
	},
	resolve: {
		alias: {
			'@': '/src',
			'@fuse': '/src/@fuse',
			'@history': '/src/@history',
			'@lodash': '/src/@lodash',
			'@mock-api': '/src/@mock-api',
			'@schema': '/src/@schema',
			'app/store': '/src/app/store',
			'app/shared-components': '/src/app/shared-components',
			'app/configs': '/src/app/configs',
			'app/theme-layouts': '/src/app/theme-layouts',
			'app/AppContext': '/src/app/AppContext'
		},
		// Asegurar que React sea singleton en producción
		dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled', 'react-is', 'prop-types']
	},
	optimizeDeps: {
		include: [
			'@mui/icons-material',
			'@mui/material',
			'@mui/base',
			'@mui/styles',
			'@mui/system',
			'@mui/utils',
			'@emotion/cache',
			'@emotion/react',
			'@emotion/styled',
			'lodash',
			'react-redux',
			'@reduxjs/toolkit',
			'react-router-dom',
			'@mui/x-data-grid',
			'prop-types',
			'react-is'
		],
		exclude: ['date-fns', '@mui/x-date-pickers'],
		esbuildOptions: {
			loader: {
				'.js': 'jsx'
			}
		}
	},
	// Mejorar rendimiento en desarrollo
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	},
	// Caché para acelerar rebuilds
	cacheDir: 'node_modules/.vite'
}));
