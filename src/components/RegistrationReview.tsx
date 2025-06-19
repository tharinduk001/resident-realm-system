
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Search, Filter, Users, FileText, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';

interface RegistrationReviewProps {
  user: User;
}

const RegistrationReview = ({ user }: RegistrationReviewProps) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('student_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRegistrations(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(reg => reg.status === 'pending').length || 0;
      const approved = data?.filter(reg => reg.status === 'approved').length || 0;
      const rejected = data?.filter(reg => reg.status === 'rejected').length || 0;
      
      setStats({ total, pending, approved, rejected });
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm)
      );
    }

    setFilteredRegistrations(filtered);
  };

  const handleReviewSubmit = async () => {
    if (!selectedRegistration || !reviewStatus) {
      toast({
        title: "Error",
        description: "Please select a status for the review",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('student_registrations')
        .update({
          status: reviewStatus as 'approved' | 'rejected',
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', selectedRegistration.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Registration ${reviewStatus} successfully!`,
      });

      setShowReviewDialog(false);
      setSelectedRegistration(null);
      setReviewNotes('');
      setReviewStatus('');
      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Registration Review
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Review and manage student registration applications
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Applications</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending Review</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Approved</p>
                  <p className="text-3xl font-bold">{stats.approved}</p>
                </div>
                <UserCheck className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Rejected</p>
                  <p className="text-3xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, ID number, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-gray-200 focus:border-purple-400 focus:ring-purple-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Registration Table */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-6 h-6 mr-2" />
              Student Registrations ({filteredRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">ID Number</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Age</TableHead>
                    <TableHead className="font-semibold">Academic Year</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id} className="hover:bg-purple-50">
                      <TableCell className="font-medium">{registration.full_name}</TableCell>
                      <TableCell>{registration.id_number}</TableCell>
                      <TableCell>{registration.phone}</TableCell>
                      <TableCell>{registration.age}</TableCell>
                      <TableCell>{registration.academic_year || 1}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>{new Date(registration.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setReviewNotes(registration.review_notes || '');
                            setReviewStatus(registration.status || '');
                            setShowReviewDialog(true);
                          }}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No registrations found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Review Registration - {selectedRegistration?.full_name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedRegistration && (
              <div className="space-y-6 pt-4">
                {/* Student Information */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm mt-1 font-semibold">{selectedRegistration.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID Number</Label>
                    <p className="text-sm mt-1 font-semibold">{selectedRegistration.id_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm mt-1 font-semibold">{selectedRegistration.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Age</Label>
                    <p className="text-sm mt-1 font-semibold">{selectedRegistration.age}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                    <p className="text-sm mt-1 font-semibold">{selectedRegistration.academic_year || 1}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Graduation Status</Label>
                    <p className="text-sm mt-1 font-semibold capitalize">{selectedRegistration.graduation_status || 'active'}</p>
                  </div>
                </div>

                {selectedRegistration.telephone && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">Telephone</Label>
                    <p className="text-sm mt-1 font-semibold">{selectedRegistration.telephone}</p>
                  </div>
                )}

                {selectedRegistration.additional_reports && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">Additional Reports</Label>
                    <p className="text-sm mt-1 bg-white p-3 rounded border">{selectedRegistration.additional_reports}</p>
                  </div>
                )}

                {/* Review Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Review Decision</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Review Status</Label>
                      <Select value={reviewStatus} onValueChange={setReviewStatus}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                          <SelectItem value="pending">Keep Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Review Notes</Label>
                      <Textarea
                        placeholder="Add notes about your review decision..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {selectedRegistration.review_notes && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Previous Review Notes</Label>
                        <p className="text-sm mt-1 bg-white p-3 rounded border">{selectedRegistration.review_notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleReviewSubmit} 
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Submit Review
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReviewDialog(false)}
                    className="flex-1 border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RegistrationReview;
