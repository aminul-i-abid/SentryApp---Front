import apiService from '@/utils/apiService';
import { Integer } from 'type-fest';

const endpoint = '/Rooms';
const endpointIncidents = '/Incidents';

interface Room {
  blockId: number;
  roomCount: number;
  bedsPerRoom: number;
  companyId: number;
  isStorage: boolean;
  prefix: string;
  suffix: string;
  startNumber: number;
  numberDigits: number;
  tag: number;
  floorNumber: number;
}

interface RoomSingle {
  roomNumber: string;
  beds: number;
  isStorage: boolean;
  blockId: number;
  companyId: number;
  tag: number;
  floorNumber: number;
  disabled?: boolean;
}

interface ApiResponse {
  succeeded: boolean;
  errors?: string[];
  messages?: string[];
  data?: any;
}

interface CreatePinUniqueRequest {
  name: string;
  phoneNumber: string;
  roomId: number;
}

interface PinUniqueHistoryItem {
  id: number;
  name: string;
  phoneNumber: string;
  roomId: number;
  pin: string;
  created: string;
  createdBy: string;
}

interface PinUniqueHistoryResponse {
  items: PinUniqueHistoryItem[];
  totalCount: number;
}

export const createRoomPinUnique = async (payload: CreatePinUniqueRequest): Promise<ApiResponse> => {
  try {
    const response = await apiService.post(`${endpoint}/createPinUnique`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getLastPinUnique = async (roomId: number): Promise<ApiResponse> => {
  try {
    const response = await apiService.get(`${endpoint}/${roomId}/last-pin-unique`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getPinUniqueHistory = async (roomId: number, size: number = 3, pageNumber: number = 1): Promise<ApiResponse> => {
  try {
    const response = await apiService.get(`${endpoint}/${roomId}/pin-uniques?pageNumber=${pageNumber}&pageSize=${size}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getRoomIncidents = async (roomId: number): Promise<ApiResponse> => {
  try {
    const response = await apiService.get(`${endpoint}/${roomId}/incidents`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const unlockRoom = async (roomId: number): Promise<ApiResponse> => {
  try {
    const response = await apiService.post(`${endpoint}/${roomId}/unlock`, {});
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

interface UpdateRoomIncidentRequest {
  id: number;
  status: number;
  commentsResolution?: string | null;
}

export const updateRoomIncident = async (incidentId: number, payload: UpdateRoomIncidentRequest): Promise<ApiResponse> => {
  try {
    const response = await apiService.put(`${endpointIncidents}/${incidentId}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const createRoom = async (roomData: Room): Promise<ApiResponse> => {
  try {
    const response = await apiService.post(endpoint + '/Bulk', roomData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const createRoomSingle = async (roomData: RoomSingle): Promise<ApiResponse> => {
  try {
    const response = await apiService.post(endpoint, roomData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getRooms = async (): Promise<ApiResponse> => {
  try {
    const response = await apiService.get(endpoint);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getRoomById = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await apiService.get(`${endpoint}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const updateRoom = async (id: string, roomData: RoomSingle): Promise<ApiResponse> => {
  try {
    const response = await apiService.put(`${endpoint}/${id}`, roomData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const deleteRoom = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await apiService.delete(`${endpoint}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getAvailableRooms = async (
  companyId?: number,
  checkinDate?: string,
  checkoutDate?: string,
  tag?: string,
  sharedBooking?: boolean // Renombrado
): Promise<ApiResponse> => {
  try {
    const params: Record<string, any> = {};
    if (companyId !== undefined) params.companyId = companyId;
    if (checkinDate) params.checkinDate = checkinDate;
    if (checkoutDate) params.checkoutDate = checkoutDate;
    if (tag) params.tag = tag;
    if (typeof sharedBooking !== 'undefined') params.sharedBooking = sharedBooking; // Renombrado
    const response = await apiService.get(endpoint + '/available', { params });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getRoomsByBlock = async (
  blockId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
  companyIds?: number[] | null,
  search?: string | null
): Promise<ApiResponse> => {
  try {
    const params: Record<string, any> = {
      pageNumber,
      pageSize
    };
    
    if (search && search.trim()) {
      params.search = search.trim();
    }
    
    // For arrays in query parameters, we need to handle them specially
    // .NET Core expects repeated parameters for arrays: ?companyIds=1&companyIds=2&companyIds=3
    let config: any = { params };
    
    if (companyIds && companyIds.length > 0) {
      // Create URLSearchParams to handle array serialization correctly
      const searchParams = new URLSearchParams();
      
      // Add non-array parameters
      searchParams.append('pageNumber', pageNumber.toString());
      searchParams.append('pageSize', pageSize.toString());
      
      if (search && search.trim()) {
        searchParams.append('search', search.trim());
      }
      
      // Add array parameters (repeat the parameter name for each value)
      companyIds.forEach(id => {
        searchParams.append('companyIds', id.toString());
      });
      
      // Override the config to use raw query string
      config = {
        params: {},
        paramsSerializer: () => searchParams.toString()
      };
    }
    
    const response = await apiService.get(`${endpoint}/block/${blockId}`, config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getAllRoomsPaginated = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  companyIds?: number[] | null,
  search?: string | null,
  sortBy?: string | null,
  sortOrder?: 'asc' | 'desc'
): Promise<ApiResponse> => {
  try {
    const searchParams = new URLSearchParams();
    
    // Add pagination parameters
    searchParams.append('pageNumber', pageNumber.toString());
    searchParams.append('pageSize', pageSize.toString());
    
    // Add search parameter
    if (search && search.trim()) {
      searchParams.append('search', search.trim());
    }
    
    // Add sorting parameters
    if (sortBy) {
      searchParams.append('sortBy', sortBy);
    }
    if (sortOrder) {
      searchParams.append('sortOrder', sortOrder);
    }
    
    // Add company filter (array parameters)
    if (companyIds && companyIds.length > 0) {
      companyIds.forEach(id => {
        searchParams.append('companyIds', id.toString());
      });
    }
    
    const config = {
      params: {},
      paramsSerializer: () => searchParams.toString()
    };
    
    const response = await apiService.get(endpoint, config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const updateRoomDisabledStatus = async (
  id: number, 
  action: number, 
  comments: string
): Promise<ApiResponse> => {
  try {
    const requestBody = {
      action,
      comments
    };
    
    const response = await apiService.put(`${endpoint}/${id}/disabled`, requestBody);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getRoomCompanyHistory = async (roomId: number): Promise<ApiResponse> => {
  try {
    const response = await apiService.get(`${endpoint}/${roomId}/company-history`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getRoomDisabledHistory = async (roomId: number): Promise<ApiResponse> => {
  try {
    const response = await apiService.get(`${endpoint}/${roomId}/disabled-history`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};

export const getRoomsByCompanyAndJobTitle = async (
  companyId: number,
  jobTitleId: string
): Promise<ApiResponse> => {
  try {
    const params = {
      companyId,
      jobTitleId
    };
    
    const response = await apiService.get(`${endpoint}/by-company-and-jobtitle`, { params });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      succeeded: false,
      errors: ['Error de conexión al servidor']
    };
  }
};