
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Users, Search, Filter, Plus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RoomManagement = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [floorStats, setFloorStats] = useState<any>({});
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
    fetchAvailableStudents();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, selectedFloor, searchTerm]);

  const fetchRooms = async () => {
    try {
      // First, get all rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (roomsError) throw roomsError;

      // Then get room assignments separately
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('room_assignments')
        .select('room_id, student_id, is_active')
        .eq('is_active', true);

      if (assignmentsError) throw assignmentsError;

      // Get profiles for assigned students
      const studentIds = assignmentsData?.map(a => a.student_id).filter(Boolean) || [];
      let profilesData: any[] = [];
      
      if (studentIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Combine the data
      const processedRooms = roomsData?.map(room => {
        const assignment = assignmentsData?.find(a => a.room_id === room.id);
        const profile = assignment ? profilesData.find(p => p.id === assignment.student_id) : null;
        
        return {
          ...room,
          student: profile?.email || null,
          student_id: assignment?.student_id || null
        };
      }) || [];

      setRooms(processedRooms);
      calculateFloorStats(processedRooms);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      // Get all student profiles
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Get active room assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('room_assignments')
        .select('student_id')
        .eq('is_active', true);

      if (assignmentsError) throw assignmentsError;

      // Get approved student registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('student_registrations')
        .select('user_id')
        .eq('status', 'approved');

      if (registrationsError) throw registrationsError;

      const assignedStudentIds = assignmentsData?.map(a => a.student_id) || [];
      const approvedStudentIds = registrationsData?.map(r => r.user_id) || [];

      // Filter students who are approved but not assigned to rooms
      const availableStudents = studentsData?.filter(student => 
        approvedStudentIds.includes(student.id) && 
        !assignedStudentIds.includes(student.id)
      ) || [];

      setAvailableStudents(availableStudents);
    } catch (error: any) {
      console.error('Error fetching available students:', error);
    }
  };

  const calculateFloorStats = (roomsData: any[]) => {
    const stats: any = {};
    
    roomsData.forEach(room => {
      if (!stats[room.floor]) {
        stats[room.floor] = { total: 0, occupied: 0, vacant: 0, maintenance: 0 };
      }
      
      stats[room.floor].total++;
      
      if (room.status === 'Occupied') {
        stats[room.floor].occupied++;
      } else if (room.status === 'Vacant') {
        stats[room.floor].vacant++;
      } else if (room.status === 'Maintenance') {
        stats[room.floor].maintenance++;
      }
    });
    
    setFloorStats(stats);
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (selectedFloor !== 'all') {
      filtered = filtered.filter(room => room.floor === selectedFloor);
    }

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.student && room.student.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredRooms(filtered);
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedRoom) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create room assignment
      const { error: assignmentError } = await supabase
        .from('room_assignments')
        .insert({
          room_id: selectedRoom.id,
          student_id: selectedStudent,
          is_active: true
        });

      if (assignmentError) throw assignmentError;

      // Update room status to occupied
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'Occupied' })
        .eq('id', selectedRoom.id);

      if (roomError) throw roomError;

      toast({
        title: "Success",
        description: "Student assigned to room successfully!",
      });

      setShowAssignDialog(false);
      setSelectedRoom(null);
      setSelectedStudent('');
      fetchRooms();
      fetchAvailableStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleVacateRoom = async (room: any) => {
    try {
      // Deactivate room assignment
      const { error: assignmentError } = await supabase
        .from('room_assignments')
        .update({ 
          is_active: false,
          vacated_at: new Date().toISOString()
        })
        .eq('room_id', room.id)
        .eq('is_active', true);

      if (assignmentError) throw assignmentError;

      // Update room status to vacant
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'Vacant' })
        .eq('id', room.id);

      if (roomError) throw roomError;

      toast({
        title: "Success",
        description: "Room vacated successfully!",
      });

      fetchRooms();
      fetchAvailableStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRoomInspection = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ last_inspection: new Date().toISOString().split('T')[0] })
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room inspection recorded!",
      });

      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
        <p className="text-gray-600">Manage rooms, assignments, and maintenance across all floors</p>
      </div>

      {/* Floor Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {Object.entries(floorStats).map(([floor, stats]: [string, any]) => (
          <Card key={floor} className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{floor} Floor</h3>
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Rooms:</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium text-green-600">{stats.occupied}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vacant:</span>
                  <span className="font-medium text-blue-600">{stats.vacant}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maintenance:</span>
                  <span className="font-medium text-orange-600">{stats.maintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Rooms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by room number or student email..."
                  value={searchTerm}
                  onChange={(e)setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {Object.keys(floorStats).map(floor => (
                  <SelectItem key={floor} value={floor}>{floor} Floor</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                <Badge variant={
                  room.status === 'Occupied' ? 'default' :
                  room.status === 'Vacant' ? 'secondary' :
                  'destructive'
                }>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Floor:</span>
                  <span>{room.floor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Student:</span>
                  <span className="text-right text-xs">{room.student || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Condition:</span>
                  <Badge variant={
                    room.condition === 'Good' ? 'secondary' :
                    room.condition === 'Fair' ? 'default' :
                    'destructive'
                  }>
                    {room.condition}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Inspection:</span>
                  <span>{room.last_inspection ? new Date(room.last_inspection).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {room.status === 'Vacant' && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowAssignDialog(true);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                )}
                {room.status === 'Occupied' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleVacateRoom(room)}
                  >
                    Vacate
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleRoomInspection(room.id)}
                >
                  Inspect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Student to Room {selectedRoom?.room_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {availableStudents.length > 0 ? (
              <>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignStudent} className="w-full">
                  Assign Student
                </Button>
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  No available students to assign. All approved students already have room assignments.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
