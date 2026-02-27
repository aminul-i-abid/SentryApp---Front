import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import Box from '@mui/material/Box';
import { useNavigate, useParams } from 'react-router';
import UseCookieAuth from '@auth/services/cookies/useCookieAuth';
import { useEffect, useState } from 'react';
import loginBackground from '../../../assets/login/login.png';
import logo from '../../../assets/logo/logo.png';
import { Card } from '@mui/material';

/**
 * The full screen reversed sign out page.
 */
function FullScreenReversedVerifyEmailPage() {
	const { email, token } = useParams();
	const { verifyEmail } = UseCookieAuth();
	const navigate = useNavigate();
	const [verified, setVerified] = useState(false);
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		const verify = async () => {
			const response = await verifyEmail(email, token);
			setVerified(response.ok);

			if (response.ok) {
				const interval = setInterval(() => {
					setCountdown(countdown - 1);
				}, 1000);

				setTimeout(() => {
					clearInterval(interval);
					navigate('/sign-in');
				}, 5000);
			}
		};
		verify();
	}, [email, token]);

	return (
		<div className="flex min-w-0 flex-auto flex-col items-center sm:flex-row sm:justify-center md:items-start md:justify-start">
			<Card className="h-full w-full px-4 py-8 ltr:border-l-1 rtl:border-r-1 sm:h-auto sm:w-auto sm:rounded-xl sm:p-12 sm:shadow-sm md:flex md:h-full md:rounded-none md:p-16 md:pt-24 md:shadow-none">
				<div className="mx-auto w-full max-w-80 sm:mx-0 sm:w-80">
					<img
						className="w-36"
						src={logo}
						alt="logo"
					/>

					<Typography className="mt-8 text-center text-4xl font-extrabold leading-[1.25] tracking-tight">
						{verified ? '¡Correo verificado!' : 'Error en la verificación del correo'}
					</Typography>
					{verified && (
						<Typography className="mt-0.5 flex justify-center font-medium">
							Redirigiendo en {countdown} segundos
						</Typography>
					)}

					<Typography
						className="mt-8 text-center text-md font-medium"
						color="text.secondary"
					>
						<span>Ir a</span>
						<Link
							className="ml-1"
							to="/sign-in"
						>
							iniciar sesión
						</Link>
					</Typography>
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

export default FullScreenReversedVerifyEmailPage;
