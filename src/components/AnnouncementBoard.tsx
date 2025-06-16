
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, AlertTriangle, Info, Calendar, Megaphone } from "lucide-react";

interface AnnouncementBoardProps {
  userRole: string;
}

const AnnouncementBoard = ({ userRole }: AnnouncementBoardProps) => {
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
    targetFloor: 'all'
  });

  const announcements = [
    {
      id: 1,
      title: "Power Outage Scheduled",
      message: "Scheduled maintenance on Floor 2 from 2-4 PM tomorrow. Please plan accordingly and charge your devices in advance.",
      type: "warning",
      targetFloor: "2nd",
      author: "Sub Warden",
      datePosted: "2024-01-16",
      timePosted: "09:30 AM",
      isActive: true
    },
    {
      id: 2,
      title: "24/7 Water Supply Restored",
      message: "We're pleased to announce that the water supply issue has been resolved. Water will now be available 24/7 across all floors.",
      type: "info",
      targetFloor: "all",
      author: "Warden",
      datePosted: "2024-01-15",
      timePosted: "06:00 PM",
      isActive: true
    },
    {
      id: 3,
      title: "Monthly Room Inspection",
      message: "Monthly room inspection will be conducted next week. Please ensure your rooms are clean and organized. Schedule will be posted on individual floor notice boards.",
      type: "info",
      targetFloor: "all",
      author: "Sub Warden",
      datePosted: "2024-01-14",
      timePosted: "11:00 AM",
      isActive: true
    },
    {
      id: 4,
      title: "WiFi Upgrade Complete",
      message: "The WiFi upgrade for the 4th floor has been completed. You should experience significantly improved internet speeds.",
      type: "info",
      targetFloor: "4th",
      author: "IT Team",
      datePosted: "2024-01-13",
      timePosted: "03:00 PM",
      isActive: true
    },
    {
      id: 5,
      title: "Elevator Maintenance",
      message: "The main elevator will be under maintenance from 10 AM to 2 PM on Sunday. Please use the stairs during this time.",
      type: "warning",
      targetFloor: "all",
      author: "Maintenance",
      datePosted: "2024-01-12",
      timePosted: "08:00 AM",
      isActive: false
    }
  ];

  const handleSubmitAnnouncement = () => {
    console.log('Submitting announcement:', newAnnouncement);
    // In real app, this would call an API
    setNewAnnouncement({ title: '', message: '', type: 'info', targetFloor: 'all' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'urgent': return 'destructive';
      case 'info': return 'default';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'urgent': return AlertTriangle;
      case 'info': return Info;
      default: return MessageSquare;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
          <p className="text-gray-600">
            {userRole === 'student' 
              ? 'Stay updated with the latest hostel announcements and notices'
              : 'Manage and publish announcements for students'
            }
          </p>
        </div>
        
        {userRole === 'staff' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Announcement</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Announcement Title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                />

                <Select value={newAnnouncement.type} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Announcement Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={newAnnouncement.targetFloor} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, targetFloor: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Target Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floors</SelectItem>
                    <SelectItem value="Ground">Ground Floor</SelectItem>
                    <SelectItem value="2nd">2nd Floor</SelectItem>
                    <SelectItem value="3rd">3rd Floor</SelectItem>
                    <SelectItem value="4th">4th Floor</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Write your announcement message here..."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  rows={5}
                />

                <Button onClick={handleSubmitAnnouncement} className="w-full">
                  Publish Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Active Announcements */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Megaphone className="w-5 h-5" />
          <span>Active Announcements</span>
        </h2>
        
        <div className="space-y-4">
          {announcements.filter(ann => ann.isActive).map((announcement) => {
            const Type Icon = getTypeIcon(announcement.type);
            return (
              <Card key={announcement.id} className={`border-l-4 ${
                announcement.type === 'warning' ? 'border-l-orange-500 bg-orange-50' :
                announcement.type === 'urgent' ? 'border-l-red-500 bg-red-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <TypeIcon className={`w-5 h-5 ${
                        announcement.type === 'warning' ? 'text-orange-600' :
                        announcement.type === 'urgent' ? 'text-red-600' :
                        'text-blue-600'
                      }`} />
                      <h3 className="font-semibold text-lg text-gray-900">
                        {announcement.title}
                      </h3>
                      <Badge variant={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <div>{announcement.datePosted}</div>
                      <div>{announcement.timePosted}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {announcement.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Target: {announcement.targetFloor === 'all' ? 'All Floors' : announcement.targetFloor + ' Floor'}</span>
                      <span>By: {announcement.author}</span>
                    </div>
                    
                    {userRole === 'staff' && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Archive</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Announcements */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Recent Announcements</span>
        </h2>
        
        <div className="space-y-3">
          {announcements.filter(ann => !ann.isActive).map((announcement) => {
            const TypeIcon = getTypeIcon(announcement.type);
            return (
              <Card key={announcement.id} className="bg-gray-50 opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TypeIcon className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-700">{announcement.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        Archived
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {announcement.datePosted} • {announcement.author}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats for Staff */}
      {userRole === 'staff' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Announcement Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">5</div>
                <div className="text-sm text-gray-600">Active Announcements</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">12</div>
                <div className="text-sm text-gray-600">Total This Month</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">2</div>
                <div className="text-sm text-gray-600">Urgent Notices</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">98%</div>
                <div className="text-sm text-gray-600">Reach Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnnouncementBoard;
