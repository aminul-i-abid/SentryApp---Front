// Interfaces para los reportes
export interface ReportData {
    id: number;
    title: string;
    description: string;
    type: string;
    createdAt: string;
    status: string;
}

export interface ReportFilter {
    startDate: string;
    endDate: string;
    type: string;
    status: string;
}