
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Key, AlertTriangle, Calendar, User, Wifi, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [furnitureItems, setFurnitureItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: '',
    description: '',
    priority: 'Medium',
    room_number: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch user's requests
      const { data: requestsData } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch user's room assignment and details
      const { data: assignmentData } = await supabase
        .from('room_assignments')
        .select(`
          *,
          rooms (*)
        `)
        .eq('student_id', user.data.user.id)
        .eq('is_active', true)
        .single();

      // Fetch furniture for the assigned room
      if (assignmentData?.rooms) {
        const { data: furnitureData } = await supabase
          .from('furniture_items')
          .select('*')
          .eq('room_id', assignmentData.rooms.id);
        
        setFurnitureItems(furnitureData || []);
        setRoomDetails(assignmentData.rooms);
        setNewRequest(prev => ({ ...prev, room_number: assignmentData.rooms.room_number }));
      }

      setAnnouncements(announcementsData || []);
      setRequests(requestsData || []);
    } catch (error) {
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

  const handleSubmitRequest = async () => {
    if (!newRequest.type || !newRequest.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await supabase
        .from('requests')
        .insert({
          user_id: user.data.user.id,
          type: newRequest.type,
          description: newRequest.description,
          priority: newRequest.priority,
          room_number: newRequest.room_number
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request submitted successfully!",
      });

      setNewRequest({ type: '', description: '', priority: 'Medium', room_number: roomDetails?.room_number || '' });
      setShowNewRequestDialog(false);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleQuickAction = (actionType: string) => {
    setNewRequest(prev => ({
      ...prev,
      type: actionType,
      room_number: roomDetails?.room_number || ''
    }));
    setShowNewRequestDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Approved': return 'secondary';
      case 'Pending': return 'destructive';
      default: return 'secondary';
    }
  };

  const getAnnouncementType = (type: string) => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'urgent': return 'destructive';
      default: return 'secondary';
    }
  };

  const getFurnitureStatusColor = (condition: string) => {
    switch (condition) {
      case 'Good': return 'secondary';
      case 'Fair': return 'default';
      case 'Poor': return 'destructive';
      case 'Needs Repair': return 'destructive';
      default: return 'secondary';
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening in your hostel today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Current Room</p>
                  <p className="text-2xl font-bold">{roomDetails?.room_number || 'Not Assigned'}</p>
                </div>
                <Home className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Room Status</p>
                  <p className="text-2xl font-bold">{roomDetails?.status || 'N/A'}</p>
                </div>
                <Key className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Requests</p>
                  <p className="text-2xl font-bold">{requests.filter(r => r.status !== 'Completed').length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Floor</p>
                  <p className="text-2xl font-bold">{roomDetails?.floor || 'N/A'}</p>
                </div>
                <User className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Announcements */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Wifi className="w-5 h-5" />
                <span>Latest Announcements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                      <Badge variant={getAnnouncementType(announcement.type)}>
                        {announcement.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{announcement.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No announcements available</p>
              )}
            </CardContent>
          </Card>

          {/* My Requests */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center justify-between text-blue-900">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>My Requests</span>
                </div>
                <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      <span>New</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-blue-900">Submit New Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Select value={newRequest.type} onValueChange={(value) => setNewRequest({...newRequest, type: value})}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500">
                          <SelectValue placeholder="Request Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Temporary Room">Temporary Room</SelectItem>
                          <SelectItem value="Room Change">Room Change</SelectItem>
                          <SelectItem value="Key Handover">Key Handover</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Room Number"
                        value={newRequest.room_number}
                        onChange={(e) => setNewRequest({...newRequest, room_number: e.target.value})}
                        className="border-blue-200 focus:border-blue-500"
                      />

                      <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="Describe your request in detail..."
                        value={newRequest.description}
                        onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                        rows={4}
                        className="border-blue-200 focus:border-blue-500"
                      />

                      <Button onClick={handleSubmitRequest} className="w-full bg-blue-600 hover:bg-blue-700">
                        Submit Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <div key={request.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{request.type}</span>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                    <p className="text-xs text-gray-400">
                      Room: {request.room_number} | {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No requests submitted yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Room Details */}
        {roomDetails && (
          <Card className="mt-8 border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900">Room Details - {roomDetails.room_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Room Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span>{roomDetails.floor} Floor</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type:</span>
                      <span>{roomDetails.room_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Size:</span>
                      <span>{roomDetails.room_size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <Badge variant={getFurnitureStatusColor(roomDetails.condition)}>
                        {roomDetails.condition}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Furniture Status</h4>
                  <div className="space-y-2 text-sm">
                    {furnitureItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-600">{item.item_name}:</span>
                        <Badge variant={getFurnitureStatusColor(item.condition)}>
                          {item.condition}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleQuickAction('Maintenance')}
                    >
                      Report Issue
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleQuickAction('Room Change')}
                    >
                      Request Room Change
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleQuickAction('Key Handover')}
                    >
                      Hand Over Keys
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
