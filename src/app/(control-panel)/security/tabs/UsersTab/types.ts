import { PaginatedResponse, PaginatedWithFilter } from '@/utils/types';
import { YesNo } from '@/utils/enums';

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	enabled: YesNo;
	enable2FA: YesNo;
	lastAccess: string;
}

export interface UserWithPassword extends User {
	password: string;
}

export interface UserFilters {
	firstName?: string;
	lastName?: string;
	email?: string;
	enabled?: YesNo;
	enable2FA?: YesNo;
}

export interface UserListRequest extends PaginatedWithFilter<UserFilters> {}

export type UsersApiResponse = PaginatedResponse<User[]>;
