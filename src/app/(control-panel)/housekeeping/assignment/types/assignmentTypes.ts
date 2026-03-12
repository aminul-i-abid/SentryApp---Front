// Assignment level types
export type AssignmentLevel = 'camp' | 'block' | 'room';

// Block interface
export interface Block {
  id: string;
  name: string;
  campId: string;
  roomCount: number;
  hasActiveReservations: boolean;
  createdAt: string;
}

// Room interface
export interface Room {
  id: string;
  number: string;
  blockId: string;
  blockName: string;
  campId: string;
  bedCount: number;
  hasActiveReservation: boolean;
  lastHousekeeping?: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
}

// User (Cleaning Staff) interface
export interface CleaningStaff {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roles: string[];
  lastActivity?: string;
  currentTaskCount?: number; // Tasks assigned today
}

// Assignment state interface
export interface TaskAssignmentState {
  selectedDate: Date;
  selectedLevel: AssignmentLevel;
  selectedTargets: string[]; // Block IDs or Room IDs
  selectedUsers: string[];   // User IDs
  isPreviewVisible: boolean;
  isSubmitting: boolean;
}

// Assignment preview data
export interface AssignmentPreviewData {
  totalRooms: number;
  roomsPerUser: number;
  estimatedTimeMinutes: number;
  selectedBlocks: Block[];
  selectedRooms: Room[];
  selectedUsers: CleaningStaff[];
}

// Assignment result
export interface AssignmentResult {
  success: boolean;
  tasksCreated: number;
  taskIds: string[];
  message?: string;
}
