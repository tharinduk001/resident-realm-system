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
      console.log('Fetching announcements...');
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Announcements data:', announcementsData);
      console.log('Announcements error:', announcementsError);

      if (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
        toast({
          title: "Error",
          description: `Failed to load announcements: ${announcementsError.message}`,
          variant: "destructive"
        });
        return;
      }

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
      console.log('Creating announcement...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "Authentication required to create announcement",
          variant: "destructive"
        });
        return;
      }

      const announcementData = {
        title: newAnnouncement.title.trim(),
        message: newAnnouncement.message.trim(),
        type: newAnnouncement.type,
        created_by: user.id,
        is_active: true
      };

      console.log('Inserting announcement:', announcementData);

      const { data, error } = await supabase
        .from('announcements')
        .insert(announcementData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Error creating announcement:', error);
        toast({
          title: "Error",
          description: `Failed to create announcement: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });

      setNewAnnouncement({ title: '', message: '', type: 'info' });
      setShowNewAnnouncementDialog(false);
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Unexpected error creating announcement:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the announcement",
        variant: "destructive"
      });
    }
  };

  const handleDeactivateAnnouncement = async (announcementId: string) => {
    try {
      console.log('Deactivating announcement:', announcementId);
      
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', announcementId);

      console.log('Deactivation error:', error);

      if (error) {
        console.error('Error deactivating announcement:', error);
        toast({
          title: "Error",
          description: `Failed to remove announcement: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Announcement removed successfully!",
      });

      fetchAnnouncements();
    } catch (error: any) {
      console.error('Unexpected error deactivating announcement:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing the announcement",
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Announcements
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Stay updated with important hostel information
          </p>
        </div>

        {/* Action Button */}
        {(userRole === 'staff' || userRole === 'admin') && (
          <div className="flex justify-center mb-8">
            <Dialog open={showNewAnnouncementDialog} onOpenChange={setShowNewAnnouncementDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl px-8 py-3">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">Create Announcement</DialogTitle>
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
                  />

                  <Button onClick={handleCreateAnnouncement} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Create Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Search and Filter */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 border-gray-200 focus:border-purple-400 focus:ring-purple-400">
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
          </CardContent>
        </Card>

        {/* Categorized Announcements */}
        <div className="space-y-8">
          {/* Urgent Announcements */}
          {announcementsByType.urgent.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-600">Urgent Announcements</h2>
                  <p className="text-red-500 text-sm">{announcementsByType.urgent.length} urgent items</p>
                </div>
              </div>
              <div className="grid gap-4">
                {announcementsByType.urgent.map((announcement) => (
                  <Card key={announcement.id} className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getTypeIcon(announcement.type)}
                            <h3 className="font-bold text-lg text-red-800">{announcement.title}</h3>
                            <Badge variant={getBadgeVariant(announcement.type)} className="text-xs font-semibold">
                              {announcement.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-red-700 mb-3 leading-relaxed">{announcement.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-red-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
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
                            onClick={() => handleDeactivateAnnouncement(announcement.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-100"
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
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-orange-600">Warnings</h2>
                  <p className="text-orange-500 text-sm">{announcementsByType.warning.length} warning items</p>
                </div>
              </div>
              <div className="grid gap-4">
                {announcementsByType.warning.map((announcement) => (
                  <Card key={announcement.id} className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getTypeIcon(announcement.type)}
                            <h3 className="font-bold text-lg text-orange-800">{announcement.title}</h3>
                            <Badge variant={getBadgeVariant(announcement.type)} className="text-xs font-semibold">
                              {announcement.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-orange-700 mb-3 leading-relaxed">{announcement.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-orange-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
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
                            onClick={() => handleDeactivateAnnouncement(announcement.id)}
                            className="text-orange-400 hover:text-orange-600 hover:bg-orange-100"
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
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-600">Information</h2>
                  <p className="text-blue-500 text-sm">{announcementsByType.info.length} information items</p>
                </div>
              </div>
              <div className="grid gap-4">
                {announcementsByType.info.map((announcement) => (
                  <Card key={announcement.id} className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getTypeIcon(announcement.type)}
                            <h3 className="font-bold text-lg text-blue-800">{announcement.title}</h3>
                            <Badge variant={getBadgeVariant(announcement.type)} className="text-xs font-semibold">
                              {announcement.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-blue-700 mb-3 leading-relaxed">{announcement.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-blue-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
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
                            onClick={() => handleDeactivateAnnouncement(announcement.id)}
                            className="text-blue-400 hover:text-blue-600 hover:bg-blue-100"
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
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">No Announcements</h3>
                <p className="text-gray-500 text-lg">
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
    </div>
  );
};

export default AnnouncementBoard;
