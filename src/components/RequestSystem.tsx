
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, Search, Filter, Calendar, User, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequestSystemProps {
  userRole: string;
}

const RequestSystem = ({ userRole }: RequestSystemProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    type: 'Maintenance',
    priority: 'Medium',
    room_number: ''
  });
  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const fetchRequests = async () => {
    try {
      console.log('Fetching requests...');
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (userError || !user) {
        console.error('User authentication error:', userError);
        toast({
          title: "Authentication Error",
          description: "Please log in to view requests",
          variant: "destructive"
        });
        return;
      }

      let query = supabase
        .from('requests')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      // If user is not staff/admin, only show their own requests
      if (userRole !== 'staff' && userRole !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data: requestsData, error: requestsError } = await query;
      console.log('Requests data:', requestsData);
      console.log('Requests error:', requestsError);

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        toast({
          title: "Error",
          description: `Failed to load requests: ${requestsError.message}`,
          variant: "destructive"
        });
        return;
      }

      const processedRequests = requestsData || [];
      setRequests(processedRequests);

      // Calculate stats
      const newStats = {
        pending: processedRequests.filter(r => r.status === 'Pending').length,
        in_progress: processedRequests.filter(r => r.status === 'In Progress').length,
        completed: processedRequests.filter(r => r.status === 'Completed').length,
        rejected: processedRequests.filter(r => r.status === 'Rejected').length
      };
      setStats(newStats);

    } catch (error: any) {
      console.error('Unexpected error fetching requests:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating request with data:', newRequest);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "Authentication required to create request",
          variant: "destructive"
        });
        return;
      }

      const requestData = {
        description: newRequest.description.trim(),
        type: newRequest.type,
        priority: newRequest.priority,
        room_number: newRequest.room_number.trim() || null,
        user_id: user.id,
        status: 'Pending'
      };

      console.log('Inserting request data:', requestData);

      const { data, error } = await supabase
        .from('requests')
        .insert(requestData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Error creating request:', error);
        toast({
          title: "Error",
          description: `Failed to create request: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Request created successfully!",
      });

      setNewRequest({
        title: '',
        description: '',
        type: 'Maintenance',
        priority: 'Medium',
        room_number: ''
      });
      setShowNewRequestDialog(false);
      fetchRequests();
    } catch (error: any) {
      console.error('Unexpected error creating request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the request",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      console.log('Updating request status:', { requestId, newStatus });
      
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      console.log('Status update error:', error);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: `Failed to update status: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Request status updated successfully!",
      });

      fetchRequests();
    } catch (error: any) {
      console.error('Unexpected error updating status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'In Progress':
        return <Badge variant="default" className="flex items-center gap-1 bg-blue-500"><MessageSquare className="w-3 h-3" />In Progress</Badge>;
      case 'Completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Completed</Badge>;
      case 'Rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">Medium</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Request System
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            {userRole === 'staff' || userRole === 'admin' ? 'Manage all student requests' : 'Submit and track your requests'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{stats.in_progress}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl px-8 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Create New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">Create New Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label className="text-sm font-medium">Title *</Label>
                  <Input
                    placeholder="Brief description of your request"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <Select value={newRequest.type} onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Temporary Room">Temporary Room</SelectItem>
                        <SelectItem value="Room Change">Room Change</SelectItem>
                        <SelectItem value="Key Handover">Key Handover</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Room Number (Optional)</Label>
                  <Input
                    placeholder="e.g., B-201"
                    value={newRequest.room_number}
                    onChange={(e) => setNewRequest({ ...newRequest, room_number: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Description *</Label>
                  <Textarea
                    placeholder="Detailed description of your request..."
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <Button onClick={handleCreateRequest} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Create Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Temporary Room">Temporary Room</SelectItem>
                    <SelectItem value="Room Change">Room Change</SelectItem>
                    <SelectItem value="Key Handover">Key Handover</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">No Requests Found</h3>
                <p className="text-gray-500 text-lg">
                  {requests.length === 0 
                    ? "No requests have been submitted yet."
                    : "No requests match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-bold text-lg text-gray-800">{request.title}</h3>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                        <Badge variant="outline">{request.type}</Badge>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{request.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                        {request.room_number && (
                          <div className="flex items-center space-x-1">
                            <span>Room: {request.room_number}</span>
                          </div>
                        )}
                        {request.profiles?.email && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{request.profiles.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {(userRole === 'staff' || userRole === 'admin') && (
                      <div className="flex flex-col gap-2 ml-4">
                        {request.status === 'Pending' && (
                          <>
                            <Button
                              onClick={() => handleUpdateStatus(request.id, 'In Progress')}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Start Progress
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                              variant="destructive"
                              size="sm"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'In Progress' && (
                          <Button
                            onClick={() => handleUpdateStatus(request.id, 'Completed')}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestSystem;
