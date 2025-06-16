
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

interface RequestSystemProps {
  userRole: string;
}

const RequestSystem = ({ userRole }: RequestSystemProps) => {
  const [newRequest, setNewRequest] = useState({
    type: '',
    description: '',
    priority: 'Medium',
    room: ''
  });

  const requests = [
    {
      id: 1,
      type: 'Maintenance',
      description: 'Broken ceiling fan in Room 201',
      student: 'Alex Johnson',
      room: 'B-201',
      status: 'In Progress',
      priority: 'High',
      dateSubmitted: '2024-01-15',
      assignedTo: 'Maintenance Team A'
    },
    {
      id: 2,
      type: 'Temporary Room',
      description: 'Need interview room for tomorrow',
      student: 'Sarah Wilson',
      room: 'B-202',
      status: 'Approved',
      priority: 'Medium',
      dateSubmitted: '2024-01-16',
      assignedTo: 'Sub Warden'
    },
    {
      id: 3,
      type: 'Key Handover',
      description: 'Going home for emergency, need to hand over keys',
      student: 'Mike Davis',
      room: 'C-301',
      status: 'Completed',
      priority: 'Low',
      dateSubmitted: '2024-01-14',
      assignedTo: 'Warden'
    },
    {
      id: 4,
      type: 'Room Change',
      description: 'Request to move to ground floor due to mobility issues',
      student: 'Emma Brown',
      room: 'D-401',
      status: 'Pending',
      priority: 'High',
      dateSubmitted: '2024-01-17',
      assignedTo: 'Sub Warden'
    }
  ];

  const handleSubmitRequest = () => {
    console.log('Submitting request:', newRequest);
    // In real app, this would call an API
    setNewRequest({ type: '', description: '', priority: 'Medium', room: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'default';
      case 'Approved': return 'secondary';
      case 'Pending': return 'destructive';
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
          <Dialog>
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
                  value={newRequest.room}
                  onChange={(e) => setNewRequest({...newRequest, room: e.target.value})}
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
      {userRole === 'staff' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Requests</p>
                  <p className="text-2xl font-bold">24</p>
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
                  <p className="text-2xl font-bold">6</p>
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
                  <p className="text-2xl font-bold">15</p>
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
                  <p className="text-2xl font-bold">3</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
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
                    <span>Room: {request.room}</span>
                    {userRole === 'staff' && <span>Student: {request.student}</span>}
                    <span>Submitted: {request.dateSubmitted}</span>
                    {request.assignedTo && <span>Assigned to: {request.assignedTo}</span>}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {userRole === 'staff' && request.status === 'Pending' && (
                    <>
                      <Button variant="outline" size="sm">Reject</Button>
                      <Button size="sm">Approve</Button>
                    </>
                  )}
                  {userRole === 'staff' && request.status === 'In Progress' && (
                    <Button size="sm">Mark Complete</Button>
                  )}
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions for Staff */}
      {userRole === 'staff' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Bulk Assign</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
                <Clock className="w-5 h-5" />
                <span>Set Priorities</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="w-5 h-5" />
                <span>Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RequestSystem;
