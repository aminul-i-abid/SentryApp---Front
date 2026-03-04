import {
  getBlockByCampId,
  getBlocks,
} from "@/app/(control-panel)/block/blockService";
import { getCamps } from "@/app/(control-panel)/camps/campsService";
import { getContractors } from "@/app/(control-panel)/contractors/contractorsService";
import { useLoading } from "@/contexts/LoadingContext";
import {
  resetAuditoryFilters,
  setAuditoryFilters,
} from "@/store/auditoryFiltersSlice";
import { RootState } from "@/store/store";
import useUser from "@auth/useUser";
import { Download } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, isValid, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDoorLockAccessLogsExcel } from "../auditoryService";
import {
  AUDITORY_TABLE_OPTIONS,
  AuditoryTables,
} from "../models/AuditoryTables";

interface AuditoryFiltersProps {
  selectedTable: AuditoryTables | "";
  onTableChange: (event: SelectChangeEvent<AuditoryTables | "">) => void;
}

const AuditoryFilters = ({
  selectedTable,
  onTableChange,
}: AuditoryFiltersProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.auditoryFilters);
  const { showLoading, hideLoading } = useLoading();
  const { data: user } = useUser();
  const hasTTLock = user?.modules?.ttlock === true;

  const [camps, setCamps] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const updateRoomsFromBlocks = (blocks: any[]) => {
    const allRoomsFromBlocks = blocks.flatMap(
      (block: any) => block.rooms || [],
    );
    setAllRooms(allRoomsFromBlocks);
    setFilteredRooms(allRoomsFromBlocks);
  };

  const [loadingCamps, setLoadingCamps] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingContractors, setLoadingContractors] = useState(false);

  const fetchContractors = async () => {
    setLoadingContractors(true);
    try {
      const res = await getContractors();
      setContractors(res.data || []);
    } finally {
      setLoadingContractors(false);
    }
  };

  const fetchCamps = async () => {
    setLoadingCamps(true);
    try {
      const res = await getCamps();
      setCamps(res.data || []);
    } finally {
      setLoadingCamps(false);
    }
  };

  const fetchBlocks = async (campId?: number) => {
    setLoadingBlocks(true);
    try {
      let res;
      if (campId) {
        res = await getBlockByCampId(campId);
      } else {
        res = await getBlocks();
      }
      const blocksData = res.data || [];
      setBlocks(blocksData);
      updateRoomsFromBlocks(blocksData);
    } finally {
      setLoadingBlocks(false);
    }
  };

  useEffect(() => {
    fetchCamps();
    fetchContractors();
    updateRoomsFromBlocks([]);
  }, []);

  useEffect(() => {
    if (filters.campId) {
      fetchBlocks(filters.campId);
    } else {
      fetchBlocks();
    }
  }, [filters.campId, selectedTable]);

  useEffect(() => {
    filterRoomsByBlocks(filters.blockId || []);
  }, [filters.blockId, allRooms]);

  const handleResetFilters = () => {
    dispatch(resetAuditoryFilters());
  };

  const handleDownloadExcel = async () => {
    try {
      showLoading("Se está generando el reporte Excel, aguarde un instante...");
      await getDoorLockAccessLogsExcel();
    } catch (error) {
      console.error("Error downloading Excel:", error);
    } finally {
      hideLoading();
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: any) => {
    dispatch(
      setAuditoryFilters({
        [field]: value && value.length > 0 ? value : null,
      }),
    );
  };

  const handleSelectChange = (field: keyof typeof filters, value: any) => {
    dispatch(setAuditoryFilters({ [field]: value }));
  };

  const filterRoomsByBlocks = (selectedBlockIds: number[]) => {
    if (!selectedBlockIds || selectedBlockIds.length === 0) {
      setFilteredRooms(allRooms);
    } else {
      const filtered = allRooms.filter((room: any) =>
        selectedBlockIds.includes(room.blockId),
      );
      setFilteredRooms(filtered);
    }
  };

  useEffect(() => {
    dispatch(setAuditoryFilters({ table: selectedTable }));
  }, [selectedTable, dispatch]);

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 3,
        borderRadius: "12px",
      }}
    >
      {/* Header row: title + table selector */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Filters
        </Typography>

        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 220,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#fff",
            },
          }}
        >
          <InputLabel id="table-select-label">Audit Table</InputLabel>
          <Select
            labelId="table-select-label"
            id="table-select"
            value={selectedTable}
            onChange={onTableChange}
            label="Audit Table"
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              <em>Select a table</em>
            </MenuItem>
            {AUDITORY_TABLE_OPTIONS.filter(
              (option) => !option.requiresTTLock || hasTTLock,
            ).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.display}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Filters row */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Start date */}
          <DatePicker
            label="Start date"
            value={filters.fechaDesde ? parseISO(filters.fechaDesde) : null}
            onChange={(date: Date | null) => {
              if (date && isValid(date)) {
                handleFilterChange("fechaDesde", format(date, "yyyy-MM-dd"));
              } else {
                handleFilterChange("fechaDesde", "");
              }
            }}
            slotProps={{
              desktopPaper: {
                sx: {
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                },
              },
              textField: {
                size: "small",
                sx: {
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  },
                },
              },
            }}
          />

          {/* End date */}
          <DatePicker
            label="End date"
            value={filters.fechaHasta ? parseISO(filters.fechaHasta) : null}
            onChange={(date: Date | null) => {
              if (date && isValid(date)) {
                handleFilterChange("fechaHasta", format(date, "yyyy-MM-dd"));
              } else {
                handleFilterChange("fechaHasta", "");
              }
            }}
            slotProps={{
              desktopPaper: {
                sx: {
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                },
              },
              textField: {
                size: "small",
                sx: {
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  },
                },
              },
            }}
          />

          {/* Conditional autocompletes based on table */}
          {selectedTable === AuditoryTables.DOORLOCKACCESSLOGS && (
            <Autocomplete
              multiple
              options={blocks}
              getOptionLabel={(option: any) => option.name}
              value={blocks.filter((b: any) =>
                (filters.blockId ?? []).includes(b.id),
              )}
              onChange={(_, value) => {
                const selectedIds = value.map((v: any) => v.id);
                handleFilterChange("blockId", selectedIds);
                filterRoomsByBlocks(selectedIds);
              }}
              loading={loadingBlocks}
              disableCloseOnSelect
              isOptionEqualToValue={(option, value) => option.id === value.id}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pavilion"
                  placeholder="Search..."
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
              )}
              renderTags={(selected) =>
                selected.length > 0 ? [`${selected.length} selected`] : []
              }
              componentsProps={{
                paper: {
                  sx: {
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  },
                },
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {(selectedTable === AuditoryTables.RESERVATIONS ||
            selectedTable === AuditoryTables.DOORLOCK ||
            selectedTable === AuditoryTables.ROOMDISABLEDSTATES ||
            selectedTable === AuditoryTables.WHATSAPP ||
            selectedTable === AuditoryTables.ROOM ||
            selectedTable === AuditoryTables.DOORLOCKACCESSLOGS) && (
            <Autocomplete
              multiple
              options={filteredRooms}
              getOptionLabel={(option: any) =>
                option.roomNumber ? `${option.roomNumber}` : option.id
              }
              value={filteredRooms.filter((r: any) =>
                (filters.roomId ?? []).includes(r.id),
              )}
              onChange={(_, value) =>
                handleFilterChange(
                  "roomId",
                  value.map((v: any) => v.id),
                )
              }
              loading={loadingRooms}
              disableCloseOnSelect
              isOptionEqualToValue={(option, value) => option.id === value.id}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Room"
                  placeholder="Search..."
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
              )}
              renderTags={(selected) =>
                selected.length > 0 ? [`${selected.length} selected`] : []
              }
              componentsProps={{
                paper: {
                  sx: {
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  },
                },
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {selectedTable === AuditoryTables.COMPANY && (
            <Autocomplete
              multiple
              options={contractors}
              getOptionLabel={(option: any) => option.name}
              value={contractors.filter((c: any) =>
                (filters.companyId ?? []).includes(c.id),
              )}
              onChange={(_, value) =>
                handleFilterChange(
                  "companyId",
                  value.map((v: any) => v.id),
                )
              }
              loading={loadingContractors}
              disableCloseOnSelect
              isOptionEqualToValue={(option, value) => option.id === value.id}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Contractor"
                  placeholder="Search..."
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
              )}
              renderTags={(selected) =>
                selected.length > 0 ? [`${selected.length} selected`] : []
              }
              componentsProps={{
                paper: {
                  sx: {
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  },
                },
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {(selectedTable === AuditoryTables.BLOCK ||
            selectedTable === AuditoryTables.CAMP) && (
            <Autocomplete
              multiple
              options={camps}
              getOptionLabel={(option: any) => option.name}
              value={camps.filter((c: any) =>
                (filters.campId ?? []).includes(c.id),
              )}
              onChange={(_, value) =>
                handleFilterChange(
                  "campId",
                  value.map((v: any) => v.id),
                )
              }
              loading={loadingCamps}
              disableCloseOnSelect
              isOptionEqualToValue={(option, value) => option.id === value.id}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Camp"
                  placeholder="Search..."
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
              )}
              renderTags={(selected) =>
                selected.length > 0 ? [`${selected.length} selected`] : []
              }
              componentsProps={{
                paper: {
                  sx: {
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  },
                },
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {(selectedTable === AuditoryTables.BLOCK ||
            selectedTable === AuditoryTables.ROOM) && (
            <Autocomplete
              multiple
              options={blocks}
              getOptionLabel={(option: any) => option.name}
              value={blocks.filter((b: any) =>
                (filters.blockId ?? []).includes(b.id),
              )}
              onChange={(_, value) =>
                handleFilterChange(
                  "blockId",
                  value.map((v: any) => v.id),
                )
              }
              loading={loadingBlocks}
              disableCloseOnSelect
              isOptionEqualToValue={(option, value) => option.id === value.id}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Block"
                  placeholder="Search..."
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
              )}
              renderTags={(selected) =>
                selected.length > 0 ? [`${selected.length} selected`] : []
              }
              componentsProps={{
                paper: {
                  sx: {
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  },
                },
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {selectedTable === AuditoryTables.DOORLOCKACCESSLOGS && (
            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                },
              }}
            >
              <InputLabel>Access Status</InputLabel>
              <Select
                name="success"
                value={
                  filters.success !== null && filters.success !== undefined
                    ? String(filters.success)
                    : ""
                }
                onChange={(e: SelectChangeEvent<string>) => {
                  const value = e.target.value;
                  handleSelectChange(
                    "success",
                    value === "" ? null : Number(value),
                  );
                }}
                label="Access Status"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="1">Successful</MenuItem>
                <MenuItem value="0">Failed</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Download button for DoorLock Access Logs */}
          {selectedTable === AuditoryTables.DOORLOCKACCESSLOGS && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={handleDownloadExcel}
              sx={{
                borderRadius: "20px",
                padding: "8px 20px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Download Audit
            </Button>
          )}

          {/* Reset Filtering */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-red-500 font-medium border border-[#EAEAEA] rounded-full px-4 py-2 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap bg-[#F7F7F7]"
          >
            Reset Filtering
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
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default AuditoryFilters;
