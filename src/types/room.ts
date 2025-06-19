
export interface Room {
  id: string;
  room_number: string;
  floor: string;
  room_type: string;
  room_size: string;
  max_occupancy: number;
  current_occupancy: number;
  status: string;
  condition: string;
}

export interface Student {
  id: string;
  full_name: string;
  id_number: string;
  user_id: string;
}
