
-- Create tables for rooms management
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  floor TEXT NOT NULL,
  room_type TEXT DEFAULT 'Single Occupancy',
  room_size TEXT DEFAULT '120 sq ft',
  status TEXT DEFAULT 'Vacant' CHECK (status IN ('Occupied', 'Vacant', 'Maintenance')),
  condition TEXT DEFAULT 'Good' CHECK (condition IN ('Good', 'Fair', 'Poor', 'Under Repair')),
  last_inspection DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for room assignments
CREATE TABLE public.room_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vacated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for furniture items
CREATE TABLE public.furniture_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  condition TEXT DEFAULT 'Good' CHECK (condition IN ('Good', 'Fair', 'Poor', 'Needs Repair')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for requests
CREATE TABLE public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Maintenance', 'Temporary Room', 'Room Change', 'Key Handover', 'Other')),
  description TEXT NOT NULL,
  room_number TEXT,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Approved', 'Completed', 'Rejected')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent')),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample rooms
INSERT INTO public.rooms (room_number, floor, room_type, room_size, status, condition) VALUES
('G-001', 'Ground', 'Single Occupancy', '120 sq ft', 'Occupied', 'Good'),
('G-002', 'Ground', 'Single Occupancy', '120 sq ft', 'Vacant', 'Good'),
('B-201', '2nd', 'Single Occupancy', '120 sq ft', 'Occupied', 'Fair'),
('B-202', '2nd', 'Single Occupancy', '120 sq ft', 'Occupied', 'Good'),
('C-301', '3rd', 'Single Occupancy', '120 sq ft', 'Occupied', 'Poor'),
('D-401', '4th', 'Single Occupancy', '120 sq ft', 'Maintenance', 'Under Repair');

-- Insert sample furniture for B-201
INSERT INTO public.furniture_items (room_id, item_name, condition) 
SELECT r.id, unnest(ARRAY['Bed', 'Mattress', 'Desk', 'Chair']), 
       unnest(ARRAY['Good', 'Good', 'Good', 'Needs Repair'])
FROM public.rooms r WHERE r.room_number = 'B-201';

-- Insert sample announcements
INSERT INTO public.announcements (title, message, type, created_by) VALUES
('Power Outage', 'Scheduled maintenance on Floor 2 from 2-4 PM', 'warning', (SELECT id FROM auth.users LIMIT 1)),
('Water Supply', 'Water will be available 24/7 starting tomorrow', 'info', (SELECT id FROM auth.users LIMIT 1)),
('Room Inspection', 'Monthly room inspection scheduled for next week', 'info', (SELECT id FROM auth.users LIMIT 1));

-- Enable RLS on all new tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furniture_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Everyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Staff can manage rooms" ON public.rooms FOR ALL USING (
  public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for room_assignments
CREATE POLICY "Users can view their assignments" ON public.room_assignments 
FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can manage assignments" ON public.room_assignments FOR ALL USING (
  public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for furniture_items
CREATE POLICY "Everyone can view furniture" ON public.furniture_items FOR SELECT USING (true);
CREATE POLICY "Staff can manage furniture" ON public.furniture_items FOR ALL USING (
  public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for requests
CREATE POLICY "Users can view their own requests" ON public.requests 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON public.requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending requests" ON public.requests 
FOR UPDATE USING (auth.uid() = user_id AND status = 'Pending');

CREATE POLICY "Staff can view all requests" ON public.requests 
FOR SELECT USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update requests" ON public.requests 
FOR UPDATE USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for announcements
CREATE POLICY "Everyone can view active announcements" ON public.announcements 
FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage announcements" ON public.announcements FOR ALL USING (
  public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin')
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_furniture_items_updated_at
  BEFORE UPDATE ON public.furniture_items
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Sample room assignment for demo user (this will need to be updated with actual user IDs)
-- This is just for demonstration - in real usage, assignments would be created through the admin interface
