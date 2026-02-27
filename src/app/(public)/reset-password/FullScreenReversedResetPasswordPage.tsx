import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import loginBackground from '../../../assets/login/login.png';
import logo from '../../../assets/logo/logo.png';
import { Card } from '@mui/material';
import apiService from '@/utils/apiService';

/**
 * Form Validation Schema
 */
const schema = z
	.object({
		password: z
			.string()
			.nonempty('Debes ingresar tu contraseña')
			.min(8, 'La contraseña debe tener al menos 8 caracteres')
			.regex(/(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
			.regex(/(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
			.regex(/(?=.*\d)/, 'La contraseña debe contener al menos un número')
			.regex(/(?=.*[@$!%*?&#])/, 'La contraseña debe contener al menos un caracter especial (@$!%*?&#)'),
		passwordConfirm: z
			.string()
			.nonempty('Debes confirmar tu contraseña')
			.min(8, 'La contraseña debe tener al menos 8 caracteres')
			.regex(/(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
			.regex(/(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
			.regex(/(?=.*\d)/, 'La contraseña debe contener al menos un número')
			.regex(/(?=.*[@$!%*?&#])/, 'La contraseña debe contener al menos un caracter especial (@$!%*?&#)')
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Las contraseñas deben coincidir',
		path: ['passwordConfirm']
	});

const defaultValues = {
	password: '',
	passwordConfirm: ''
};

type FormType = {
	password: string;
	passwordConfirm: string;
};

/**
 * The full screen reset password page.
 */
function FullScreenReversedResetPasswordPage() {
	const { email } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { control, formState, handleSubmit, reset } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(formData: FormType) {
		apiService.post('/Users/ResetPassword', {
			email: email,
			password: formData.password,
			retypePassword: formData.passwordConfirm
		})
			.then((response) => {
				if (response.status === 200) {
					dispatch(
						showMessage({
							message: 'Contraseña actualizada exitosamente',
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
						message: 'Error al actualizar la contraseña',
						variant: 'error'
					})
				);
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
						Restablecer contraseña
					</Typography>
					<Typography className="font-medium">Crea una nueva contraseña para tu cuenta</Typography>

					<form
						name="registerForm"
						noValidate
						className="mt-8 flex w-full flex-col justify-center"
						onSubmit={handleSubmit(onSubmit)}
					>
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

						<Button
							variant="contained"
							color="secondary"
							className=" mt-1 w-full"
							aria-label="Register"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							type="submit"
							size="large"
						>
							Restablecer contraseña
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

export default FullScreenReversedResetPasswordPage;
