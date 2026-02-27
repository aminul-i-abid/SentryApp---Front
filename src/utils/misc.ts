import qs from 'qs';

export const serializeParams = (params: any) => {
	return qs.stringify(params, {
		arrayFormat: 'repeat',
		serializeDate: (date: Date) => date.toISOString(),
		encode: false,
		allowDots: true
	});
};
