
import { useState } from 'react';
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Room } from "@/types/room";
import { useRoomData } from "@/hooks/useRoomData";
import { useRoomFilters } from "@/hooks/useRoomFilters";
import SearchFilters from "./room/SearchFilters";
import RoomCard from "./room/RoomCard";

const RoomSearch = () => {
  const { rooms, students, loading, fetchData } = useRoomData();
  const { 
    filteredRooms, 
    searchTerm, 
    floorFilter, 
    statusFilter, 
    setSearchTerm, 
    setFloorFilter, 
    setStatusFilter 
  } = useRoomFilters(rooms);
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { toast } = useToast();

  const handleAssignStudent = async () => {
    if (!selectedRoom || !selectedStudent) {
      toast({
        title: "Error",
        description: "Please select both a room and a student",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if room has space
      if (selectedRoom.current_occupancy >= selectedRoom.max_occupancy) {
        toast({
          title: "Error",
          description: "Room is at maximum capacity",
          variant: "destructive"
        });
        return;
      }

      // Create room assignment
      const { error: assignmentError } = await supabase
        .from('room_assignments')
        .insert({
          room_id: selectedRoom.id,
          student_id: selectedStudent,
          is_active: true
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: "Success",
        description: "Student assigned to room successfully!",
      });

      setShowAssignDialog(false);
      setSelectedRoom(null);
      setSelectedStudent('');
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setShowAssignDialog(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowAssignDialog(open);
    if (!open) {
      setSelectedRoom(null);
      setSelectedStudent('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Room Management</h1>
          <p className="text-gray-600">Search and manage room assignments</p>
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          floorFilter={floorFilter}
          statusFilter={statusFilter}
          filteredRoomsCount={filteredRooms.length}
          totalRoomsCount={rooms.length}
          onSearchTermChange={setSearchTerm}
          onFloorFilterChange={setFloorFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              students={students}
              selectedStudent={selectedStudent}
              showAssignDialog={showAssignDialog}
              selectedRoomId={selectedRoom?.id || null}
              onSelectedStudentChange={setSelectedStudent}
              onAssignStudent={handleAssignStudent}
              onDialogOpenChange={handleDialogOpenChange}
              onRoomSelect={handleRoomSelect}
            />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSearch;
