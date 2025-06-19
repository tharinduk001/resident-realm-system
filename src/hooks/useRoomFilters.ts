
import { useState, useEffect } from 'react';
import { Room } from "@/types/room";

export const useRoomFilters = (rooms: Room[]) => {
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, floorFilter, statusFilter]);

  const filterRooms = () => {
    let filtered = rooms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.floor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Floor filter
    if (floorFilter !== 'all') {
      filtered = filtered.filter(room => room.floor === floorFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    setFilteredRooms(filtered);
  };

  return {
    filteredRooms,
    searchTerm,
    floorFilter,
    statusFilter,
    setSearchTerm,
    setFloorFilter,
    setStatusFilter
  };
};
