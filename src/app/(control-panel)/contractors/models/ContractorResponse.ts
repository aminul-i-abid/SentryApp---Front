export interface ContractorResponse {
    id: number;
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    state?: boolean;
    contract?: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    rooms: any[];
    created: string;
} 