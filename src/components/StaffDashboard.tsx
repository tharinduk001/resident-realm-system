import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Users, AlertTriangle, Key, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StaffDashboardProps {
  onNavigate?: (view: string) => void;
}

const StaffDashboard = ({ onNavigate }: StaffDashboardProps) => {
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    activeStudents: 0,
    pendingReports: 0,
    keyHandovers: 0
  });
  const [floorStats, setFloorStats] = useState({
    ground: { occupied: 0, total: 15 },
    second: { occupied: 0, total: 28 },
    third: { occupied: 0, total: 28 },
    fourth: { occupied: 0, total: 27 }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch rooms data
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      if (roomsError) throw roomsError;

      // Fetch requests data
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          student_registrations!inner(user_id, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
      }

      // Fetch pending requests
      const { data: pendingRequestsData, error: pendingError } = await supabase
        .from('requests')
        .select(`
          *,
          student_registrations!inner(user_id, full_name)
        `)
        .eq('status', 'Pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendingError) {
        console.error('Error fetching pending requests:', pendingError);
      }

      // Fetch active students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_registrations')
        .select('*')
        .eq('status', 'approved')
        .eq('graduation_status', 'active');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }

      // Calculate stats
      const totalRooms = roomsData?.length || 0;
      const occupiedRooms = roomsData?.filter(room => room.status === 'Occupied' || room.status === 'Full').length || 0;
      const activeStudents = studentsData?.length || 0;
      const pendingReports = requestsData?.filter(req => req.status === 'Pending' && req.type === 'Maintenance').length || 0;
      const keyHandovers = requestsData?.filter(req => req.type === 'Key Handover').length || 0;

      setStats({
        totalRooms,
        occupiedRooms,
        activeStudents,
        pendingReports,
        keyHandovers
      });

      // Calculate floor-wise stats
      const groundOccupied = roomsData?.filter(room => room.floor === 'Ground' && (room.status === 'Occupied' || room.status === 'Full')).length || 0;
      const secondOccupied = roomsData?.filter(room => room.floor === '2nd' && (room.status === 'Occupied' || room.status === 'Full')).length || 0;
      const thirdOccupied = roomsData?.filter(room => room.floor === '3rd' && (room.status === 'Occupied' || room.status === 'Full')).length || 0;
      const fourthOccupied = roomsData?.filter(room => room.floor === '4th' && (room.status === 'Occupied' || room.status === 'Full')).length || 0;

      setFloorStats({
        ground: { occupied: groundOccupied, total: 15 },
        second: { occupied: secondOccupied, total: 28 },
        third: { occupied: thirdOccupied, total: 28 },
        fourth: { occupied: fourthOccupied, total: 27 }
      });

      setRecentReports(requestsData?.filter(req => req.type === 'Maintenance').slice(0, 3) || []);
      setPendingRequests(pendingRequestsData?.slice(0, 3) || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'In Progress' || newStatus === 'Approved') {
        const user = await supabase.auth.getUser();
        updateData.assigned_to = user.data.user?.id;
      }

      const { error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${newStatus.toLowerCase()} successfully!`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Approved': return 'secondary';
      case 'Pending': return 'destructive';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const calculateOccupancyPercentage = (occupied: number, total: number) => {
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">Monitor and manage all hostel operations</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Rooms</p>
                  <p className="text-2xl font-bold">{stats.totalRooms}</p>
                  <p className="text-sm text-blue-200">
                    {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}% Occupied
                  </p>
                </div>
                <Home className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Students</p>
                  <p className="text-2xl font-bold">{stats.activeStudents}</p>
                  <p className="text-sm text-blue-200">Registered</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pending Reports</p>
                  <p className="text-2xl font-bold">{stats.pendingReports}</p>
                  <p className="text-sm text-blue-200">Maintenance</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Key Handovers</p>
                  <p className="text-2xl font-bold">{stats.keyHandovers}</p>
                  <p className="text-sm text-blue-200">Total</p>
                </div>
                <Key className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center justify-between text-blue-900">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Recent Reports</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate?.('requests')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReports.length > 0 ? recentReports.map((report) => (
                <div key={report.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{report.type}</span>
                      <Badge variant={getPriorityColor(report.priority)}>
                        {report.priority}
                      </Badge>
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1 line-clamp-2">{report.description}</p>
                  {report.room_number && (
                    <p className="text-xs text-gray-500 mb-2">Room: {report.room_number}</p>
                  )}
                  <p className="text-xs text-gray-500 mb-3">
                    Student: {report.student_registrations?.full_name || 'Unknown'}
                  </p>
                  {report.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(report.id, 'Rejected')}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateRequestStatus(report.id, 'Approved')}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                  {report.status === 'Approved' && (
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateRequestStatus(report.id, 'In Progress')}
                    >
                      Start Work
                    </Button>
                  )}
                  {report.status === 'In Progress' && (
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateRequestStatus(report.id, 'Completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm">No maintenance reports</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center justify-between text-blue-900">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Pending Requests</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate?.('requests')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.length > 0 ? pendingRequests.map((request) => (
                <div key={request.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{request.type}</span>
                      <Badge variant={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1 line-clamp-2">{request.description}</p>
                  {request.room_number && (
                    <p className="text-xs text-gray-500 mb-2">Room: {request.room_number}</p>
                  )}
                  <p className="text-xs text-gray-500 mb-3">
                    Student: {request.student_registrations?.full_name || 'Unknown'}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateRequestStatus(request.id, 'Rejected')}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateRequestStatus(request.id, 'Approved')}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Floor Overview */}
        <Card className="mt-8 border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <TrendingUp className="w-5 h-5" />
              <span>Floor-wise Occupancy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Ground Floor</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {floorStats.ground.occupied}/{floorStats.ground.total}
                </div>
                <div className="text-sm text-gray-600">
                  {calculateOccupancyPercentage(floorStats.ground.occupied, floorStats.ground.total)}% Occupied
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${calculateOccupancyPercentage(floorStats.ground.occupied, floorStats.ground.total)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">2nd Floor</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {floorStats.second.occupied}/{floorStats.second.total}
                </div>
                <div className="text-sm text-gray-600">
                  {calculateOccupancyPercentage(floorStats.second.occupied, floorStats.second.total)}% Occupied
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${calculateOccupancyPercentage(floorStats.second.occupied, floorStats.second.total)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">3rd Floor</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {floorStats.third.occupied}/{floorStats.third.total}
                </div>
                <div className="text-sm text-gray-600">
                  {calculateOccupancyPercentage(floorStats.third.occupied, floorStats.third.total)}% Occupied
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${calculateOccupancyPercentage(floorStats.third.occupied, floorStats.third.total)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">4th Floor</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {floorStats.fourth.occupied}/{floorStats.fourth.total}
                </div>
                <div className="text-sm text-gray-600">
                  {calculateOccupancyPercentage(floorStats.fourth.occupied, floorStats.fourth.total)}% Occupied
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${calculateOccupancyPercentage(floorStats.fourth.occupied, floorStats.fourth.total)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
