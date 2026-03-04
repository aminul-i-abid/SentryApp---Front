"use client";

import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import TopbarHeader from "@/components/TopbarHeader";
import FormDialog from "@/components/ui/FormDialog";
import FusePageSimple from "@fuse/core/FusePageSimple";
import useNavigate from "@fuse/hooks/useNavigate";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React, { useCallback, useEffect, useState } from "react";
import { getBlocks } from "../block/blockService";
import { BlockResponse } from "../block/models/BlockResponse";
import { getContractors } from "../contractors/contractorsService";
import { ContractorResponse } from "../contractors/models/ContractorResponse";
import ReserveDetailSidebar from "../reserve/component/ReserveDetailSidebar";
import { getCalendarData } from "../reserve/reserveService";
import { CalendarReservation } from "./models/CalendarResponse";

interface RoomData {
  roomNumber: string;
  beds: number;
  blockName: string;
  campName: string;
  checkInTime: string;
  checkOutTime: string;
  reservations: CalendarReservation[];
}

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: number;
}

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-content > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-header > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

const Calendar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const navigate = useNavigate();

  // Función para formatear hora sin segundos
  const formatTime = (time: string): string => {
    return time.substring(0, 5); // Toma solo HH:MM de HH:MM:SS
  };

  // Estado para las fechas seleccionadas
  const getNext7Days = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);
    return { start: today, end: endDate };
  };

  const [selectedDates, setSelectedDates] = useState(getNext7Days());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempDates, setTempDates] = useState(getNext7Days());
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<BlockResponse | null>(
    null,
  );
  const [tempSelectedBlock, setTempSelectedBlock] =
    useState<BlockResponse | null>(null);
  const [selectedOccupied, setSelectedOccupied] = useState<boolean | null>(
    null,
  );
  const [tempSelectedOccupied, setTempSelectedOccupied] = useState<
    boolean | null
  >(null);
  const [contractors, setContractors] = useState<ContractorResponse[]>([]);
  const [selectedContractor, setSelectedContractor] =
    useState<ContractorResponse | null>(null);
  const [tempSelectedContractor, setTempSelectedContractor] =
    useState<ContractorResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(
    null,
  );

  // Cargar bloques
  const loadBlocks = useCallback(async () => {
    try {
      const response = await getBlocks();
      if (response.succeeded && response.data) {
        setBlocks(response.data);
      } else {
        console.error("Error loading blocks:", response.errors);
        setBlocks([]);
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
      setBlocks([]);
    }
  }, []);

  // Cargar contratistas
  const loadContractors = useCallback(async () => {
    try {
      const response = await getContractors();
      if (response.succeeded && response.data) {
        setContractors(response.data);
      } else {
        console.error("Error loading contractors:", response.errors);
        setContractors([]);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
      setContractors([]);
    }
  }, []);

  // Cargar datos del calendario
  const loadCalendarData = useCallback(
    async (
      dates = selectedDates,
      block = selectedBlock,
      occupied = selectedOccupied,
      contractor = selectedContractor,
    ) => {
      setLoading(true);
      try {
        const startDate = dates.start.toISOString().split("T")[0];
        const endDate = dates.end.toISOString().split("T")[0];
        const blockId = block?.id;
        const companyId = contractor?.id;

        const response = await getCalendarData(
          startDate,
          endDate,
          blockId,
          occupied,
          companyId,
        );

        if (response.succeeded && response.data) {
          setRooms(response.data);
        } else {
          console.error("Error loading calendar data:", response.errors);
          setRooms([]);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Cargar datos iniciales
  useEffect(() => {
    loadCalendarData();
  }, []);

  // Cerrar select cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSelectOpen) {
        const target = event.target as Element;
        const selectElement = target.closest("[data-select-container]");
        if (!selectElement) {
          setIsSelectOpen(false);
          setSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectOpen]);

  // Generar días basado en las fechas seleccionadas
  const generateWeekDays = (): DayData[] => {
    const days: DayData[] = [];
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const start = new Date(selectedDates.start);
    const end = new Date(selectedDates.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      days.push({
        date,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
      });
    }

    return days;
  };

  const weekDays = generateWeekDays();

  // Función para manejar el cambio de fechas temporales
  const handleTempDateChange = (type: "start" | "end", dateString: string) => {
    const newDate = new Date(dateString);
    setTempDates((prev) => ({
      ...prev,
      [type]: newDate,
    }));
  };

  // Función para resetear las fechas temporales a los próximos 7 días
  const resetTempToNext7Days = () => {
    setTempDates(getNext7Days());
  };

  // Función para aplicar los cambios
  const applyDateChanges = () => {
    setSelectedDates(tempDates);
    setSelectedBlock(tempSelectedBlock);
    setSelectedOccupied(tempSelectedOccupied);
    setSelectedContractor(tempSelectedContractor);
    setIsFilterOpen(false);
    // Cargar datos con los nuevos filtros
    loadCalendarData(
      tempDates,
      tempSelectedBlock,
      tempSelectedOccupied,
      tempSelectedContractor,
    );
  };

  // Función para cancelar los cambios
  const cancelDateChanges = () => {
    setTempDates(selectedDates);
    setTempSelectedBlock(selectedBlock);
    setTempSelectedOccupied(selectedOccupied);
    setTempSelectedContractor(selectedContractor);
    setSearchTerm("");
    setIsSelectOpen(false);
    setIsFilterOpen(false);
  };

  // Función para abrir el modal con las fechas actuales
  const openFilter = () => {
    setTempDates(selectedDates);
    setTempSelectedBlock(selectedBlock);
    setTempSelectedOccupied(selectedOccupied);
    setTempSelectedContractor(selectedContractor);
    setSearchTerm("");
    setIsSelectOpen(false);
    loadBlocks(); // Cargar bloques cuando se abre el modal
    loadContractors(); // Cargar contratistas cuando se abre el modal
    setIsFilterOpen(true);
  };

  // Función para verificar si hay un filtro aplicado
  const isFilterApplied = (): boolean => {
    const defaultDates = getNext7Days();

    // Comparar fechas normalizadas (solo año, mes, día)
    const selectedStart = new Date(
      selectedDates.start.getFullYear(),
      selectedDates.start.getMonth(),
      selectedDates.start.getDate(),
    );
    const selectedEnd = new Date(
      selectedDates.end.getFullYear(),
      selectedDates.end.getMonth(),
      selectedDates.end.getDate(),
    );
    const defaultStart = new Date(
      defaultDates.start.getFullYear(),
      defaultDates.start.getMonth(),
      defaultDates.start.getDate(),
    );
    const defaultEnd = new Date(
      defaultDates.end.getFullYear(),
      defaultDates.end.getMonth(),
      defaultDates.end.getDate(),
    );

    return (
      selectedStart.getTime() !== defaultStart.getTime() ||
      selectedEnd.getTime() !== defaultEnd.getTime() ||
      selectedBlock !== null ||
      selectedOccupied !== null ||
      selectedContractor !== null
    );
  };

  // Filtrar bloques basado en el término de búsqueda
  const filteredBlocks = blocks.filter(
    (block) =>
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (block.campName &&
        block.campName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Funciones para trabajar con reservas
  const normalizeDate = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isSameDate = (a: Date, b: Date): boolean => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getReservationsForRoomAndDate = (
    roomNumber: string,
    date: Date,
  ): CalendarReservation[] => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) return [];

    const targetDate = normalizeDate(date);

    return room.reservations.filter((reservation) => {
      const startDate = normalizeDate(new Date(reservation.startDate));
      const endDate = normalizeDate(new Date(reservation.endDate));
      return targetDate >= startDate && targetDate <= endDate;
    });
  };

  interface ReservationInterval {
    reservation: CalendarReservation;
    startIndex: number;
    span: number;
    endIndex: number;
  }

  interface LaneSegmentBase {
    startIndex: number;
    span: number;
  }
  interface LaneReservationSegment extends LaneSegmentBase {
    type: "reservation";
    reservation: CalendarReservation;
  }
  interface LaneAvailableSegment extends LaneSegmentBase {
    type: "available";
  }
  type LaneSegment = LaneReservationSegment | LaneAvailableSegment;

  const buildRoomLanes = (room: RoomData): LaneSegment[][] => {
    // Calcular intervalos visibles por reserva dentro del rango de weekDays
    const firstDay = normalizeDate(weekDays[0].date);
    const lastDay = normalizeDate(weekDays[weekDays.length - 1].date);

    const intervals: ReservationInterval[] = room.reservations
      .map((reservation) => {
        const resStart = normalizeDate(new Date(reservation.startDate));
        const resEnd = normalizeDate(new Date(reservation.endDate));
        const visibleStart = resStart > firstDay ? resStart : firstDay;
        const visibleEnd = resEnd < lastDay ? resEnd : lastDay;
        if (visibleStart > visibleEnd) return null;
        const startIndex = weekDays.findIndex(
          (d) => normalizeDate(d.date).getTime() === visibleStart.getTime(),
        );
        const endIndex = weekDays.findIndex(
          (d) => normalizeDate(d.date).getTime() === visibleEnd.getTime(),
        );
        if (startIndex === -1 || endIndex === -1) return null;
        const span = endIndex - startIndex + 1;
        return {
          reservation,
          startIndex,
          span,
          endIndex,
        } as ReservationInterval;
      })
      .filter((x): x is ReservationInterval => !!x)
      .sort((a, b) => a.startIndex - b.startIndex || b.span - a.span);

    // Asignar intervalos a carriles (hasta 3) evitando solapamientos dentro del mismo carril
    const laneIntervals: ReservationInterval[][] = [];
    intervals.forEach((interval) => {
      let placed = false;
      for (let i = 0; i < laneIntervals.length; i++) {
        const lane = laneIntervals[i];
        const last = lane[lane.length - 1];
        if (!last || interval.startIndex > last.endIndex) {
          lane.push(interval);
          placed = true;
          break;
        }
      }
      if (!placed && laneIntervals.length < 3) {
        laneIntervals.push([interval]);
      }
      // Si ya hay 3 carriles y no se pudo ubicar, se omite (opcional: mostrar "+N más" en celdas)
    });

    // Construir segmentos por carril (mezclando disponibles y reservas) a lo largo de la semana
    const lanes: LaneSegment[][] = laneIntervals.map((lane) => {
      const segments: LaneSegment[] = [];
      let cursor = 0;
      lane.forEach((interval) => {
        if (interval.startIndex > cursor) {
          segments.push({
            type: "available",
            startIndex: cursor,
            span: interval.startIndex - cursor,
          });
        }
        segments.push({
          type: "reservation",
          reservation: interval.reservation,
          startIndex: interval.startIndex,
          span: interval.span,
        });
        cursor = interval.endIndex + 1;
      });
      if (cursor < weekDays.length) {
        segments.push({
          type: "available",
          startIndex: cursor,
          span: weekDays.length - cursor,
        });
      }
      return segments;
    });

    // Si no hay reservas, crear un carril único con todo disponible
    if (lanes.length === 0) {
      return [
        [
          {
            type: "available",
            startIndex: 0,
            span: weekDays.length,
          } as LaneAvailableSegment,
        ],
      ];
    }

    return lanes;
  };

  // Función para manejar el click en una reserva
  const handleReservationClick = (reservation: CalendarReservation) => {
    if (reservation.reservationId) {
      setSelectedReserveId(reservation.reservationId);
      setIsReserveModalOpen(true);
    }
  };

  const handleCloseReserveModal = () => {
    setIsReserveModalOpen(false);
    setSelectedReserveId(null);
  };

  return (
    <>
      <Root
        header={<TopbarHeader />}
        content={
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                <h2 className="text-3xl font-bold text-gray-900">
                  Calendario de Habitaciones
                </h2>
              </div>
              <button
                onClick={openFilter}
                className={`bg-white flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-medium cursor-pointer ${
                  isFilterApplied()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <img src="./assets/icons/filter-horizontal.png" alt="" />
                Filter
              </button>
            </div>
            <div className="rounded-lg shadow-sm overflow-hidden">
              {/* Tabla del calendario */}
              <div className="overflow-x-auto">
                <table
                  className="w-full border-separate"
                  style={{ borderSpacing: "1px" }}
                >
                  <thead>
                    <tr>
                      <th className="border border-[#E5E7EB] p-3 text-left font-semibold min-w-[180px] w-[180px] sticky left-0 z-20 bg-white shadow-sm">
                        <span className="text-blue-600">Room No:</span>
                      </th>
                      {weekDays.map((day) => {
                        const today = isSameDate(day.date, new Date());
                        return (
                          <th
                            key={day.date.toISOString()}
                            className="border border-[#E5E7EB] p-3 text-center font-medium min-w-[140px] bg-white text-gray-700"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm">{day.dayName}</span>
                              <span className="text-gray-400">-</span>
                              {today ? (
                                <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                                  {String(day.dayNumber).padStart(2, "0")}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  {String(day.dayNumber).padStart(2, "0")}
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={weekDays.length + 1}
                          className="border border-[#E5E7EB] p-8 text-center"
                        >
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                              Loading...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rooms.flatMap((room) => {
                        const lanes = buildRoomLanes(room);
                        return lanes.map((lane, laneIndex) => (
                          <tr
                            key={`${room.roomNumber}-lane-${laneIndex}`}
                            className="hover:bg-gray-50/50 align-top"
                          >
                            {laneIndex === 0 && (
                              <td
                                className="border border-[#E5E7EB] p-3 bg-white sticky left-0 z-10 shadow-sm"
                                rowSpan={lanes.length}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-blue-600 cursor-pointer hover:underline">
                                    {room.roomNumber}
                                  </span>
                                  <span className="text-gray-400">-</span>
                                  <span className="font-medium text-gray-700">
                                    {room.blockName}
                                  </span>
                                </div>
                              </td>
                            )}
                            {lane.map((segment, idx) => {
                              if (segment.type === "reservation") {
                                const reservation = segment.reservation;
                                return (
                                  <td
                                    key={`${room.roomNumber}-seg-${laneIndex}-${idx}`}
                                    className="border border-[#E5E7EB] p-1"
                                    colSpan={segment.span}
                                  >
                                    <Tooltip
                                      arrow
                                      title={
                                        <div className="text-xs">
                                          <div>
                                            <strong>Reserva:</strong>{" "}
                                            {reservation.bulkReservationGuid}
                                          </div>
                                          <div>
                                            <strong>Huéspedes:</strong>{" "}
                                            {reservation.guestsCount}
                                          </div>
                                          <div>
                                            <strong>Desde:</strong>{" "}
                                            {new Date(
                                              reservation.startDate,
                                            ).toLocaleDateString("es-ES")}{" "}
                                            {formatTime(room.checkInTime)}
                                          </div>
                                          <div>
                                            <strong>Hasta:</strong>{" "}
                                            {new Date(
                                              reservation.endDate,
                                            ).toLocaleDateString("es-ES")}{" "}
                                            {formatTime(room.checkOutTime)}
                                          </div>
                                        </div>
                                      }
                                    >
                                      <div
                                        className="p-1.5 rounded-md border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 min-h-[44px] cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-[1px] border-l-4 border-l-blue-500 ring-1 ring-blue-50"
                                        onClick={() =>
                                          handleReservationClick(reservation)
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="text-[11px] font-semibold truncate max-w-[180px]">
                                            {reservation.bulkReservationGuid} -{" "}
                                            {reservation.fullName}
                                          </div>
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-0.5 truncate">
                                          {new Date(
                                            reservation.startDate,
                                          ).toLocaleDateString("es-ES", {
                                            day: "numeric",
                                            month: "short",
                                          })}{" "}
                                          –{" "}
                                          {new Date(
                                            reservation.endDate,
                                          ).toLocaleDateString("es-ES", {
                                            day: "numeric",
                                            month: "short",
                                          })}
                                        </div>
                                      </div>
                                    </Tooltip>
                                  </td>
                                );
                              }
                              return (
                                <React.Fragment
                                  key={`${room.roomNumber}-seg-${laneIndex}-${idx}`}
                                >
                                  {Array.from({ length: segment.span }).map(
                                    (_, cellIdx) => (
                                      <td
                                        key={`${room.roomNumber}-avail-${laneIndex}-${segment.startIndex + cellIdx}`}
                                        className="border border-[#E5E7EB] p-3 bg-white"
                                      >
                                        <span className="text-sm text-gray-400">
                                          No Data...
                                        </span>
                                      </td>
                                    ),
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        ));
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      />

      {/* Date Filter Drawer */}
      <FormDialog
        open={isFilterOpen}
        onClose={cancelDateChanges}
        title="Filtro de Fechas"
        variant="drawer"
        hideActions
      >
        {/* Row 1: Date pickers */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Start date"
            type="date"
            size="small"
            fullWidth
            value={tempDates.start.toISOString().split("T")[0]}
            onChange={(e) => handleTempDateChange("start", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End date"
            type="date"
            size="small"
            fullWidth
            value={tempDates.end.toISOString().split("T")[0]}
            onChange={(e) => handleTempDateChange("end", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Row 2: Three filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Filter by contractor</InputLabel>
            <Select
              label="Filter by contractor"
              value={
                tempSelectedContractor ? String(tempSelectedContractor.id) : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setTempSelectedContractor(null);
                } else {
                  const contractor =
                    contractors.find((c) => c.id === Number(value)) || null;
                  setTempSelectedContractor(contractor);
                }
              }}
            >
              <MenuItem value="">All Contractor</MenuItem>
              {contractors.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Filter by pavilion</InputLabel>
            <Select
              label="Filter by pavilion"
              value={tempSelectedBlock ? String(tempSelectedBlock.id) : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setTempSelectedBlock(null);
                } else {
                  const block =
                    blocks.find((b) => b.id === Number(value)) || null;
                  setTempSelectedBlock(block);
                }
              }}
            >
              <MenuItem value="">Select pavilion</MenuItem>
              {blocks.map((b) => (
                <MenuItem key={b.id} value={String(b.id)}>
                  {b.name}
                  {b.campName ? ` (${b.campName})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Room status</InputLabel>
            <Select
              label="Room status"
              value={
                tempSelectedOccupied === null
                  ? ""
                  : tempSelectedOccupied
                    ? "true"
                    : "false"
              }
              onChange={(e) => {
                if (e.target.value === "") {
                  setTempSelectedOccupied(null);
                } else {
                  setTempSelectedOccupied(e.target.value === "true");
                }
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="false">Available</MenuItem>
              <MenuItem value="true">Occupied</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Actions row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2,
          }}
        >
          {/* Clear Data */}
          <button
            type="button"
            onClick={() => {
              resetTempToNext7Days();
              setTempSelectedBlock(null);
              setTempSelectedOccupied(null);
              setTempSelectedContractor(null);
              setSearchTerm("");
              setIsSelectOpen(false);
            }}
            className="flex items-center gap-1.5 text-red-500 bg-white font-medium rounded-full px-3 py-2 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Limpiar
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <button
              type="button"
              onClick={cancelDateChanges}
              className="px-5 py-2 rounded-full font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={applyDateChanges}
              className="px-5 py-2 rounded-full font-semibold text-white bg-[#415EDE] hover:bg-[#3347b8] transition-colors cursor-pointer"
            >
              Applicar
            </button>
          </Box>
        </Box>
      </FormDialog>

      {/* Sidebar de Detalle de Reserva */}
      <ReserveDetailSidebar
        open={isReserveModalOpen}
        onClose={handleCloseReserveModal}
        reserveId={selectedReserveId}
        onGuestUpdate={() => loadCalendarData()}
      />
    </>
  );
};

export default Calendar;
