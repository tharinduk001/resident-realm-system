
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Users, AlertTriangle, Key, TrendingUp, Clock } from "lucide-react";

const StaffDashboard = () => {
  const recentReports = [
    { id: 1, room: "B-201", issue: "Broken ceiling fan", student: "Alex Johnson", priority: "High", time: "2 hours ago" },
    { id: 2, room: "C-315", issue: "Leaky faucet", student: "Sarah Wilson", priority: "Medium", time: "4 hours ago" },
    { id: 3, room: "A-105", issue: "Flickering lights", student: "Mike Davis", priority: "Low", time: "1 day ago" },
  ];

  const pendingRequests = [
    { id: 1, type: "Temporary Room", student: "Emma Brown", reason: "Interview", status: "Pending" },
    { id: 2, type: "Room Change", student: "John Smith", reason: "Floor preference", status: "Under Review" },
    { id: 3, type: "Key Handover", student: "Lisa Chen", reason: "Going home", status: "Completed" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
        <p className="text-gray-600">Monitor and manage all hostel operations</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Rooms</p>
                <p className="text-2xl font-bold">98</p>
                <p className="text-sm text-blue-200">87% Occupied</p>
              </div>
              <Home className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Students</p>
                <p className="text-2xl font-bold">85</p>
                <p className="text-sm text-green-200">2 New This Week</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Pending Reports</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-red-200">3 High Priority</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Key Handovers</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-purple-200">Today</p>
              </div>
              <Key className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Recent Reports</span>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">Room {report.room}</span>
                    <Badge variant={report.priority === 'High' ? 'destructive' : report.priority === 'Medium' ? 'default' : 'secondary'}>
                      {report.priority}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">{report.time}</span>
                </div>
                <p className="text-gray-600 text-sm mb-1">{report.issue}</p>
                <p className="text-xs text-gray-500">Reported by: {report.student}</p>
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline">Assign</Button>
                  <Button size="sm">Mark Resolved</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Pending Requests</span>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{request.type}</span>
                  <Badge variant={request.status === 'Completed' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-1">Student: {request.student}</p>
                <p className="text-gray-600 text-sm mb-3">Reason: {request.reason}</p>
                {request.status !== 'Completed' && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Reject</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Floor Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Floor-wise Occupancy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Ground Floor</h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">13/15</div>
              <div className="text-sm text-gray-600">87% Occupied</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">2nd Floor</h4>
              <div className="text-2xl font-bold text-green-600 mb-1">25/28</div>
              <div className="text-sm text-gray-600">89% Occupied</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">3rd Floor</h4>
              <div className="text-2xl font-bold text-orange-600 mb-1">24/28</div>
              <div className="text-sm text-gray-600">86% Occupied</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">4th Floor</h4>
              <div className="text-2xl font-bold text-purple-600 mb-1">23/27</div>
              <div className="text-sm text-gray-600">85% Occupied</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
