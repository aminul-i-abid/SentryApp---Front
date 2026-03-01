export interface CampResponse {
  id: number;
  name: string;
  location: string;
  coordinates: string;
  capacity: number;
  type: string;
  services: string;
  blocks: any[]; // You might want to create a specific type for blocks if needed
  created: string;
  createdBy: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  // Image fields - the API may return any of these
  images?: string[];
  image?: string;
  imageUrl?: string;
  photos?: string[];
}
