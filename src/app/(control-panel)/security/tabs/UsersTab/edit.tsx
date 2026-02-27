import { useEffect, useState, useRef } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import UserForm from './components/form';
import { User, UserWithPassword } from './types';
import { getUser, updateUser, deleteUser } from './services';
import useParams from '@fuse/hooks/useParams';
import useNavigate from '@fuse/hooks/useNavigate';
import { useAppDispatch } from 'src/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { openDialog, closeDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import Link from '@fuse/core/Link';
import { UserFormRef } from './components/form';

export default function EditUser() {
	const { id } = useParams();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [user, setUser] = useState<User | undefined>();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const formRef = useRef<UserFormRef>(null);

	useEffect(() => {
		if (id) {
			loadUser(id);
		}
	}, [id]);

	const loadUser = async (userId: string) => {
		try {
			setLoading(true);
			const response = await getUser(userId);

			if (response.succeeded) {
				setUser(response.data);
			} else {
				dispatch(
					showMessage({
						message: 'Error loading user',
						variant: 'error',
						autoHideDuration: 3000
					})
				);
				navigate('/security/users');
			}
		} catch (error) {
			console.error('Error loading user:', error);
			dispatch(
				showMessage({
					message: 'Error loading user',
					variant: 'error',
					autoHideDuration: 3000
				})
			);
			navigate('/security/users');
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async (userData: UserWithPassword) => {
		try {
			setSaving(true);
			const response = await updateUser(userData);

			if (response.succeeded) {
				dispatch(
					showMessage({
						message: 'User updated successfully',
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
			console.error('Error updating user:', error);
			dispatch(
				showMessage({
					message: 'Error updating user',
					variant: 'error',
					autoHideDuration: 3000
				})
			);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!user) return;

		dispatch(
			openDialog({
				children: (
					<Box className="p-6">
						<Typography className="mb-4">Are you sure you want to delete this user?</Typography>
						<Box className="flex justify-end gap-2">
							<Button
								variant="text"
								onClick={() => dispatch(closeDialog())}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								color="error"
								onClick={async () => {
									dispatch(closeDialog());
									try {
										const response = await deleteUser(user);

										if (response.succeeded) {
											dispatch(
												showMessage({
													message: 'User deleted successfully',
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
										console.error('Error deleting user:', error);
										dispatch(
											showMessage({
												message: 'Error deleting user',
												variant: 'error',
												autoHideDuration: 3000
											})
										);
									}
								}}
							>
								Delete
							</Button>
						</Box>
					</Box>
				)
			})
		);
	};

	if (loading) {
		return (
			<Box className="p-6">
				<Typography>Loading...</Typography>
			</Box>
		);
	}

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
					<Typography variant="h5">Edit User</Typography>
				</Box>
				<Box className="flex gap-2">
					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={handleDelete}
					>
						Delete
					</Button>
					<Button
						variant="contained"
						startIcon={<SaveIcon />}
						onClick={() => formRef.current?.submit()}
						disabled={saving}
					>
						Save
					</Button>
				</Box>
			</Box>
			<UserForm
				ref={formRef}
				user={user}
				onSave={handleSave}
			/>
		</Box>
	);
}
