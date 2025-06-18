import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, Calendar, AlertTriangle, Info, Search, Filter, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementBoardProps {
  userRole: string;
}

const AnnouncementBoard = ({ userRole }: AnnouncementBoardProps) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showNewAnnouncementDialog, setShowNewAnnouncementDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, typeFilter]);

  const fetchAnnouncements = async () => {
    try {
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      const userIds = new Set<string>();
      announcementsData?.forEach(announcement => {
        if (announcement.created_by) userIds.add(announcement.created_by);
      });

      let profilesData: any[] = [];
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
      }

      const processedAnnouncements = announcementsData?.map(announcement => {
        const userProfile = profilesData.find(p => p.id === announcement.created_by);
        
        return {
          ...announcement,
          profiles: userProfile ? { email: userProfile.email } : null
        };
      }) || [];

      setAnnouncements(processedAnnouncements);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
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
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          type: newAnnouncement.type,
          created_by: user.data.user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });

      setNewAnnouncement({ title: '', message: '', type: 'info' });
      setShowNewAnnouncementDialog(false);
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeactivateAnnouncement = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', announcementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement removed successfully!",
      });

      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'urgent': return 'destructive';
      case 'warning': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  const announcementsByType = {
    urgent: filteredAnnouncements.filter(a => a.type === 'urgent'),
    warning: filteredAnnouncements.filter(a => a.type === 'warning'),
    info: filteredAnnouncements.filter(a => a.type === 'info')
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 text-sm">Stay updated with important hostel information</p>
        </div>
        
        {(userRole === 'staff' || userRole === 'admin') && (
          <Dialog open={showNewAnnouncementDialog} onOpenChange={setShowNewAnnouncementDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Announcement</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                />

                <Select value={newAnnouncement.type} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Message content..."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  rows={3}
                />

                <Button onClick={handleCreateAnnouncement} className="w-full" size="sm">
                  Create Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              size="sm"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Information</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categorized Announcements */}
      <div className="space-y-8">
        {/* Urgent Announcements */}
        {announcementsByType.urgent.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-red-600">Urgent Announcements</h2>
              <Badge variant="destructive" className="text-xs">{announcementsByType.urgent.length}</Badge>
            </div>
            <div className="space-y-3">
              {announcementsByType.urgent.map((announcement) => (
                <Card key={announcement.id} className={`border-l-4 border-l-red-500 ${getTypeColor(announcement.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(announcement.type)}
                          <h3 className="font-medium text-sm">{announcement.title}</h3>
                          <Badge variant={getBadgeVariant(announcement.type)} className="text-xs">
                            {announcement.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          </div>
                          {announcement.profiles?.email && (
                            <span>By: {announcement.profiles.email}</span>
                          )}
                        </div>
                      </div>
                      {(userRole === 'staff' || userRole === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateAnnouncement(announcement.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Warning Announcements */}
        {announcementsByType.warning.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-orange-600">Warnings</h2>
              <Badge variant="default" className="text-xs">{announcementsByType.warning.length}</Badge>
            </div>
            <div className="space-y-3">
              {announcementsByType.warning.map((announcement) => (
                <Card key={announcement.id} className={`border-l-4 border-l-orange-500 ${getTypeColor(announcement.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(announcement.type)}
                          <h3 className="font-medium text-sm">{announcement.title}</h3>
                          <Badge variant={getBadgeVariant(announcement.type)} className="text-xs">
                            {announcement.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          </div>
                          {announcement.profiles?.email && (
                            <span>By: {announcement.profiles.email}</span>
                          )}
                        </div>
                      </div>
                      {(userRole === 'staff' || userRole === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateAnnouncement(announcement.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Information Announcements */}
        {announcementsByType.info.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-blue-600">Information</h2>
              <Badge variant="secondary" className="text-xs">{announcementsByType.info.length}</Badge>
            </div>
            <div className="space-y-3">
              {announcementsByType.info.map((announcement) => (
                <Card key={announcement.id} className={`border-l-4 border-l-blue-500 ${getTypeColor(announcement.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(announcement.type)}
                          <h3 className="font-medium text-sm">{announcement.title}</h3>
                          <Badge variant={getBadgeVariant(announcement.type)} className="text-xs">
                            {announcement.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          </div>
                          {announcement.profiles?.email && (
                            <span>By: {announcement.profiles.email}</span>
                          )}
                        </div>
                      </div>
                      {(userRole === 'staff' || userRole === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateAnnouncement(announcement.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredAnnouncements.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements</h3>
              <p className="text-gray-600 text-sm">
                {announcements.length === 0 
                  ? "No announcements have been posted yet."
                  : "No announcements match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBoard;
