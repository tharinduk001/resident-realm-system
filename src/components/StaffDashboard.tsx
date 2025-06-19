
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Home, Settings, Calendar, MessageSquare, UserCheck, ClipboardList, BarChart3, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StaffDashboardProps {
  onNavigate: (view: string) => void;
}

const StaffDashboard = ({ onNavigate }: StaffDashboardProps) => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    totalStudents: 0,
    pendingRegistrations: 0,
    pendingRequests: 0,
    floorStats: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch rooms data
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      if (roomsError) throw roomsError;

      // Fetch students data
      const { data: students, error: studentsError } = await supabase
        .from('student_registrations')
        .select('*');

      if (studentsError) throw studentsError;

      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'Pending');

      if (requestsError) throw requestsError;

      // Calculate stats
      const totalRooms = rooms?.length || 0;
      const occupiedRooms = rooms?.filter(room => room.status === 'Occupied' || room.status === 'Full').length || 0;
      const vacantRooms = rooms?.filter(room => room.status === 'Vacant').length || 0;
      const totalStudents = students?.filter(s => s.status === 'approved').length || 0;
      const pendingRegistrations = students?.filter(s => s.status === 'pending').length || 0;
      const pendingRequests = requests?.length || 0;

      // Calculate floor stats - Updated with correct counts
      const floorStats = {
        'Ground': { total: 15, occupied: 0, vacant: 0 },
        '2nd': { total: 28, occupied: 0, vacant: 0 },
        '3rd': { total: 28, occupied: 0, vacant: 0 },
        '4th': { total: 27, occupied: 0, vacant: 0 }
      };

      // Count occupied and vacant rooms per floor
      rooms?.forEach(room => {
        if (floorStats[room.floor as keyof typeof floorStats]) {
          if (room.status === 'Occupied' || room.status === 'Full') {
            floorStats[room.floor as keyof typeof floorStats].occupied++;
          } else if (room.status === 'Vacant') {
            floorStats[room.floor as keyof typeof floorStats].vacant++;
          }
        }
      });

      setStats({
        totalRooms,
        occupiedRooms,
        vacantRooms,
        totalStudents,
        pendingRegistrations,
        pendingRequests,
        floorStats
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Staff Dashboard
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Hostel Management Control Center
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-2xl border-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Rooms</p>
                  <p className="text-3xl font-bold text-white">{stats.totalRooms}</p>
                </div>
                <Home className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl border-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Students</p>
                  <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
                </div>
                <Users className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl border-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending Registrations</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingRegistrations}</p>
                </div>
                <UserCheck className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl border-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pending Requests</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floor Statistics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Floor-wise Room Distribution</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {Object.entries(stats.floorStats).map(([floor, floorData]: [string, any]) => (
              <Card key={floor} className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    {floor} Floor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Total:</span>
                    <span className="font-bold">{floorData.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Occupied:</span>
                    <span className="font-bold text-green-200">{floorData.occupied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Vacant:</span>
                    <span className="font-bold text-blue-200">{floorData.vacant}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card 
              className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onNavigate('room-management')}
            >
              <CardContent className="p-8 text-center">
                <Home className="w-16 h-16 mx-auto mb-4 text-teal-200" />
                <h3 className="font-bold text-xl mb-2">Room Management</h3>
                <p className="text-teal-100">Manage room assignments and conditions</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onNavigate('registration-review')}
            >
              <CardContent className="p-8 text-center">
                <UserCheck className="w-16 h-16 mx-auto mb-4 text-purple-200" />
                <h3 className="font-bold text-xl mb-2">Registration Review</h3>
                <p className="text-purple-100">Review pending student registrations</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onNavigate('requests')}
            >
              <CardContent className="p-8 text-center">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-orange-200" />
                <h3 className="font-bold text-xl mb-2">Manage Requests</h3>
                <p className="text-orange-100">Handle maintenance and service requests</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onNavigate('announcements')}
            >
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-green-200" />
                <h3 className="font-bold text-xl mb-2">Announcements</h3>
                <p className="text-green-100">Manage hostel announcements</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
                <h3 className="font-bold text-xl mb-2">Analytics</h3>
                <p className="text-indigo-100">View detailed reports and statistics</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="font-bold text-xl mb-2">Settings</h3>
                <p className="text-gray-300">Configure system settings</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
