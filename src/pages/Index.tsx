
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Home, Key, AlertTriangle, Calendar, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import Navigation from "@/components/Navigation";
import StudentDashboard from "@/components/StudentDashboard";
import StaffDashboard from "@/components/StaffDashboard";
import RoomManagement from "@/components/RoomManagement";
import RequestSystem from "@/components/RequestSystem";
import AnnouncementBoard from "@/components/AnnouncementBoard";
import Auth from "@/components/Auth";
import StudentRegistration from "@/components/StudentRegistration";
import RegistrationReview from "@/components/RegistrationReview";

const Index = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setCurrentView('login');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      
      // Check if user has a registration
      const { data: registration } = await supabase
        .from('student_registrations')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Determine initial view based on role and registration status
      if (data.role === 'staff' || data.role === 'admin') {
        setCurrentView('staff-dashboard');
      } else if (registration?.status === 'approved') {
        setCurrentView('student-dashboard');
      } else {
        setCurrentView('student-registration');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authUser: User, authSession: Session) => {
    setUser(authUser);
    setSession(authSession);
    fetchUserProfile(authUser.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentView === 'student-registration') {
    return <StudentRegistration user={user} />;
  }

  const isStaffOrAdmin = userProfile?.role === 'staff' || userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        userRole={userProfile?.role || 'student'} 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
        showRegistrationReview={isStaffOrAdmin}
      />
      
      <main className="pt-16">
        {currentView === 'student-dashboard' && <StudentDashboard />}
        {currentView === 'staff-dashboard' && <StaffDashboard />}
        {currentView === 'room-management' && <RoomManagement />}
        {currentView === 'requests' && <RequestSystem userRole={userProfile?.role || 'student'} />}
        {currentView === 'announcements' && <AnnouncementBoard userRole={userProfile?.role || 'student'} />}
        {currentView === 'registration-review' && isStaffOrAdmin && (
          <RegistrationReview user={user} />
        )}
      </main>
    </div>
  );
};

export default Index;
