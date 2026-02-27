export type EndpointsDefinition = Record<string, string>;

/*export interface ApiResponse<T> {
	data?: T;
	result: ApiResult;
}*/

export interface ApiResponse<T> {
	data?: T;
	succeeded: boolean;
	message: string[];
	errors: string[];
}

export interface ApiResult {
	succeeded: boolean;
	errors: string[];
	message: string[];
}

export interface Paginated {
	page: number;
	pageSize: number;
}

export interface PaginatedWithFilter<T> extends Paginated {
	filters: T;
}

export interface DatetimeRange {
	from: Date;
	to: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
	totalCount: number;
}

export type EnumDto = {
	id: number;
	description: string;
};
