
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Users, Search, Filter, UserPlus, Settings, GraduationCap } from "lucide-react";
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
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [showPassOutDialog, setShowPassOutDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [studentsForPassOut, setStudentsForPassOut] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
    fetchAvailableStudents();
    fetchStudentsForPassOut();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, selectedFloor, searchTerm]);

  const fetchRooms = async () => {
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (roomsError) throw roomsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('room_assignments')
        .select('room_id, student_id, is_active')
        .eq('is_active', true);

      if (assignmentsError) throw assignmentsError;

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

      const processedRooms = roomsData?.map(room => {
        const roomAssignments = assignmentsData?.filter(a => a.room_id === room.id) || [];
        const students = roomAssignments.map(assignment => {
          const profile = profilesData.find(p => p.id === assignment.student_id);
          return profile?.email || 'Unknown';
        });
        
        return {
          ...room,
          students,
          occupancy: roomAssignments.length
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
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('room_assignments')
        .select('student_id')
        .eq('is_active', true);

      if (assignmentsError) throw assignmentsError;

      const { data: registrationsData, error: registrationsError } = await supabase
        .from('student_registrations')
        .select('user_id')
        .eq('status', 'approved')
        .eq('graduation_status', 'active');

      if (registrationsError) throw registrationsError;

      const assignedStudentIds = assignmentsData?.map(a => a.student_id) || [];
      const approvedStudentIds = registrationsData?.map(r => r.user_id) || [];

      const availableStudents = studentsData?.filter(student => 
        approvedStudentIds.includes(student.id) && 
        !assignedStudentIds.includes(student.id)
      ) || [];

      setAvailableStudents(availableStudents);
    } catch (error: any) {
      console.error('Error fetching available students:', error);
    }
  };

  const fetchStudentsForPassOut = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('student_registrations')
        .select(`
          id,
          user_id,
          full_name,
          academic_year,
          graduation_status,
          profiles!inner(email)
        `)
        .eq('status', 'approved')
        .eq('graduation_status', 'active')
        .gte('academic_year', 4);

      if (error) throw error;
      setStudentsForPassOut(studentsData || []);
    } catch (error: any) {
      console.error('Error fetching students for pass out:', error);
    }
  };

  const calculateFloorStats = (roomsData: any[]) => {
    const stats: any = {};
    
    roomsData.forEach(room => {
      if (!stats[room.floor]) {
        stats[room.floor] = { total: 0, occupied: 0, vacant: 0, full: 0, maintenance: 0 };
      }
      
      stats[room.floor].total++;
      
      if (room.status === 'Occupied') {
        stats[room.floor].occupied++;
      } else if (room.status === 'Vacant') {
        stats[room.floor].vacant++;
      } else if (room.status === 'Full') {
        stats[room.floor].full++;
      } else if (room.status === 'Maintenance' || room.condition === 'Maintenance' || room.condition === 'Under Repair') {
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
        room.students.some((student: string) => 
          student.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredRooms(filtered);
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0 || !selectedRoom) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive"
      });
      return;
    }

    if (selectedRoom.occupancy + selectedStudents.length > selectedRoom.max_occupancy) {
      toast({
        title: "Error",
        description: `Cannot assign ${selectedStudents.length} students. Room capacity is ${selectedRoom.max_occupancy}, current occupancy is ${selectedRoom.occupancy}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const assignments = selectedStudents.map(studentId => ({
        room_id: selectedRoom.id,
        student_id: studentId,
        is_active: true
      }));

      const { error } = await supabase
        .from('room_assignments')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedStudents.length} student(s) assigned to room successfully!`,
      });

      setShowAssignDialog(false);
      setSelectedRoom(null);
      setSelectedStudents([]);
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
      const { error } = await supabase
        .from('room_assignments')
        .update({ 
          is_active: false,
          vacated_at: new Date().toISOString()
        })
        .eq('room_id', room.id)
        .eq('is_active', true);

      if (error) throw error;

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

  const handleUpdateCondition = async () => {
    if (!newCondition || !selectedRoom) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ condition: newCondition })
        .eq('id', selectedRoom.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room condition updated successfully!",
      });

      setShowConditionDialog(false);
      setSelectedRoom(null);
      setNewCondition('');
      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePassOutStudents = async (studentIds: string[]) => {
    try {
      // Update graduation status
      const { error: registrationError } = await supabase
        .from('student_registrations')
        .update({ graduation_status: 'passed_out' })
        .in('user_id', studentIds);

      if (registrationError) throw registrationError;

      // Deactivate room assignments
      const { error: assignmentError } = await supabase
        .from('room_assignments')
        .update({ 
          is_active: false,
          vacated_at: new Date().toISOString()
        })
        .in('student_id', studentIds)
        .eq('is_active', true);

      if (assignmentError) throw assignmentError;

      toast({
        title: "Success",
        description: `${studentIds.length} student(s) passed out successfully!`,
      });

      setShowPassOutDialog(false);
      fetchRooms();
      fetchAvailableStudents();
      fetchStudentsForPassOut();
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
          <p className="text-gray-600">Manage rooms, assignments, and maintenance across all floors</p>
        </div>
        
        <Button
          onClick={() => setShowPassOutDialog(true)}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Pass Out Students</span>
        </Button>
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
                  <span className="text-gray-600">Total:</span>
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
                  <span className="text-gray-600">Full:</span>
                  <span className="font-medium text-purple-600">{stats.full}</span>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  room.status === 'Full' ? 'secondary' :
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
                  <span className="text-gray-600">Occupancy:</span>
                  <span>{room.occupancy}/{room.max_occupancy}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Students:</span>
                  <div className="mt-1 space-y-1">
                    {room.students.length > 0 ? room.students.map((student: string, index: number) => (
                      <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {student}
                      </div>
                    )) : (
                      <span className="text-xs text-gray-400">No students assigned</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Condition:</span>
                  <Badge variant={
                    room.condition === 'Good' ? 'secondary' :
                    room.condition === 'Fair' ? 'default' :
                    room.condition === 'Maintenance' || room.condition === 'Under Repair' ? 'destructive' :
                    'destructive'
                  }>
                    {room.condition}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {room.occupancy < room.max_occupancy && room.condition !== 'Maintenance' && room.condition !== 'Under Repair' && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowAssignDialog(true);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                )}
                {room.occupancy > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleVacateRoom(room)}
                  >
                    Vacate All
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedRoom(room);
                    setNewCondition(room.condition);
                    setShowConditionDialog(true);
                  }}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Condition
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
            <DialogTitle>Assign Students to Room {selectedRoom?.room_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-600">
              Room capacity: {selectedRoom?.max_occupancy}, Current occupancy: {selectedRoom?.occupancy}
            </p>
            {availableStudents.length > 0 ? (
              <>
                <div className="max-h-48 overflow-y-auto border rounded p-2">
                  {availableStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 p-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                      />
                      <span className="text-sm">{student.email}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAssignStudents} className="w-full">
                  Assign {selectedStudents.length} Student(s)
                </Button>
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  No available students to assign.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Condition Update Dialog */}
      <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Room Condition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Select value={newCondition} onValueChange={setNewCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Under Repair">Under Repair</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpdateCondition} className="w-full">
              Update Condition
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pass Out Students Dialog */}
      <Dialog open={showPassOutDialog} onOpenChange={setShowPassOutDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pass Out Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-600">
              Students eligible for pass out (Academic Year 4 and above):
            </p>
            {studentsForPassOut.length > 0 ? (
              <div className="max-h-64 overflow-y-auto border rounded p-2">
                {studentsForPassOut.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-gray-600">{student.profiles.email}</p>
                      <p className="text-sm text-gray-500">Academic Year: {student.academic_year}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePassOutStudents([student.user_id])}
                    >
                      Pass Out
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No students eligible for pass out at this time.
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
