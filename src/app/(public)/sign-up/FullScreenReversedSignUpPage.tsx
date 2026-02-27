import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import UseCookieAuth from '@auth/services/cookies/useCookieAuth';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import loginBackground from '../../../assets/login/login.png';
import logo from '../../../assets/logo/logo.png';
import { Card } from '@mui/material';

/**
 * Form Validation Schema
 */
const schema = z
	.object({
		name: z.string().nonempty('Debes ingresar tu nombre'),
		email: z.string().email('Debes ingresar un correo electrónico válido').nonempty('Debes ingresar un correo electrónico'),
		password: z
			.string()
			.nonempty('Debes ingresar tu contraseña')
			.min(8, 'La contraseña es demasiado corta - debe tener al menos 8 caracteres'),
		passwordConfirm: z.string().nonempty('Debes confirmar tu contraseña'),
		acceptTermsConditions: z.boolean().refine((val) => val === true, 'Debes aceptar los términos y condiciones')
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Las contraseñas deben coincidir',
		path: ['passwordConfirm']
	});

const defaultValues = {
	name: '',
	email: '',
	password: '',
	passwordConfirm: '',
	acceptTermsConditions: false
};

type FormType = {
	name: string;
	email: string;
	password: string;
	passwordConfirm: string;
	acceptTermsConditions: boolean;
};

/**
 * The full screen reversed sign up page.
 */
function FullScreenReversedSignUpPage() {
	const { signUp } = UseCookieAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const { control, formState, handleSubmit, reset } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(formData: FormType) {
		setLoading(true);
		signUp({
			displayName: formData.name,
			email: formData.email,
			password: formData.password
		})
			.then((response) => {
				if (response.ok) {
					reset(defaultValues);
					navigate('/confirmation-required');
				}
			})
			.catch((error) => {
				console.error(error);
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
						Registro
					</Typography>
					<div className="mt-0.5 flex items-baseline font-medium">
						<Typography>¿Ya tienes una cuenta?</Typography>
						<Link
							className="ml-1"
							to="/sign-in"
						>
							Iniciar sesión
						</Link>
					</div>

					<form
						name="registerForm"
						noValidate
						className="mt-8 flex w-full flex-col justify-center"
						onSubmit={handleSubmit(onSubmit)}
					>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="mb-6"
									label="Nombre"
									autoFocus
									type="name"
									error={!!errors.name}
									helperText={errors?.name?.message}
									variant="outlined"
									required
									fullWidth
								/>
							)}
						/>

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

						<Controller
							name="passwordConfirm"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="mb-6"
									label="Confirmar contraseña"
									type="password"
									error={!!errors.passwordConfirm}
									helperText={errors?.passwordConfirm?.message}
									variant="outlined"
									required
									fullWidth
								/>
							)}
						/>

						<Controller
							name="acceptTermsConditions"
							control={control}
							render={({ field }) => (
								<FormControl error={!!errors.acceptTermsConditions}>
									<FormControlLabel
										label="Acepto los Términos y la Política de Privacidad"
										control={
											<Checkbox
												size="small"
												{...field}
											/>
										}
									/>
									<FormHelperText>{errors?.acceptTermsConditions?.message}</FormHelperText>
								</FormControl>
							)}
						/>

						<Button
							variant="contained"
							color="secondary"
							className=" mt-6 w-full"
							aria-label="Register"
							disabled={_.isEmpty(dirtyFields) || !isValid || loading}
							type="submit"
							size="large"
						>
							{loading ? 'Creando...' : 'Crear cuenta gratuita'}
						</Button>
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

export default FullScreenReversedSignUpPage;
