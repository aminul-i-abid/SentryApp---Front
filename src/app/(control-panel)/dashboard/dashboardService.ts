import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { DashboardResponse } from './models/DashboardResponse';
import { DisabledRoomContract } from './models/DisabledRoomsContracts';
import { LostBedRoomContract } from './models/LostBedRoomContract';
import { BlockOccupancyDetail } from './models/DashboardResponse';

const endpoint = '/Dashboard';

export const getDashboard = async (companyId?: string | null): Promise<ApiResponse<DashboardResponse>> => {
    const url = companyId ? `${endpoint}?companyId=${companyId}` : endpoint;
    return genericService.get<DashboardResponse>(url);
};
const endpointTest = '/Dashboard/summary-full';

export const getDashboardTest = async (companyId?: string | null): Promise<ApiResponse<DashboardResponse>> => {
    const url = companyId ? `${endpointTest}?companyId=${companyId}` : endpointTest;
    return genericService.get<DashboardResponse>(url);
}

export const getDisabledRooms = async (id: string): Promise<ApiResponse<DisabledRoomContract[]>> => {
    const url = `${endpoint}/disabled-rooms?companyId=${id}`;
    return genericService.get<DisabledRoomContract[]>(url);
};

export const getLostBeds = async (id: string): Promise<ApiResponse<LostBedRoomContract[]>> => {
    const url = `${endpoint}/lost-beds?companyId=${id}`;
    return genericService.get<LostBedRoomContract[]>(url);
};

export const getBlockOccupancyDetail = async (blockId: number): Promise<ApiResponse<BlockOccupancyDetail>> => {
    const url = `${endpoint}/block-occupancy?blockId=${blockId}`;
    return genericService.get<BlockOccupancyDetail>(url);
};
