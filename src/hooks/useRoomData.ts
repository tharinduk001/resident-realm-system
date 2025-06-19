
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Room, Student } from "@/types/room";

export const useRoomData = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (roomsError) throw roomsError;

      // Fetch approved students who don't have active room assignments
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_registrations')
        .select('id, full_name, id_number, user_id')
        .eq('status', 'approved')
        .eq('graduation_status', 'active');

      if (studentsError) throw studentsError;

      // Filter out students who already have active room assignments
      const { data: assignmentsData } = await supabase
        .from('room_assignments')
        .select('student_id')
        .eq('is_active', true);

      const assignedStudentIds = assignmentsData?.map(a => a.student_id) || [];
      const unassignedStudents = studentsData?.filter(s => !assignedStudentIds.includes(s.user_id)) || [];

      setRooms(roomsData || []);
      setStudents(unassignedStudents || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load room data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    rooms,
    students,
    loading,
    fetchData
  };
};
