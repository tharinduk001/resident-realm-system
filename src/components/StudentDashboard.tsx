
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Key, AlertTriangle, Calendar, User, Wifi } from "lucide-react";

const StudentDashboard = () => {
  const announcements = [
    { id: 1, title: "Power Outage", message: "Scheduled maintenance on Floor 2 from 2-4 PM", type: "warning", time: "2 hours ago" },
    { id: 2, title: "Water Supply", message: "Water will be available 24/7 starting tomorrow", type: "info", time: "1 day ago" },
    { id: 3, title: "Room Inspection", message: "Monthly room inspection scheduled for next week", type: "info", time: "2 days ago" },
  ];

  const myRequests = [
    { id: 1, type: "Maintenance", description: "Broken ceiling fan in Room 201", status: "In Progress", date: "2024-01-15" },
    { id: 2, type: "Temporary Room", description: "Interview room request for tomorrow", status: "Approved", date: "2024-01-16" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Alex!</h1>
        <p className="text-gray-600">Here's what's happening in your hostel today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Current Room</p>
                <p className="text-2xl font-bold">B-201</p>
              </div>
              <Home className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Key Status</p>
                <p className="text-2xl font-bold">In Hand</p>
              </div>
              <Key className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Active Requests</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Floor</p>
                <p className="text-2xl font-bold">2nd</p>
              </div>
              <User className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5" />
              <span>Latest Announcements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                  <Badge variant={announcement.type === 'warning' ? 'destructive' : 'secondary'}>
                    {announcement.type}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-1">{announcement.message}</p>
                <p className="text-xs text-gray-400">{announcement.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>My Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.map((request) => (
              <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{request.type}</span>
                  <Badge variant={request.status === 'Approved' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                <p className="text-xs text-gray-400">Submitted: {request.date}</p>
              </div>
            ))}
            <Button className="w-full mt-4">Submit New Request</Button>
          </CardContent>
        </Card>
      </div>

      {/* Room Details */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Room Details - B-201</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Room Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Floor:</span>
                  <span>2nd Floor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Type:</span>
                  <span>Single Occupancy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Size:</span>
                  <span>120 sq ft</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Furniture Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bed:</span>
                  <Badge variant="outline">Good</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mattress:</span>
                  <Badge variant="outline">Good</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Desk:</span>
                  <Badge variant="outline">Good</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chair:</span>
                  <Badge variant="destructive">Needs Repair</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">Report Issue</Button>
                <Button variant="outline" className="w-full">Request Room Change</Button>
                <Button variant="outline" className="w-full">Hand Over Keys</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
