
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Users, Clock, Calendar, MapPin, User, Phone, Mail, GraduationCap, MessageSquare, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      console.log('Starting to fetch student data...');
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (userError) {
        console.error('User fetch error:', userError);
        setError('Failed to get user information');
        return;
      }

      if (!user) {
        console.log('No authenticated user found');
        setError('Please log in to access your dashboard');
        return;
      }

      // Fetch student registration data
      console.log('Fetching registration for user:', user.id);
      const { data: registration, error: regError } = await supabase
        .from('student_registrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Registration data:', registration);
      console.log('Registration error:', regError);

      if (regError) {
        console.error('Registration fetch error:', regError);
        setError('Failed to load registration data');
        return;
      }

      if (!registration) {
        console.log('No registration found for user');
        setError('No registration found. Please complete your registration.');
        return;
      }

      if (registration.status !== 'approved') {
        console.log('Registration not approved, status:', registration.status);
        setError(`Registration status: ${registration.status}. Please wait for approval.`);
        return;
      }

      console.log('Setting student data:', registration);
      setStudentData(registration);

      // Fetch room assignment with proper join
      console.log('Fetching room assignment for user:', user.id);
      const { data: assignments, error: assignError } = await supabase
        .from('room_assignments')
        .select('*')
        .eq('student_id', user.id)
        .eq('is_active', true);

      let assignment = null;
      if (assignments && assignments.length > 0) {
        const roomAssignment = assignments[0];
        
        // Fetch room details separately
        const { data: roomDetails, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomAssignment.room_id)
          .single();

        if (roomDetails && !roomError) {
          assignment = {
            ...roomAssignment,
            rooms: roomDetails
          };
        }
      }

      console.log('Room assignment:', assignment);
      console.log('Assignment error:', assignError);

      if (assignError) {
        console.error('Room assignment fetch error:', assignError);
      } else if (assignment && assignment.rooms) {
        setRoomData(assignment);
        
      // Fetch roommates
      const { data: roommatesData, error: roommatesError } = await supabase
        .from('room_assignments')
        .select('student_id')
        .eq('room_id', assignment.rooms.id)
        .eq('is_active', true)
        .neq('student_id', user.id);

      if (!roommatesError && roommatesData && roommatesData.length > 0) {
        // Get roommate details
        const roommateIds = roommatesData.map(r => r.student_id);
        const { data: roommateDetails } = await supabase
          .from('student_registrations')
          .select('user_id, full_name, phone, academic_year')
          .in('user_id', roommateIds);

        console.log('Roommates data:', roommatesData);
        console.log('Roommate details:', roommateDetails);
        console.log('Roommates error:', roommatesError);

        if (roommateDetails) {
          setRoommates(roommateDetails);
        }
      }
      }

    } catch (error: any) {
      console.error('Unexpected error in fetchStudentData:', error);
      setError('An unexpected error occurred. Please try refreshing the page.');
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
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
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Issue</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                fetchStudentData();
              }} 
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
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
            Welcome Back, {studentData?.full_name?.split(' ')[0] || 'Student'}!
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
                    <p className="font-semibold">{studentData?.full_name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-blue-100 text-sm">ID Number</p>
                    <p className="font-semibold">{studentData?.id_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-blue-100 text-sm">Phone</p>
                    <p className="font-semibold">{studentData?.phone || 'N/A'}</p>
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
                    {studentData?.status || 'Unknown'}
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
                      <p className="text-2xl font-bold">{roomData.rooms?.room_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-orange-100 text-sm">Floor</p>
                    <p className="font-semibold text-lg">{roomData.rooms?.floor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-orange-100 text-sm">Room Type</p>
                    <p className="font-semibold">{roomData.rooms?.room_type || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-orange-100 text-sm">Occupancy</p>
                    <p className="font-semibold text-lg">
                      {roomData.rooms?.current_occupancy || 0}/{roomData.rooms?.max_occupancy || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-orange-100 text-sm">Condition</p>
                    <Badge className="bg-white text-orange-600 font-semibold">
                      {roomData.rooms?.condition || 'Unknown'}
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

        {/* Roommates Section */}
        {roomData && roommates.length > 0 && (
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Users className="w-7 h-7 mr-3" />
                Your Roommates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roommates.map((roommate, index) => (
                  <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-200" />
                      </div>
                      <div>
                        <p className="font-semibold">{roommate.full_name}</p>
                        <p className="text-purple-200 text-sm">Year {roommate.academic_year}</p>
                        {roommate.phone && (
                          <p className="text-purple-200 text-xs">{roommate.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
