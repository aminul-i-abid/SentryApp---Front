import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FetchApiError } from '@/utils/apiFetch';
import UseJwtAuth from '@auth/services/jwt/useJwtAuth';
import { useDispatch } from 'react-redux';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import loginBackground from '../../../assets/login/login.png';
import logo from '../../../assets/logo/logo.png';
import { Card } from '@mui/material';
import LockPersonRounded from '@mui/icons-material/LockPersonRounded';
import Stack from '@mui/material/Stack';
import appStoreBadge from '../../../assets/appsstore.png';
import googlePlayBadge from '../../../assets/googleplay.png';
import logo2 from '../../../assets/logo/logo_2.png';
/**
 * Form Validation Schema
 */
const schema = z.object({
	email: z.string().email('Debes ingresar un correo electrónico válido').nonempty('Debes ingresar un correo electrónico'),
	password: z
		.string()
		.min(8, 'La contraseña es demasiado corta - debe tener al menos 8 caracteres')
		.nonempty('Debes ingresar tu contraseña')
});

type FormType = {
	email: string;
	password: string;
	remember?: boolean;
};

const defaultValues = {
	email: '',
	password: '',
	remember: true
};

/**
 * The full screen sign in page.
 */
function FullScreenReversedSignInPage() {
	const jwtAuthContext = UseJwtAuth();
	const { signIn } = jwtAuthContext;
	const dispatch = useDispatch();

	const [guestModalOpen, setGuestModalOpen] = useState(false);

	const { control, formState, handleSubmit, reset, setError } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(formData: FormType) {
		const { email, password } = formData;

		if (!signIn) {
			dispatch(
				showMessage({
					message: 'Error de autenticación: servicio no disponible',
					variant: 'error'
				})
			);
			return;
		}

		signIn({
			email: email,
			password: password
		})
			.then((response) => {
				if (!response.ok) {
					dispatch(
						showMessage({
							message: response.statusText || 'Error al iniciar sesión',
							variant: 'error',
							anchorOrigin: {
								vertical: 'bottom',
								horizontal: 'center'
							}
						})
					);
				}
			})
			.catch((error: FetchApiError) => {
				const errorData = error.data as {
					type: 'email' | 'password' | 'remember' | `root.${string}` | 'root';
					message: string;
				}[];

				if (errorData?.length > 0) {
					errorData.forEach((err) => {
						setError(err.type, {
							type: 'manual',
							message: err.message
						});
					});
				} else {
					if (error?.message?.includes('User does not have required role')) {
						setGuestModalOpen(true);
					} else {
						dispatch(
							showMessage({
								message: 'Error al iniciar sesión. Por favor, intente nuevamente.',
								variant: 'error',
								anchorOrigin: {
									vertical: 'bottom',
									horizontal: 'center'
								}
							})
						);
					}
				}
			});

		reset(defaultValues);
	}

	return (
		<div className="flex min-w-0 flex-auto flex-col items-center sm:flex-row sm:justify-center md:items-start md:justify-start">
			<Card className="h-full w-full px-4 py-8 ltr:border-l-1 rtl:border-r-1 sm:h-auto sm:w-auto sm:rounded-xl sm:p-12 sm:shadow-sm md:flex md:h-full md:rounded-none md:p-16 md:pt-24 md:shadow-none">
				<div className="mx-auto w-full max-w-80 sm:mx-0 sm:w-80">
					<img
						className="w-36"
						src={logo}
						alt="logo"
					/>

					<Typography className="mt-8 text-4xl font-extrabold leading-[1.25] tracking-tight">
						Iniciar sesión
					</Typography>
					{/* <div className="mt-0.5 flex items-baseline font-medium">
						<Typography>¿No tienes una cuenta?</Typography>
						<Link
							className="ml-1"
							to="/sign-up"
						>
							Regístrate
						</Link>
					</div> */}

					<form
						name="loginForm"
						noValidate
						className="mt-8 flex w-full flex-col justify-center"
						onSubmit={handleSubmit(onSubmit)}
					>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="mb-6"
									label="Correo electrónico"
									autoFocus
									type="email"
									error={!!errors.email}
									helperText={errors?.email?.message}
									variant="outlined"
									required
									fullWidth
								/>
							)}
						/>

						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="mb-6"
									label="Contraseña"
									type="password"
									error={!!errors.password}
									helperText={errors?.password?.message}
									variant="outlined"
									required
									fullWidth
								/>
							)}
						/>

						<div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
							<Controller
								name="remember"
								control={control}
								render={({ field }) => (
									<FormControl>
										<FormControlLabel
											label="Recordarme"
											control={
												<Checkbox
													size="small"
													{...field}
												/>
											}
										/>
									</FormControl>
								)}
							/>

							<Link
								className="text-md font-medium"
								to="/forgot-password"
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>

						<Button
							variant="contained"
							color="secondary"
							className=" mt-4 w-full"
							aria-label="Sign in"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							type="submit"
							size="large"
						>
							Iniciar sesión
						</Button>
					</form>
				</div>
			</Card>
			<Dialog
				open={guestModalOpen}
				onClose={() => setGuestModalOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						overflow: 'hidden',
						boxShadow: 24
					}
				}}
			>
				<Box
					sx={(theme) => ({
						backgroundColor: theme.palette.background.paper,
						color: theme.palette.text.secondary,
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						px: 2,
						py: 1.5,
						borderBottom: `1px solid ${theme.palette.divider}`
					})}
				>
					<LockPersonRounded fontSize="small" />
					<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Acceso restringido</Typography>
				</Box>
				<Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
					<img src={logo2} alt="Sentry" style={{ height: 48 }} />
				</Box>
				<DialogTitle sx={{ pb: 0, fontWeight: 800, textAlign: 'center' }}>Tu usuario es huésped</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ textAlign: 'center', pt: 1 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
							Esta versión web es exclusiva para administradores.
						</Typography>
						<Typography color="text.secondary">
							Como huésped, gestioná tu estadía y reservas desde nuestra app móvil.
						</Typography>
						<Box className="flex items-center justify-center gap-3">
							<a
								href="https://play.google.com/store/apps/details?id=com.getsoftware.sentry&hl=es_AR"
								target="_blank"
								rel="noreferrer noopener"
								style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent' }}
							>
								<img src={googlePlayBadge} alt="Disponible en Google Play" style={{ height: 72, background: 'transparent' }} />
							</a>
							<a
								href="https://apps.apple.com/ar/app/sentryapp/id6746771817"
								target="_blank"
								rel="noreferrer noopener"
								style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent' }}
							>
								<img src={appStoreBadge} alt="Descargar en el App Store" style={{ height: 50, background: 'transparent' }} />
							</a>
						</Box>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						onClick={() => setGuestModalOpen(false)}
					>
						Entendido
					</Button>
				</DialogActions>
			</Dialog>
			<Box
				className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-16 md:flex lg:px-28 "
				sx={{ backgroundColor: 'primary.dark', color: 'primary.contrastText' }}
			>
				<div className="flex items-center justify-center h-full w-full">
					<div className="flex items-center justify-center">
						<img
							src={loginBackground}
							alt="background"
							className="max-h-[520px] max-w-[520px] w-full h-full object-cover object-center"
						/>
					</div>
				</div>
			</Box>
		</div>
	);
}

export default FullScreenReversedSignInPage;
