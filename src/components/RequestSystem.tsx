
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequestSystemProps {
  userRole: string;
}

const RequestSystem = ({ userRole }: RequestSystemProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    highPriority: 0
  });
  const [newRequest, setNewRequest] = useState({
    type: '',
    description: '',
    priority: 'Medium',
    room_number: ''
  });
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [userRole]);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, searchTerm]);

  const fetchRequests = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      let query = supabase.from('requests').select(`
        *,
        profiles!requests_user_id_fkey(email),
        assigned_profiles:profiles!requests_assigned_to_fkey(email)
      `);

      if (userRole === 'student') {
        query = query.eq('user_id', user.data.user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(r => r.status === 'Pending').length || 0;
      const completed = data?.filter(r => r.status === 'Completed').length || 0;
      const highPriority = data?.filter(r => r.priority === 'High').length || 0;
      
      setStats({ total, pending, completed, highPriority });
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
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

      setNewRequest({ type: '', description: '', priority: 'Medium', room_number: '' });
      setShowNewRequestDialog(false);
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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

      fetchRequests();
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
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Approved': return 'secondary';
      case 'Pending': return 'destructive';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === 'student' ? 'My Requests' : 'Request Management'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'student' 
              ? 'Track your submitted requests and submit new ones'
              : 'Manage all student requests and assign staff members'
            }
          </p>
        </div>
        
        {userRole === 'student' && (
          <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Request</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit New Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select value={newRequest.type} onValueChange={(value) => setNewRequest({...newRequest, type: value})}>
                  <SelectTrigger>
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
                  placeholder="Room Number (e.g., B-201)"
                  value={newRequest.room_number}
                  onChange={(e) => setNewRequest({...newRequest, room_number: e.target.value})}
                />

                <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
                  <SelectTrigger>
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
                />

                <Button onClick={handleSubmitRequest} className="w-full">
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Request Statistics (Staff only) */}
      {(userRole === 'staff' || userRole === 'admin') && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">High Priority</p>
                  <p className="text-2xl font-bold">{stats.highPriority}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearch

(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{request.type}</h3>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge variant={getPriorityColor(request.priority)}>
                        {request.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{request.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {request.room_number && <span>Room: {request.room_number}</span>}
                      {(userRole === 'staff' || userRole === 'admin') && request.profiles?.email && (
                        <span>Student: {request.profiles.email}</span>
                      )}
                      <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.assigned_profiles?.email && (
                        <span>Assigned to: {request.assigned_profiles.email}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {(userRole === 'staff' || userRole === 'admin') && request.status === 'Pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
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
                      </>
                    )}
                    {(userRole === 'staff' || userRole === 'admin') && request.status === 'Approved' && (
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateRequestStatus(request.id, 'In Progress')}
                      >
                        Start Work
                      </Button>
                    )}
                    {(userRole === 'staff' || userRole === 'admin') && request.status === 'In Progress' && (
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateRequestStatus(request.id, 'Completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Found</h3>
              <p className="text-gray-600">
                {userRole === 'student' 
                  ? "You haven't submitted any requests yet."
                  : "No requests match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RequestSystem;
