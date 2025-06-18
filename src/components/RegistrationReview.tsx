
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
import { CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Review</h1>
        <p className="text-gray-600">Review and manage student registration applications</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, ID number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
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
      <Card>
        <CardHeader>
          <CardTitle>Student Registrations ({filteredRegistrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
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
            <div className="text-center py-8">
              <p className="text-gray-500">No registrations found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Registration - {selectedRegistration?.full_name}</DialogTitle>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-6 pt-4">
              {/* Student Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="text-sm mt-1">{selectedRegistration.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">ID Number</Label>
                  <p className="text-sm mt-1">{selectedRegistration.id_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-sm mt-1">{selectedRegistration.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Age</Label>
                  <p className="text-sm mt-1">{selectedRegistration.age}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                  <p className="text-sm mt-1">{selectedRegistration.academic_year || 1}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Graduation Status</Label>
                  <p className="text-sm mt-1 capitalize">{selectedRegistration.graduation_status || 'active'}</p>
                </div>
              </div>

              {selectedRegistration.telephone && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Telephone</Label>
                  <p className="text-sm mt-1">{selectedRegistration.telephone}</p>
                </div>
              )}

              {selectedRegistration.additional_reports && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Additional Reports</Label>
                  <p className="text-sm mt-1 bg-gray-50 p-3 rounded">{selectedRegistration.additional_reports}</p>
                </div>
              )}

              {/* Review Section */}
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Review Status</Label>
                    <Select value={reviewStatus} onValueChange={setReviewStatus}>
                      <SelectTrigger>
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
                    <Label>Review Notes</Label>
                    <Textarea
                      placeholder="Add notes about your review decision..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {selectedRegistration.review_notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Previous Review Notes</Label>
                      <p className="text-sm mt-1 bg-gray-50 p-3 rounded">{selectedRegistration.review_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleReviewSubmit} className="flex-1">
                  Submit Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationReview;
