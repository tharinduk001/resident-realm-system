
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Home, Key, AlertTriangle, Calendar, MessageSquare } from "lucide-react";
import Navigation from "@/components/Navigation";
import StudentDashboard from "@/components/StudentDashboard";
import StaffDashboard from "@/components/StaffDashboard";
import RoomManagement from "@/components/RoomManagement";
import RequestSystem from "@/components/RequestSystem";
import AnnouncementBoard from "@/components/AnnouncementBoard";

const Index = () => {
  const [currentView, setCurrentView] = useState('login');
  const [userRole, setUserRole] = useState('');

  // Mock login function - in real app this would integrate with Clerk
  const handleLogin = (role: string) => {
    setUserRole(role);
    setCurrentView(role === 'student' ? 'student-dashboard' : 'staff-dashboard');
  };

  const handleLogout = () => {
    setUserRole('');
    setCurrentView('login');
  };

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">HostelHub</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern hostel management system designed for seamless operations and enhanced student experience
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Student Portal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  Access your room details, submit requests, view announcements, and manage your hostel experience.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Room Status</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Key Status</span>
                    <Badge variant="outline">In Hand</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pending Requests</span>
                    <Badge>2</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => handleLogin('student')} 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Student Login
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Staff Portal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  Manage rooms, handle requests, oversee operations, and maintain hostel records efficiently.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Occupancy Rate</span>
                    <Badge variant="secondary">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pending Reports</span>
                    <Badge variant="destructive">5</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Key Handovers</span>
                    <Badge>3</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => handleLogin('staff')} 
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  Staff Login
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">98 Rooms</h3>
                <p className="text-sm text-gray-600">Across 4 floors</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">85 Students</h3>
                <p className="text-sm text-gray-600">Currently enrolled</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">5 Reports</h3>
                <p className="text-sm text-gray-600">Pending resolution</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">3 Announcements</h3>
                <p className="text-sm text-gray-600">Active notices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        userRole={userRole} 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
      />
      
      <main className="pt-16">
        {currentView === 'student-dashboard' && <StudentDashboard />}
        {currentView === 'staff-dashboard' && <StaffDashboard />}
        {currentView === 'room-management' && <RoomManagement />}
        {currentView === 'requests' && <RequestSystem userRole={userRole} />}
        {currentView === 'announcements' && <AnnouncementBoard userRole={userRole} />}
      </main>
    </div>
  );
};

export default Index;
