
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { Upload, FileText, CheckCircle, Clock, XCircle } from "lucide-react";

interface StudentRegistrationProps {
  user: User;
}

const StudentRegistration = ({ user }: StudentRegistrationProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    phone: '',
    telephone: '',
    id_number: '',
    additional_reports: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingRegistration, setExistingRegistration] = useState<any>(null);

  useEffect(() => {
    checkExistingRegistration();
  }, [user]);

  const checkExistingRegistration = async () => {
    const { data, error } = await supabase
      .from('student_registrations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setExistingRegistration(data);
      setFormData({
        full_name: data.full_name || '',
        age: data.age?.toString() || '',
        phone: data.phone || '',
        telephone: data.telephone || '',
        id_number: data.id_number || '',
        additional_reports: data.additional_reports || ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return null;

    const fileExt = photo.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('student-photos')
      .upload(fileName, photo);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('student-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let photoUrl = existingRegistration?.photo_url;
      
      if (photo) {
        photoUrl = await uploadPhoto();
      }

      const registrationData = {
        user_id: user.id,
        full_name: formData.full_name,
        age: parseInt(formData.age),
        phone: formData.phone,
        telephone: formData.telephone,
        id_number: formData.id_number,
        photo_url: photoUrl,
        additional_reports: formData.additional_reports,
        status: 'pending'
      };

      if (existingRegistration && existingRegistration.status === 'pending') {
        // Update existing registration
        const { error } = await supabase
          .from('student_registrations')
          .update(registrationData)
          .eq('id', existingRegistration.id);

        if (error) throw error;
        setSuccess('Registration updated successfully! Awaiting review.');
      } else {
        // Create new registration
        const { error } = await supabase
          .from('student_registrations')
          .insert([registrationData]);

        if (error) throw error;
        setSuccess('Registration submitted successfully! Awaiting review.');
      }

      checkExistingRegistration();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
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

  if (existingRegistration && existingRegistration.status === 'approved') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Registration Approved!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <p className="text-lg">Welcome to HostelHub! Your registration has been approved.</p>
            <p className="text-gray-600">You now have full access to the hostel management system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            Student Registration
            {existingRegistration && (
              <Badge variant={getStatusColor(existingRegistration.status)} className="flex items-center space-x-1">
                {getStatusIcon(existingRegistration.status)}
                <span className="capitalize">{existingRegistration.status}</span>
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {existingRegistration?.status === 'rejected' && existingRegistration.review_notes && (
            <Alert>
              <AlertDescription>
                <strong>Review Notes:</strong> {existingRegistration.review_notes}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  disabled={existingRegistration?.status === 'approved'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="16"
                  max="50"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  disabled={existingRegistration?.status === 'approved'}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={existingRegistration?.status === 'approved'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone (Optional)</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  disabled={existingRegistration?.status === 'approved'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">ID Number *</Label>
              <Input
                id="id_number"
                name="id_number"
                value={formData.id_number}
                onChange={handleInputChange}
                required
                disabled={existingRegistration?.status === 'approved'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={existingRegistration?.status === 'approved'}
                />
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
              {existingRegistration?.photo_url && (
                <img 
                  src={existingRegistration.photo_url} 
                  alt="Student photo" 
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_reports">Additional Reports (Optional)</Label>
              <Textarea
                id="additional_reports"
                name="additional_reports"
                value={formData.additional_reports}
                onChange={handleInputChange}
                placeholder="Any additional information or reports..."
                className="min-h-[100px]"
                disabled={existingRegistration?.status === 'approved'}
              />
            </div>

            {(!existingRegistration || existingRegistration.status === 'pending' || existingRegistration.status === 'rejected') && (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : (existingRegistration ? 'Update Registration' : 'Submit Registration')}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegistration;
