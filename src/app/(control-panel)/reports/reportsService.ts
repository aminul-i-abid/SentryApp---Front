import apiService from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { saveAs } from 'file-saver';

const endpoint = '/Report';

export interface ReportExcelRequest {
  fields: {
    rutHuesped: boolean;
    emailHuesped: boolean;
    telefonoHuesped: boolean;
    estandarHuesped: boolean;
    jornada: boolean;
    duracionReserva: boolean;
    habitacion: boolean;
    bloque: boolean;
    estado: boolean;
    checkin: boolean;
    checkout: boolean;
    contratista: boolean;
    pin: boolean;
  };
  startDate?: string;
  endDate?: string;
  companyIds?: number[];
  active?: boolean;
}

export const generateExcelReport = async (request: ReportExcelRequest): Promise<void> => {
  try {
    const response = await apiService.post(`${endpoint}/generate-excel`, request, {
      responseType: 'blob'
    });
    
    // Crear un blob con la respuesta
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Generar nombre del archivo con fecha
    const date = new Date().toISOString().split('T')[0];
    const fileName = `reporte_${date}.xlsx`;
    
    // Descargar el archivo
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw new Error('Error al generar el reporte Excel');
  }
};