import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Users, Search, Filter, UserPlus, Settings, GraduationCap, AlertTriangle, Bed, Table } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RoomManagement = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [floorStats, setFloorStats] = useState<any>({});
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [showFurnitureDialog, setShowFurnitureDialog] = useState(false);
  const [showPassOutDialog, setShowPassOutDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [furnitureData, setFurnitureData] = useState<any>({});
  const [studentsForPassOut, setStudentsForPassOut] = useState<any[]>([]);
  const [conflictingStudents, setConflictingStudents] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
    fetchAvailableStudents();
    fetchStudentsForPassOut();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, selectedFloor, selectedStatus, searchTerm]);

  const fetchStudentsForPassOut = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('student_registrations')
        .select(`
          *,
          profiles!inner(email)
        `)
        .eq('status', 'approved')
        .eq('graduation_status', 'active')
        .gte('academic_year', 4);

      if (error) {
        console.error('Error fetching students for pass out:', error);
        return;
      }

      setStudentsForPassOut(studentsData || []);
    } catch (error: any) {
      console.error('Error in fetchStudentsForPassOut:', error);
    }
  };

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
      let studentData: any[] = [];
      
      if (studentIds.length > 0) {
        const { data: registrations, error: registrationsError } = await supabase
          .from('student_registrations')
          .select('user_id, full_name')
          .in('user_id', studentIds)
          .eq('status', 'approved');

        if (registrationsError) {
          console.error('Error fetching student registrations:', registrationsError);
        } else {
          studentData = registrations || [];
        }
      }

      const processedRooms = roomsData?.map(room => {
        const roomAssignments = assignmentsData?.filter(a => a.room_id === room.id) || [];
        const students = roomAssignments.map(assignment => {
          const student = studentData.find(s => s.user_id === assignment.student_id);
          return student?.full_name || 'Unknown Student';
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
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('student_registrations')
        .select('user_id, full_name')
        .eq('status', 'approved')
        .eq('graduation_status', 'active');

      if (registrationsError) throw registrationsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('room_assignments')
        .select('student_id')
        .eq('is_active', true);

      if (assignmentsError) throw assignmentsError;

      const assignedStudentIds = assignmentsData?.map(a => a.student_id) || [];

      const availableStudents = registrationsData?.filter(student => 
        !assignedStudentIds.includes(student.user_id)
      ) || [];

      setAvailableStudents(availableStudents);
    } catch (error: any) {
      console.error('Error fetching available students:', error);
    }
  };

  const checkForRoomConflicts = async (studentIds: string[]) => {
    try {
      const { data: existingAssignments, error } = await supabase
        .from('room_assignments')
        .select(`
          student_id,
          room_id,
          rooms(room_number)
        `)
        .in('student_id', studentIds)
        .eq('is_active', true);

      if (error) throw error;

      if (existingAssignments && existingAssignments.length > 0) {
        const { data: studentNames, error: namesError } = await supabase
          .from('student_registrations')
          .select('user_id, full_name')
          .in('user_id', existingAssignments.map(a => a.student_id));

        if (namesError) throw namesError;

        const conflicts = existingAssignments.map(assignment => {
          const student = studentNames?.find(s => s.user_id === assignment.student_id);
          return {
            student_id: assignment.student_id,
            student_name: student?.full_name || 'Unknown Student',
            current_room: assignment.rooms?.room_number || 'Unknown Room'
          };
        });

        setConflictingStudents(conflicts);
        setShowConflictDialog(true);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error checking room conflicts:', error);
      return false;
    }
  };

  const handleAssignStudents = async (forceAssign = false) => {
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

    if (!forceAssign) {
      const hasConflicts = await checkForRoomConflicts(selectedStudents);
      if (hasConflicts) return;
    }

    try {
      // If forcing assignment, first deactivate existing assignments
      if (forceAssign) {
        await supabase
          .from('room_assignments')
          .update({ is_active: false, vacated_at: new Date().toISOString() })
          .in('student_id', selectedStudents)
          .eq('is_active', true);
      }

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
      setShowConflictDialog(false);
      setSelectedRoom(null);
      setSelectedStudents([]);
      setConflictingStudents([]);
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

  const handleUpdateFurniture = async () => {
    if (!selectedRoom) return;

    try {
      // Delete existing furniture items for this room
      await supabase
        .from('furniture_items')
        .delete()
        .eq('room_id', selectedRoom.id);

      // Insert new furniture items
      const furnitureItems = [];
      if (furnitureData.beds > 0) {
        for (let i = 0; i < furnitureData.beds; i++) {
          furnitureItems.push({
            room_id: selectedRoom.id,
            item_name: 'Bed',
            condition: 'Good'
          });
        }
      }
      if (furnitureData.mattresses > 0) {
        for (let i = 0; i < furnitureData.mattresses; i++) {
          furnitureItems.push({
            room_id: selectedRoom.id,
            item_name: 'Mattress',
            condition: 'Good'
          });
        }
      }
      if (furnitureData.tables > 0) {
        for (let i = 0; i < furnitureData.tables; i++) {
          furnitureItems.push({
            room_id: selectedRoom.id,
            item_name: 'Table',
            condition: 'Good'
          });
        }
      }
      if (furnitureData.chairs > 0) {
        for (let i = 0; i < furnitureData.chairs; i++) {
          furnitureItems.push({
            room_id: selectedRoom.id,
            item_name: 'Chair',
            condition: 'Good'
          });
        }
      }
      if (furnitureData.lockers > 0) {
        for (let i = 0; i < furnitureData.lockers; i++) {
          furnitureItems.push({
            room_id: selectedRoom.id,
            item_name: 'Locker',
            condition: 'Good'
          });
        }
      }

      if (furnitureItems.length > 0) {
        const { error } = await supabase
          .from('furniture_items')
          .insert(furnitureItems);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Furniture updated successfully!",
      });

      setShowFurnitureDialog(false);
      setSelectedRoom(null);
      setFurnitureData({});
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

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(room => room.status === selectedStatus);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Room Management
            </h1>
            <p className="text-gray-600 text-lg">Manage rooms, assignments, and maintenance across all floors</p>
          </div>
          
          <Button
            onClick={() => setShowPassOutDialog(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            size="lg"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Pass Out Students</span>
          </Button>
        </div>

        {/* Floor Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Object.entries(floorStats).map(([floor, stats]: [string, any]) => (
            <Card key={floor} className="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xl text-white">{floor} Floor</h3>
                  <Home className="w-6 h-6 text-blue-200" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Total:</span>
                    <span className="font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Occupied:</span>
                    <span className="font-bold text-green-200">{stats.occupied}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Vacant:</span>
                    <span className="font-bold text-blue-200">{stats.vacant}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Full:</span>
                    <span className="font-bold text-purple-200">{stats.full}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Maintenance:</span>
                    <span className="font-bold text-orange-200">{stats.maintenance}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Filter className="w-6 h-6" />
              <span>Filter & Search Rooms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by room number or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
              <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Select Floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {Object.keys(floorStats).map(floor => (
                    <SelectItem key={floor} value={floor}>{floor} Floor</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-lg font-semibold text-gray-700 flex items-center">
                Showing {filteredRooms.length} of {rooms.length} rooms
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-800">Room {room.room_number}</CardTitle>
                  <Badge variant={
                    room.status === 'Occupied' ? 'default' :
                    room.status === 'Vacant' ? 'secondary' :
                    room.status === 'Full' ? 'secondary' :
                    'destructive'
                  } className="text-sm font-semibold">
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Floor:</span>
                    <span className="font-semibold">{room.floor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Occupancy:</span>
                    <span className="font-semibold">{room.occupancy}/{room.max_occupancy}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 font-medium">Students:</span>
                    <div className="mt-2 space-y-1">
                      {room.students.length > 0 ? room.students.map((student: string, index: number) => (
                        <div key={index} className="text-xs bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {student}
                        </div>
                      )) : (
                        <span className="text-xs text-gray-400 italic">No students assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Condition:</span>
                    <Badge variant={
                      room.condition === 'Good' ? 'secondary' :
                      room.condition === 'Fair' ? 'default' :
                      room.condition === 'Maintenance' || room.condition === 'Under Repair' ? 'destructive' :
                      'destructive'
                    } className="text-xs">
                      {room.condition}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowAssignDialog(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                  {room.occupancy > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleVacateRoom(room)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Vacate
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
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Condition
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowFurnitureDialog(true);
                    }}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <Bed className="w-4 h-4 mr-1" />
                    Furniture
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Student Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Assign Students to Room {selectedRoom?.room_number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Room capacity: {selectedRoom?.max_occupancy}, Current occupancy: {selectedRoom?.occupancy}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Available space: {selectedRoom?.max_occupancy - selectedRoom?.occupancy} students
                </p>
              </div>
              {availableStudents.length > 0 ? (
                <>
                  <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg p-3">
                    {availableStudents.map((student) => (
                      <div key={student.user_id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.user_id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.user_id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium">{student.full_name}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => handleAssignStudents(false)} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
                    disabled={selectedStudents.length === 0}
                  >
                    Assign {selectedStudents.length} Student(s)
                  </Button>
                </>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    No available students to assign.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Furniture Management Dialog */}
        <Dialog open={showFurnitureDialog} onOpenChange={setShowFurnitureDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center">
                <Bed className="w-6 h-6 mr-2 text-green-600" />
                Manage Furniture - Room {selectedRoom?.room_number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beds</label>
                  <Input
                    type="number"
                    min="0"
                    value={furnitureData.beds || 0}
                    onChange={(e) => setFurnitureData({...furnitureData, beds: parseInt(e.target.value) || 0})}
                    className="border-2 border-gray-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mattresses</label>
                  <Input
                    type="number"
                    min="0"
                    value={furnitureData.mattresses || 0}
                    onChange={(e) => setFurnitureData({...furnitureData, mattresses: parseInt(e.target.value) || 0})}
                    className="border-2 border-gray-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tables</label>
                  <Input
                    type="number"
                    min="0"
                    value={furnitureData.tables || 0}
                    onChange={(e) => setFurnitureData({...furnitureData, tables: parseInt(e.target.value) || 0})}
                    className="border-2 border-gray-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chairs</label>
                  <Input
                    type="number"
                    min="0"
                    value={furnitureData.chairs || 0}
                    onChange={(e) => setFurnitureData({...furnitureData, chairs: parseInt(e.target.value) || 0})}
                    className="border-2 border-gray-200 focus:border-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lockers</label>
                  <Input
                    type="number"
                    min="0"
                    value={furnitureData.lockers || 0}
                    onChange={(e) => setFurnitureData({...furnitureData, lockers: parseInt(e.target.value) || 0})}
                    className="border-2 border-gray-200 focus:border-green-500"
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateFurniture} 
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3"
              >
                Update Furniture
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Room Conflict Dialog */}
        <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="w-6 h-6" />
                <span>Room Assignment Conflict</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  The following students are already assigned to other rooms:
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                {conflictingStudents.map((conflict, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{conflict.student_name}</p>
                    <p className="text-xs text-gray-600">Currently in Room {conflict.current_room}</p>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConflictDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleAssignStudents(true)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Move & Reassign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Condition Update Dialog */}
        <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Update Room Condition
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Select value={newCondition} onValueChange={setNewCondition}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500">
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
              <Button 
                onClick={handleUpdateCondition} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
              >
                Update Condition
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pass Out Students Dialog */}
        <Dialog open={showPassOutDialog} onOpenChange={setShowPassOutDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center">
                <GraduationCap className="w-6 h-6 mr-2 text-green-600" />
                Pass Out Students
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">
                Students eligible for pass out (Academic Year 4 and above):
              </p>
              {studentsForPassOut.length > 0 ? (
                <div className="max-h-64 overflow-y-auto border rounded p-2">
                  {studentsForPassOut.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-gray-600">{student.profiles.email}</p>
                        <p className="text-sm text-gray-500">Academic Year: {student.academic_year}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePassOutStudents([student.user_id])}
                        className="bg-green-500 hover:bg-green-600"
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
    </div>
  );
};

export default RoomManagement;
