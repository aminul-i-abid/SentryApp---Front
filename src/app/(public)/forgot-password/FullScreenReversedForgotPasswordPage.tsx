import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import UseCookieAuth from '@auth/services/cookies/useCookieAuth';
import { useDispatch } from 'react-redux';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useState } from 'react';
import loginBackground from '../../../assets/login/login.png';
import logo from '../../../assets/logo/logo.png';
import { Card } from '@mui/material';
import apiService from '@/utils/apiService';
import { useNavigate } from 'react-router-dom';

/**
 * Form Validation Schema
 */
const schema = z.object({
	email: z.string().email('Debes ingresar un correo electrónico válido').nonempty('Debes ingresar un correo electrónico')
});

const defaultValues = {
	email: ''
};

type FormType = {
	email: string;
};

/**
 * The full screen reversed forgot password page.
 */
function FullScreenReversedForgotPasswordPage() {
	const { forgotPassword } = UseCookieAuth();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { control, formState, handleSubmit, reset } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(formData: FormType) {
		const { email } = formData;
		//obtener la parte de la url a la cual se esta accediendo
		const currentUrl = window.location.href;
		const url = new URL(currentUrl);
		const hostname = url.hostname;
		const port = url.port;
		const tenant = port ? `${hostname}:${port}` : hostname;
		setLoading(true);
		apiService.post('/Users/send-new-password-email', {
			email: email,
			tenant: tenant,
		})
			.then((response) => {


				if (response.status === 200) {
					dispatch(
						showMessage({
							message: 'Mail enviado correctamente',
							variant: 'success'
						})
					);
					reset(defaultValues);
					setTimeout(() => {
						navigate('/sign-in');
					}, 2000);
				}
			})
			.catch((error) => {

				console.error(error);
				dispatch(
					showMessage({
						message: 'Error al enviar el mail',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setLoading(false);
			});
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
						¿Olvidaste tu contraseña?
					</Typography>
					<div className="mt-0.5 flex items-baseline font-medium">
						<Typography>Completa el formulario para restablecer tu contraseña</Typography>
					</div>

					<form
						name="registerForm"
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
									type="email"
									error={!!errors.email}
									helperText={errors?.email?.message}
									variant="outlined"
									required
									fullWidth
								/>
							)}
						/>

						<Button
							variant="contained"
							color="secondary"
							className=" mt-1 w-full"
							aria-label="Register"
							disabled={_.isEmpty(dirtyFields) || !isValid || loading}
							type="submit"
							size="large"
						>
							{loading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
						</Button>

						<Typography
							className="mt-8 text-md font-medium"
							color="text.secondary"
						>
							<span>Volver a</span>
							<Link
								className="ml-1"
								to="/sign-in"
							>
								iniciar sesión
							</Link>
						</Typography>
					</form>
				</div>
			</Card>
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

export default FullScreenReversedForgotPasswordPage;
