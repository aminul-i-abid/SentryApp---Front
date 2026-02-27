'use client';

import React, { useState, useEffect } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { useSnackbar } from 'notistack';
import { useLoading } from '@/contexts/LoadingContext';
import { getContractors } from '../contractors/contractorsService';
import { ContractorResponse } from '../contractors/models/ContractorResponse';
import { generateExcelReport, ReportExcelRequest } from './reportsService';
import FiltersSection from './components/FiltersSection';
import ReservationsOptions from './components/ReservationsOptions';
import RoomsOptions from './components/RoomsOptions';
import SpecificFieldsSelector, { SpecificFields } from './components/SpecificFieldsSelector';
import DownloadButton from './components/DownloadButton';
import { Grid } from '@mui/material';
import useUser from "@auth/useUser"

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider
  },
  '& .FusePageSimple-content': {},
  '& .FusePageSimple-sidebarHeader': {},
  '& .FusePageSimple-sidebarContent': {}
}));

const Reports: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();
  const { data: user } = useUser()
  console.log("User in Reports:", user)

  // Verificar si el usuario es admin
  const isAdmin = user?.role === "Sentry_Admin" || (Array.isArray(user?.role) && user?.role.includes("Sentry_Admin"))

  // Estados para los filtros
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    contratistas: [] as number[],
    active: true
  });

  // Estados para contratistas
  const [contractors, setContractors] = useState<ContractorResponse[]>([]);
  const [isLoadingContractors, setIsLoadingContractors] = useState(false);

  // Estados para las opciones de Reservas
  const [reservasOptions, setReservasOptions] = useState({
    informacionHuesped: false,
    informacionContratistas: false,
    informacionTtlock: false
  });

  // Estados para las opciones de Habitaciones
  const [habitacionesOptions, setHabitacionesOptions] = useState({
    piso: false,
    camas: false,
    cantReservas: false
  });

  // Estados para los campos específicos
  const [specificFields, setSpecificFields] = useState<SpecificFields>({
    rutHuesped: false,
    emailHuesped: false,
    telefonoHuesped: false,
    estandarHuesped: false,
    jornada: false,
    duracionReserva: false,
    habitacion: false,
    bloque: false,
    estado: false,
    checkin: false,
    checkout: false,
    contratista: false,
    pin: false
  });

  // Cargar contratistas al montar el componente
  useEffect(() => {
    const fetchContractors = async () => {
      setIsLoadingContractors(true);
      try {
        const response = await getContractors();
        if (response.succeeded) {
          setContractors(response.data || []);
        } else {
          console.error('Error fetching contractors:', response.message);
          enqueueSnackbar('Error al cargar los contratistas', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error fetching contractors:', error);
        enqueueSnackbar('Error al cargar los contratistas', { variant: 'error' });
      } finally {
        setIsLoadingContractors(false);
      }
    };

    fetchContractors();
  }, [enqueueSnackbar]);

  // Función para manejar cambios en los filtros
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para resetear filtros
  const handleResetFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: '',
      contratistas: [],
      active: true
    });
  };

  // Función para manejar cambios en las opciones de Reservas
  const handleReservasChange = (option: string) => {
    setReservasOptions(prev => ({
      ...prev,
      [option]: !prev[option as keyof typeof prev]
    }));
  };

  // Función para manejar cambios en las opciones de Habitaciones
  const handleHabitacionesChange = (option: string) => {
    setHabitacionesOptions(prev => ({
      ...prev,
      [option]: !prev[option as keyof typeof prev]
    }));
  };

  // Función para manejar cambios en los campos específicos
  const handleSpecificFieldChange = (field: string) => {
    setSpecificFields(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  // Función para descargar Excel
  const handleDownloadExcel = async () => {
    try {
      showLoading('Se está generando el reporte Excel, aguarde un instante...');

      // Mapear los valores de los checkboxes al formato esperado por el API
      const reportRequest: ReportExcelRequest = {
        fields: {
          rutHuesped: specificFields.rutHuesped,
          emailHuesped: specificFields.emailHuesped,
          telefonoHuesped: specificFields.telefonoHuesped,
          estandarHuesped: specificFields.estandarHuesped,
          jornada: specificFields.jornada,
          duracionReserva: specificFields.duracionReserva,
          habitacion: specificFields.habitacion,
          bloque: specificFields.bloque,
          estado: specificFields.estado,
          checkin: specificFields.checkin,
          checkout: specificFields.checkout,
          contratista: specificFields.contratista,
          pin: specificFields.pin
        },
        // Agregar los filtros
        startDate: filters.fechaDesde || undefined,
        endDate: filters.fechaHasta || undefined,
        companyIds: filters.contratistas.length > 0 ? filters.contratistas : undefined,
        active: filters.active
      };

      await generateExcelReport(reportRequest);

      enqueueSnackbar('Reporte Excel generado y descargado exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      enqueueSnackbar('Error al generar el reporte Excel', { variant: 'error' });
    } finally {
      hideLoading();
    }
  };

  // Contar opciones seleccionadas
  const specificFieldsSelectedCount = Object.values(specificFields).filter(Boolean).length;
  const totalSelected = specificFieldsSelectedCount;

  return (
    <Root
      header={
        <div className='p-6 flex items-center justify-between'>
          {isMobile && <NavbarToggleButton className='h-10 w-10 p-0' />}
          <div className='flex items-center space-x-3'>
            <h2 className='text-2xl font-bold text-gray-800'>Reportes</h2>
          </div>
        </div>
      }
      content={
        <div className='p-6'>
          <div className='flex flex-col space-y-3'>

            {/* Sección de Filtros */}
            <FiltersSection
              filters={filters}
              contractors={contractors}
              isAdmin={isAdmin}
              user={user}
              isLoadingContractors={isLoadingContractors}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            {/* Cards de selección */}
            <Grid container spacing={3}>
              {/* Card de Reservas - COMENTADO TEMPORALMENTE */}
              {/* <Grid item xs={12} md={6}>
                <ReservationsOptions
                  options={reservasOptions}
                  onOptionChange={handleReservasChange}
                />
              </Grid> */}

              {/* Card de Habitaciones - COMENTADO TEMPORALMENTE */}
              {/* <Grid item xs={12} md={6}>
                <RoomsOptions
                  options={habitacionesOptions}
                  onOptionChange={handleHabitacionesChange}
                />
              </Grid> */}

              {/* Card de Campos Específicos */}
              <Grid item xs={12}>
                <SpecificFieldsSelector
                  fields={specificFields}
                  onFieldChange={handleSpecificFieldChange}
                />
              </Grid>
            </Grid>

            {/* Botón de Descarga */}
            <DownloadButton
              totalSelected={totalSelected}
              onDownload={handleDownloadExcel}
            />
          </div>
        </div>
      }
    />
  );
};

export default Reports;
