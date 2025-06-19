
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Home, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Room {
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

interface Student {
  id: string;
  full_name: string;
  id_number: string;
}

const RoomSearch = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, floorFilter, statusFilter]);

  const fetchData = async () => {
    try {
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (roomsError) throw roomsError;

      // Fetch approved students who don't have active room assignments
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_registrations')
        .select('id, full_name, id_number, user_id')
        .eq('status', 'approved')
        .eq('graduation_status', 'active');

      if (studentsError) throw studentsError;

      // Filter out students who already have active room assignments
      const { data: assignmentsData } = await supabase
        .from('room_assignments')
        .select('student_id')
        .eq('is_active', true);

      const assignedStudentIds = assignmentsData?.map(a => a.student_id) || [];
      const unassignedStudents = studentsData?.filter(s => !assignedStudentIds.includes(s.user_id)) || [];

      setRooms(roomsData || []);
      setStudents(unassignedStudents || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load room data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant': return 'secondary';
      case 'Occupied': return 'default';
      case 'Full': return 'destructive';
      case 'Maintenance': return 'destructive';
      default: return 'secondary';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Good': return 'secondary';
      case 'Fair': return 'default';
      case 'Poor': return 'destructive';
      default: return 'secondary';
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

        {/* Search and Filters */}
        <Card className="mb-8 border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">Search & Filter Rooms</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by room number or floor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-500"
                />
              </div>

              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Filter by floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  <SelectItem value="Ground">Ground Floor</SelectItem>
                  <SelectItem value="2nd">2nd Floor</SelectItem>
                  <SelectItem value="3rd">3rd Floor</SelectItem>
                  <SelectItem value="4th">4th Floor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredRooms.length} of {rooms.length} rooms
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-blue-50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-900">{room.room_number}</CardTitle>
                  <Badge variant={getStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{room.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{room.room_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{room.room_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy:</span>
                    <span className="font-medium">{room.current_occupancy}/{room.max_occupancy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <Badge variant={getConditionColor(room.condition)} className="text-xs">
                      {room.condition}
                    </Badge>
                  </div>
                </div>

                {room.current_occupancy < room.max_occupancy && room.status !== 'Maintenance' && (
                  <Dialog open={showAssignDialog && selectedRoom?.id === room.id} onOpenChange={(open) => {
                    setShowAssignDialog(open);
                    if (!open) {
                      setSelectedRoom(null);
                      setSelectedStudent('');
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedRoom(room)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-blue-900">
                          Assign Student to Room {room.room_number}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="text-sm text-gray-600">
                          Current occupancy: {room.current_occupancy}/{room.max_occupancy}
                        </div>

                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                          <SelectTrigger className="border-blue-200 focus:border-blue-500">
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.user_id}>
                                {student.full_name} - {student.id_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setShowAssignDialog(false);
                              setSelectedRoom(null);
                              setSelectedStudent('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={handleAssignStudent}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {room.status === 'Full' && (
                  <div className="mt-4 text-center text-gray-500 text-sm">
                    Room is at maximum capacity
                  </div>
                )}
              </CardContent>
            </Card>
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
