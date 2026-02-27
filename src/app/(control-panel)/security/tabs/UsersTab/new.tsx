import { useState, useRef } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import UserForm from './components/form';
import { UserWithPassword } from './types';
import { createUser } from './services';
import Link from '@fuse/core/Link';
import { useAppDispatch } from 'src/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import useNavigate from '@fuse/hooks/useNavigate';
import { UserFormRef } from './components/form';

export default function NewUser() {
	const [saving, setSaving] = useState(false);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const formRef = useRef<UserFormRef>(null);

	const handleSave = async (userData: UserWithPassword) => {
		try {
			setSaving(true);
			const response = await createUser(userData);

			if (response.succeeded) {
				dispatch(
					showMessage({
						message: 'User created successfully',
						variant: 'success',
						autoHideDuration: 3000
					})
				);
				setTimeout(() => navigate('/security/users'), 3000);
			} else {
				dispatch(
					showMessage({
						message: response.errors.join(', '),
						variant: 'error',
						autoHideDuration: 3000
					})
				);
			}
		} catch (error) {
			console.error('Error creating user:', error);
			dispatch(
				showMessage({
					message: 'Error creating user',
					variant: 'error',
					autoHideDuration: 3000
				})
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Box>
			<Box className="mb-6 flex justify-between items-center">
				<Box className="flex items-center gap-2">
					<IconButton
						color="inherit"
						component={Link}
						to="/security/users"
					>
						<ArrowBackIcon />
					</IconButton>
					<Typography variant="h5">Create New User</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<SaveIcon />}
					onClick={() => formRef.current?.submit()}
					disabled={saving}
				>
					Save
				</Button>
			</Box>
			<UserForm
				ref={formRef}
				onSave={handleSave}
			/>
		</Box>
	);
}
