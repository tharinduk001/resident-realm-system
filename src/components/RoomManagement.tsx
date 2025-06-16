import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, Search, Filter } from "lucide-react";

const RoomManagement = () => {
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const rooms = [
    { id: 'G-001', floor: 'Ground', student: 'John Doe', status: 'Occupied', condition: 'Good', lastInspection: '2024-01-10' },
    { id: 'G-002', floor: 'Ground', student: null, status: 'Vacant', condition: 'Good', lastInspection: '2024-01-08' },
    { id: 'B-201', floor: '2nd', student: 'Alex Johnson', status: 'Occupied', condition: 'Fair', lastInspection: '2024-01-12' },
    { id: 'B-202', floor: '2nd', student: 'Sarah Wilson', status: 'Occupied', condition: 'Good', lastInspection: '2024-01-11' },
    { id: 'C-301', floor: '3rd', student: 'Mike Davis', status: 'Occupied', condition: 'Poor', lastInspection: '2024-01-09' },
    { id: 'D-401', floor: '4th', student: null, status: 'Maintenance', condition: 'Under Repair', lastInspection: '2024-01-07' },
  ];

  const floorStats = {
    'Ground': { total: 15, occupied: 13, vacant: 2, maintenance: 0 },
    '2nd': { total: 28, occupied: 25, vacant: 2, maintenance: 1 },
    '3rd': { total: 28, occupied: 24, vacant: 3, maintenance: 1 },
    '4th': { total: 27, occupied: 23, vacant: 3, maintenance: 1 },
  };

  const filteredRooms = rooms.filter(room => {
    const matchesFloor = selectedFloor === 'all' || room.floor === selectedFloor;
    const matchesSearch = room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.student && room.student.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFloor && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
        <p className="text-gray-600">Manage rooms, assignments, and maintenance across all floors</p>
      </div>

      {/* Floor Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {Object.entries(floorStats).map(([floor, stats]) => (
          <Card key={floor} className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{floor} Floor</h3>
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Rooms:</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium text-green-600">{stats.occupied}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vacant:</span>
                  <span className="font-medium text-blue-600">{stats.vacant}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maintenance:</span>
                  <span className="font-medium text-orange-600">{stats.maintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Rooms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by room number or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="Ground">Ground Floor</SelectItem>
                <SelectItem value="2nd">2nd Floor</SelectItem>
                <SelectItem value="3rd">3rd Floor</SelectItem>
                <SelectItem value="4th">4th Floor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room {room.id}</CardTitle>
                <Badge variant={
                  room.status === 'Occupied' ? 'default' :
                  room.status === 'Vacant' ? 'secondary' :
                  'destructive'
                }>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Floor:</span>
                  <span>{room.floor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Student:</span>
                  <span>{room.student || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Condition:</span>
                  <Badge variant={
                    room.condition === 'Good' ? 'secondary' :
                    room.condition === 'Fair' ? 'default' :
                    'destructive'
                  }>
                    {room.condition}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Inspection:</span>
                  <span>{room.lastInspection}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {room.status === 'Vacant' && (
                  <Button size="sm" className="flex-1">
                    Assign Student
                  </Button>
                )}
                {room.status === 'Occupied' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Transfer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="w-6 h-6" />
              <span>Bulk Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Home className="w-6 h-6" />
              <span>Room Inspection</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Filter className="w-6 h-6" />
              <span>Maintenance Schedule</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Search className="w-6 h-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomManagement;
