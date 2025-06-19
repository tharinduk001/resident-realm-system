
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Users, Clock, Calendar, MapPin, User, Phone, Mail, GraduationCap, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      console.log('Fetching student data...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) {
        setError('No authenticated user found');
        return;
      }

      // Fetch student registration data
      const { data: registration, error: regError } = await supabase
        .from('student_registrations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Registration data:', registration);
      console.log('Registration error:', regError);

      if (regError) {
        if (regError.code === 'PGRST116') {
          setError('No registration found. Please complete your registration.');
        } else {
          throw regError;
        }
        return;
      }

      if (registration.status !== 'approved') {
        setError(`Registration status: ${registration.status}. Please wait for approval.`);
        return;
      }

      setStudentData(registration);

      // Fetch room assignment if exists
      const { data: assignment, error: assignError } = await supabase
        .from('room_assignments')
        .select(`
          *,
          rooms (
            room_number,
            floor,
            room_type,
            room_size,
            max_occupancy,
            current_occupancy,
            condition
          )
        `)
        .eq('student_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      console.log('Room assignment:', assignment);
      console.log('Assignment error:', assignError);

      if (assignError && assignError.code !== 'PGRST116') {
        throw assignError;
      }

      setRoomData(assignment);
    } catch (error: any) {
      console.error('Error fetching student data:', error);
      setError(error.message || 'Failed to load data');
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Issue</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-orange-500 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Registration Required</h2>
            <p className="text-gray-600">Please complete your student registration to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome Back, {studentData?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Your Student Dashboard
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Student Profile Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl border-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Student Profile</CardTitle>
                  <p className="text-blue-100">Your personal information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-blue-100 text-sm">Full Name</p>
                    <p className="font-semibold">{studentData?.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-blue-100 text-sm">ID Number</p>
                    <p className="font-semibold">{studentData?.id_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-blue-100 text-sm">Phone</p>
                    <p className="font-semibold">{studentData?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-blue-100 text-sm">Academic Year</p>
                    <p className="font-semibold">Year {studentData?.academic_year || 1}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-green-100 text-sm">Registration Status</p>
                  <Badge className="bg-white text-green-600 font-semibold mt-1">
                    {studentData?.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Graduation Status</p>
                  <Badge className="bg-white text-green-600 font-semibold mt-1">
                    {studentData?.graduation_status || 'Active'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Information */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Home className="w-7 h-7 mr-3" />
              Room Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roomData ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-orange-200" />
                    <div>
                      <p className="text-orange-100 text-sm">Room Number</p>
                      <p className="text-2xl font-bold">{roomData.rooms.room_number}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-orange-100 text-sm">Floor</p>
                    <p className="font-semibold text-lg">{roomData.rooms.floor}</p>
                  </div>
                  <div>
                    <p className="text-orange-100 text-sm">Room Type</p>
                    <p className="font-semibold">{roomData.rooms.room_type}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-orange-100 text-sm">Occupancy</p>
                    <p className="font-semibold text-lg">{roomData.rooms.current_occupancy}/{roomData.rooms.max_occupancy}</p>
                  </div>
                  <div>
                    <p className="text-orange-100 text-sm">Condition</p>
                    <Badge className="bg-white text-orange-600 font-semibold">
                      {roomData.rooms.condition}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-16 h-16 text-orange-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Room Assigned</h3>
                <p className="text-orange-100">You will be assigned a room soon by the administration.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-purple-200" />
              <h3 className="font-semibold text-lg mb-2">View Roommates</h3>
              <p className="text-purple-100 text-sm">See who you're living with</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-teal-200" />
              <h3 className="font-semibold text-lg mb-2">Events</h3>
              <p className="text-teal-100 text-sm">Upcoming hostel events</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-indigo-200" />
              <h3 className="font-semibold text-lg mb-2">Announcements</h3>
              <p className="text-indigo-100 text-sm">Latest updates</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-green-200" />
              <h3 className="font-semibold text-lg mb-2">Requests</h3>
              <p className="text-green-100 text-sm">Submit maintenance requests</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
