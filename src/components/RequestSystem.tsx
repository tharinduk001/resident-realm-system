
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, Search, Filter, User, Calendar } from "lucide-react";
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

      let requestsQuery = supabase.from('requests').select('*');

      if (userRole === 'student') {
        requestsQuery = requestsQuery.eq('user_id', user.data.user.id);
      }

      const { data: requestsData, error: requestsError } = await requestsQuery.order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const userIds = new Set<string>();
      requestsData?.forEach(request => {
        if (request.user_id) userIds.add(request.user_id);
        if (request.assigned_to) userIds.add(request.assigned_to);
      });

      let profilesData: any[] = [];
      let studentNamesData: any[] = [];
      
      if (userIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', Array.from(userIds));

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }

        // Fetch student names from registrations
        const { data: studentNames, error: studentNamesError } = await supabase
          .from('student_registrations')
          .select('user_id, full_name')
          .in('user_id', Array.from(userIds));

        if (studentNamesError) {
          console.error('Error fetching student names:', studentNamesError);
        } else {
          studentNamesData = studentNames || [];
        }
      }

      const processedRequests = requestsData?.map(request => {
        const userProfile = profilesData.find(p => p.id === request.user_id);
        const assignedProfile = profilesData.find(p => p.id === request.assigned_to);
        const studentName = studentNamesData.find(s => s.user_id === request.user_id);
        
        return {
          ...request,
          profiles: userProfile ? { email: userProfile.email } : null,
          assigned_profiles: assignedProfile ? { email: assignedProfile.email } : null,
          student_name: studentName?.full_name || userProfile?.email || 'Unknown Student'
        };
      }) || [];

      setRequests(processedRequests);
      
      const total = processedRequests.length;
      const pending = processedRequests.filter(r => r.status === 'Pending').length;
      const completed = processedRequests.filter(r => r.status === 'Completed').length;
      const highPriority = processedRequests.filter(r => r.priority === 'High').length;
      
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
        r.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Approved': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const requestsByStatus = {
    pending: filteredRequests.filter(r => r.status === 'Pending'),
    approved: filteredRequests.filter(r => r.status === 'Approved'),
    inProgress: filteredRequests.filter(r => r.status === 'In Progress'),
    completed: filteredRequests.filter(r => r.status === 'Completed'),
    rejected: filteredRequests.filter(r => r.status === 'Rejected')
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === 'student' ? 'My Requests' : 'Request Management'}
          </h1>
          <p className="text-gray-600 text-sm">
            {userRole === 'student' 
              ? 'Track and submit your maintenance requests'
              : 'Manage all student requests and assignments'
            }
          </p>
        </div>
        
        {userRole === 'student' && (
          <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Request</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Request</DialogTitle>
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low Priority</SelectItem>
                    <SelectItem value="Medium">Medium Priority</SelectItem>
                    <SelectItem value="High">High Priority</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Describe your request..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  rows={3}
                />

                <Button onClick={handleSubmitRequest} className="w-full" size="sm">
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics (Staff only) */}
      {(userRole === 'staff' || userRole === 'admin') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-orange-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-green-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
              <div className="text-sm text-red-600">High Priority</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              size="sm"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categorized Requests */}
      <div className="space-y-8">
        {/* Pending Requests */}
        {requestsByStatus.pending.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-orange-600">Pending Requests</h2>
              <Badge variant="default" className="text-xs">{requestsByStatus.pending.length}</Badge>
            </div>
            <div className="space-y-3">
              {requestsByStatus.pending.map((request) => (
                <Card key={request.id} className={`border-l-4 border-l-orange-500 ${getStatusColor(request.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-sm">{request.type}</h3>
                          <Badge variant={getPriorityColor(request.priority)} className="text-xs">
                            {request.priority}
                          </Badge>
                          {request.room_number && (
                            <Badge variant="outline" className="text-xs">
                              Room {request.room_number}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                          {(userRole === 'staff' || userRole === 'admin') && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{request.student_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {(userRole === 'staff' || userRole === 'admin') && (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Requests */}
        {requestsByStatus.inProgress.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-blue-600">In Progress</h2>
              <Badge variant="secondary" className="text-xs">{requestsByStatus.inProgress.length}</Badge>
            </div>
            <div className="space-y-3">
              {requestsByStatus.inProgress.map((request) => (
                <Card key={request.id} className={`border-l-4 border-l-blue-500 ${getStatusColor(request.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-sm">{request.type}</h3>
                          <Badge variant={getPriorityColor(request.priority)} className="text-xs">
                            {request.priority}
                          </Badge>
                          {request.room_number && (
                            <Badge variant="outline" className="text-xs">
                              Room {request.room_number}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                          {(userRole === 'staff' || userRole === 'admin') && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{request.student_name}</span>
                            </div>
                          )}
                          {request.assigned_profiles?.email && (
                            <span>Assigned: {request.assigned_profiles.email}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {(userRole === 'staff' || userRole === 'admin') && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateRequestStatus(request.id, 'Completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Requests */}
        {requestsByStatus.completed.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-green-600">Completed</h2>
              <Badge variant="secondary" className="text-xs">{requestsByStatus.completed.length}</Badge>
            </div>
            <div className="space-y-3">
              {requestsByStatus.completed.map((request) => (
                <Card key={request.id} className={`border-l-4 border-l-green-500 ${getStatusColor(request.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-sm">{request.type}</h3>
                          <Badge variant={getPriorityColor(request.priority)} className="text-xs">
                            {request.priority}
                          </Badge>
                          {request.room_number && (
                            <Badge variant="outline" className="text-xs">
                              Room {request.room_number}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                          {(userRole === 'staff' || userRole === 'admin') && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{request.student_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests</h3>
              <p className="text-gray-600 text-sm">
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
