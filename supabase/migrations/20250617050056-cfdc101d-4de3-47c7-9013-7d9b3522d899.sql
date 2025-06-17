
-- Drop existing conflicting policies and create new comprehensive ones
DROP POLICY IF EXISTS "Users can view their own requests" ON public.requests;
DROP POLICY IF EXISTS "Staff and admin can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.requests;
DROP POLICY IF EXISTS "Staff and admin can update requests" ON public.requests;
DROP POLICY IF EXISTS "Users can update their pending requests" ON public.requests;

DROP POLICY IF EXISTS "Users can view their own registration" ON public.student_registrations;
DROP POLICY IF EXISTS "Staff and admin can view all registrations" ON public.student_registrations;
DROP POLICY IF EXISTS "Users can create their own registration" ON public.student_registrations;
DROP POLICY IF EXISTS "Users can update their own pending registration" ON public.student_registrations;
DROP POLICY IF EXISTS "Staff and admin can update registrations" ON public.student_registrations;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff and admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Everyone can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Staff can manage rooms" ON public.rooms;

DROP POLICY IF EXISTS "Users can view their assignments" ON public.room_assignments;
DROP POLICY IF EXISTS "Staff can manage assignments" ON public.room_assignments;

DROP POLICY IF EXISTS "Everyone can view furniture" ON public.furniture_items;
DROP POLICY IF EXISTS "Staff can manage furniture" ON public.furniture_items;

DROP POLICY IF EXISTS "Everyone can view active announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff can manage announcements" ON public.announcements;

-- Now create all the policies properly
-- Announcements policies
CREATE POLICY "Anyone can view active announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Staff and admin can create announcements" 
  ON public.announcements 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff and admin can update announcements" 
  ON public.announcements 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Requests policies
CREATE POLICY "Users can view their own requests" 
  ON public.requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin can view all requests" 
  ON public.requests 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own requests" 
  ON public.requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff and admin can update requests" 
  ON public.requests 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Rooms policies
CREATE POLICY "Staff and admin can view rooms" 
  ON public.rooms 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff and admin can update rooms" 
  ON public.rooms 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Room assignments policies
CREATE POLICY "Students can view their own room assignments" 
  ON public.room_assignments 
  FOR SELECT 
  USING (auth.uid() = student_id);

CREATE POLICY "Staff and admin can view all room assignments" 
  ON public.room_assignments 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff and admin can manage room assignments" 
  ON public.room_assignments 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff and admin can update room assignments" 
  ON public.room_assignments 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Furniture items policies
CREATE POLICY "Anyone can view furniture items" 
  ON public.furniture_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Staff and admin can manage furniture items" 
  ON public.furniture_items 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Student registrations policies
CREATE POLICY "Users can view their own registration" 
  ON public.student_registrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin can view all registrations" 
  ON public.student_registrations 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own registration" 
  ON public.student_registrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending registration" 
  ON public.student_registrations 
  FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Staff and admin can update registrations" 
  ON public.student_registrations 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Staff and admin can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));
