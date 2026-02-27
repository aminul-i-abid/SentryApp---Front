import { useEffect, useImperativeHandle, forwardRef } from 'react';
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Divider,
	FormControlLabel,
	Switch,
	TextField,
	Typography
} from '@mui/material';
import { User, UserWithPassword } from '../types';
import { YesNo } from '@/utils/enums';
import { useAppDispatch } from 'src/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z
	.object({
		firstName: z.string().min(1, 'First name is required'),
		lastName: z.string().min(1, 'Last name is required'),
		email: z.string().min(1, 'Email is required').email('Invalid email format'),
		enabled: z.number(),
		enable2FA: z.number(),
		password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.string().length(0)),
		confirmPassword: z.string().optional().or(z.string().length(0))
	})
	.refine(
		(data) => {
			if (data.password && data.password.length > 0) {
				return data.password === data.confirmPassword;
			}

			return true;
		},
		{
			message: "Passwords don't match",
			path: ['confirmPassword']
		}
	);

type FormData = z.infer<typeof schema>;

export interface UserFormRef {
	submit: () => void;
}

interface UserFormProps {
	user?: User;
	onSave: (user: UserWithPassword) => Promise<void>;
}

const UserForm = forwardRef<UserFormRef, UserFormProps>(({ user, onSave }, ref) => {
	const dispatch = useAppDispatch();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			enabled: YesNo.Yes,
			enable2FA: YesNo.No,
			password: '',
			confirmPassword: ''
		}
	});

	useEffect(() => {
		if (user) {
			reset({
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				enabled: user.enabled,
				enable2FA: user.enable2FA
			});
		}
	}, [user, reset]);

	useImperativeHandle(ref, () => ({
		submit: () => handleSubmit(onSubmit)()
	}));

	const onSubmit = async (data: FormData) => {
		try {
			await onSave({
				id: user?.id || '',
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				enabled: data.enabled,
				enable2FA: data.enable2FA,
				lastAccess: user?.lastAccess || '',
				password: data.password || ''
			});
		} catch (error) {
			dispatch(
				showMessage({
					message: 'Error saving user',
					variant: 'error',
					autoHideDuration: 3000
				})
			);
			console.error('Error saving user:', error);
		}
	};

	return (
		<Box
			className="flex flex-col gap-4"
			component="form"
			onSubmit={handleSubmit(onSubmit)}
			id="userForm"
		>
			{/* User Data Section */}
			<Card>
				<CardHeader title="User Information" />
				<Divider />
				<CardContent className="flex flex-col gap-4">
					<Controller
						name="firstName"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="First Name"
								fullWidth
								error={!!errors.firstName}
								helperText={errors.firstName?.message}
							/>
						)}
					/>
					<Controller
						name="lastName"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Last Name"
								fullWidth
								error={!!errors.lastName}
								helperText={errors.lastName?.message}
							/>
						)}
					/>
					<Controller
						name="email"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Email"
								type="email"
								fullWidth
								error={!!errors.email}
								helperText={errors.email?.message}
							/>
						)}
					/>
					<Box className="flex gap-4">
						<Controller
							name="enabled"
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={
										<Switch
											checked={field.value === YesNo.Yes}
											onChange={(e) => field.onChange(e.target.checked ? YesNo.Yes : YesNo.No)}
										/>
									}
									label="Enabled"
								/>
							)}
						/>
					</Box>
				</CardContent>
			</Card>

			{/* Password Section */}
			<Card>
				<CardHeader title="Password" />
				<Divider />
				<CardContent className="flex flex-col gap-4">
					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="New Password"
								type="password"
								fullWidth
								error={!!errors.password}
								helperText={errors.password?.message}
							/>
						)}
					/>
					<Controller
						name="confirmPassword"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Confirm Password"
								type="password"
								fullWidth
								error={!!errors.confirmPassword}
								helperText={errors.confirmPassword?.message}
							/>
						)}
					/>
				</CardContent>
			</Card>

			{/* 2FA Section */}
			<Card>
				<CardHeader title="Two-Factor Authentication" />
				<Divider />
				<CardContent>
					<Controller
						name="enable2FA"
						control={control}
						render={({ field }) => (
							<>
								<FormControlLabel
									control={
										<Switch
											checked={field.value === YesNo.Yes}
											onChange={(e) => field.onChange(e.target.checked ? YesNo.Yes : YesNo.No)}
										/>
									}
									label="Enable Two-Factor Authentication"
								/>
								{field.value === YesNo.Yes && (
									<Typography
										variant="body2"
										color="textSecondary"
										className="mt-2"
									>
										Two-factor authentication adds an extra layer of security to your account
									</Typography>
								)}
							</>
						)}
					/>
				</CardContent>
			</Card>
		</Box>
	);
});

UserForm.displayName = 'UserForm';

export default UserForm;
