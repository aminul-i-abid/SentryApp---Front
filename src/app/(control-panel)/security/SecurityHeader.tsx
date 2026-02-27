import clsx from 'clsx';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

type SecurityAppHeaderProps = {
	className?: string;
	onSetSidebarOpen: (open: boolean) => void;
};

function SecurityHeader(props: SecurityAppHeaderProps) {
	const { className, onSetSidebarOpen } = props;
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<div className={clsx('flex space-x-3', className)}>
			{isMobile && (
				<IconButton
					className="border border-divider"
					onClick={() => onSetSidebarOpen(true)}
					aria-label="open left sidebar"
				>
					<FuseSvgIcon>heroicons-outline:bars-3</FuseSvgIcon>
				</IconButton>
			)}

			<div>
				<PageBreadcrumb />
			</div>
		</div>
	);
}

export default SecurityHeader;
