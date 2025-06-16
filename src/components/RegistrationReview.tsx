
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { CheckCircle, XCircle, Clock, User as UserIcon, Phone, FileText } from "lucide-react";

interface RegistrationReviewProps {
  user: User;
}

const RegistrationReview = ({ user }: RegistrationReviewProps) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('student_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (registrationId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('student_registrations')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', registrationId);

      if (error) throw error;

      // Update user role to student if approved
      if (status === 'approved') {
        const registration = registrations.find(r => r.id === registrationId);
        if (registration) {
          await supabase
            .from('profiles')
            .update({ role: 'student' })
            .eq('id', registration.user_id);
        }
      }

      setSelectedRegistration(null);
      setReviewNotes('');
      fetchRegistrations();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Review</h1>
        <p className="text-gray-600">Review and approve student registrations</p>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {registrations.map((registration) => (
          <Card key={registration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>{registration.full_name}</span>
                </CardTitle>
                <Badge variant={getStatusColor(registration.status)} className="flex items-center space-x-1">
                  {getStatusIcon(registration.status)}
                  <span className="capitalize">{registration.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium">{registration.age} years</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{registration.phone}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="font-medium">{registration.id_number}</p>
                </div>
                {registration.telephone && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Telephone</p>
                    <p className="font-medium">{registration.telephone}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="font-medium">{new Date(registration.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {registration.photo_url && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Photo</p>
                  <img 
                    src={registration.photo_url} 
                    alt="Student photo" 
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
              )}

              {registration.additional_reports && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Additional Reports</p>
                  <p className="bg-gray-50 p-3 rounded text-sm">{registration.additional_reports}</p>
                </div>
              )}

              {registration.review_notes && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Review Notes</p>
                  <p className="bg-blue-50 p-3 rounded text-sm">{registration.review_notes}</p>
                </div>
              )}

              {registration.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedRegistration(registration)}
                    variant="outline"
                    size="sm"
                  >
                    Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Review Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="review_notes">Review Notes</Label>
                <Textarea
                  id="review_notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleReview(selectedRegistration.id, 'approved')}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleReview(selectedRegistration.id, 'rejected')}
                  disabled={actionLoading}
                  variant="destructive"
                  className="flex-1"
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </Button>
              </div>
              
              <Button
                onClick={() => setSelectedRegistration(null)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RegistrationReview;
