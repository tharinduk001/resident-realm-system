
-- Let's check the existing constraint and update it to allow 'Full' status
ALTER TABLE public.rooms 
DROP CONSTRAINT IF EXISTS rooms_status_check;

-- Add the correct constraint that includes 'Full' as a valid status
ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_status_check 
CHECK (status IN ('Vacant', 'Occupied', 'Full', 'Maintenance', 'Out of Order'));

-- Now let's insert the rooms with correct status values
DELETE FROM rooms;

-- Insert Ground floor rooms (15 rooms)
INSERT INTO rooms (room_number, floor, room_type, room_size, max_occupancy, current_occupancy, status, condition) VALUES
('G01', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good'),
('G02', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('G03', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 8, 'Occupied', 'Good'),
('G04', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('G05', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 14, 'Occupied', 'Good'),
('G06', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 10, 'Occupied', 'Good'),
('G07', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('G08', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 5, 'Occupied', 'Good'),
('G09', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 13, 'Occupied', 'Good'),
('G10', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 7, 'Occupied', 'Good'),
('G11', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 11, 'Occupied', 'Good'),
('G12', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('G13', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 9, 'Occupied', 'Good'),
('G14', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 6, 'Occupied', 'Good'),
('G15', 'Ground', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good');

-- Insert 2nd floor rooms (28 rooms) - showing first 14
INSERT INTO rooms (room_number, floor, room_type, room_size, max_occupancy, current_occupancy, status, condition) VALUES
('2F01', '2nd', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good'),
('2F02', '2nd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('2F03', '2nd', 'Multi Occupancy', '120 sq ft', 15, 8, 'Occupied', 'Good'),
('2F04', '2nd', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('2F05', '2nd', 'Multi Occupancy', '120 sq ft', 15, 14, 'Occupied', 'Good'),
('2F06', '2nd', 'Multi Occupancy', '120 sq ft', 15, 10, 'Occupied', 'Good'),
('2F07', '2nd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('2F08', '2nd', 'Multi Occupancy', '120 sq ft', 15, 5, 'Occupied', 'Good'),
('2F09', '2nd', 'Multi Occupancy', '120 sq ft', 15, 13, 'Occupied', 'Good'),
('2F10', '2nd', 'Multi Occupancy', '120 sq ft', 15, 7, 'Occupied', 'Good'),
('2F11', '2nd', 'Multi Occupancy', '120 sq ft', 15, 11, 'Occupied', 'Good'),
('2F12', '2nd', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('2F13', '2nd', 'Multi Occupancy', '120 sq ft', 15, 9, 'Occupied', 'Good'),
('2F14', '2nd', 'Multi Occupancy', '120 sq ft', 15, 6, 'Occupied', 'Good');

-- Insert remaining 2nd floor rooms (15-28)
INSERT INTO rooms (room_number, floor, room_type, room_size, max_occupancy, current_occupancy, status, condition) VALUES
('2F15', '2nd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('2F16', '2nd', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good'),
('2F17', '2nd', 'Multi Occupancy', '120 sq ft', 15, 8, 'Occupied', 'Good'),
('2F18', '2nd', 'Multi Occupancy', '120 sq ft', 15, 14, 'Occupied', 'Good'),
('2F19', '2nd', 'Multi Occupancy', '120 sq ft', 15, 10, 'Occupied', 'Good'),
('2F20', '2nd', 'Multi Occupancy', '120 sq ft', 15, 5, 'Occupied', 'Good'),
('2F21', '2nd', 'Multi Occupancy', '120 sq ft', 15, 13, 'Occupied', 'Good'),
('2F22', '2nd', 'Multi Occupancy', '120 sq ft', 15, 7, 'Occupied', 'Good'),
('2F23', '2nd', 'Multi Occupancy', '120 sq ft', 15, 11, 'Occupied', 'Good'),
('2F24', '2nd', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('2F25', '2nd', 'Multi Occupancy', '120 sq ft', 15, 9, 'Occupied', 'Good'),
('2F26', '2nd', 'Multi Occupancy', '120 sq ft', 15, 6, 'Occupied', 'Good'),
('2F27', '2nd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('2F28', '2nd', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good');

-- Insert 3rd floor rooms (28 rooms) - first half
INSERT INTO rooms (room_number, floor, room_type, room_size, max_occupancy, current_occupancy, status, condition) VALUES
('3F01', '3rd', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good'),
('3F02', '3rd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('3F03', '3rd', 'Multi Occupancy', '120 sq ft', 15, 8, 'Occupied', 'Good'),
('3F04', '3rd', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('3F05', '3rd', 'Multi Occupancy', '120 sq ft', 15, 14, 'Occupied', 'Good'),
('3F06', '3rd', 'Multi Occupancy', '120 sq ft', 15, 10, 'Occupied', 'Good'),
('3F07', '3rd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('3F08', '3rd', 'Multi Occupancy', '120 sq ft', 15, 5, 'Occupied', 'Good'),
('3F09', '3rd', 'Multi Occupancy', '120 sq ft', 15, 13, 'Occupied', 'Good'),
('3F10', '3rd', 'Multi Occupancy', '120 sq ft', 15, 7, 'Occupied', 'Good'),
('3F11', '3rd', 'Multi Occupancy', '120 sq ft', 15, 11, 'Occupied', 'Good'),
('3F12', '3rd', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('3F13', '3rd', 'Multi Occupancy', '120 sq ft', 15, 9, 'Occupied', 'Good'),
('3F14', '3rd', 'Multi Occupancy', '120 sq ft', 15, 6, 'Occupied', 'Good');

-- Insert remaining 3rd floor rooms (15-28)
INSERT INTO rooms (room_number, floor, room_type, room_size, max_occupancy, current_occupancy, status, condition) VALUES
('3F15', '3rd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('3F16', '3rd', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good'),
('3F17', '3rd', 'Multi Occupancy', '120 sq ft', 15, 8, 'Occupied', 'Good'),
('3F18', '3rd', 'Multi Occupancy', '120 sq ft', 15, 14, 'Occupied', 'Good'),
('3F19', '3rd', 'Multi Occupancy', '120 sq ft', 15, 10, 'Occupied', 'Good'),
('3F20', '3rd', 'Multi Occupancy', '120 sq ft', 15, 5, 'Occupied', 'Good'),
('3F21', '3rd', 'Multi Occupancy', '120 sq ft', 15, 13, 'Occupied', 'Good'),
('3F22', '3rd', 'Multi Occupancy', '120 sq ft', 15, 7, 'Occupied', 'Good'),
('3F23', '3rd', 'Multi Occupancy', '120 sq ft', 15, 11, 'Occupied', 'Good'),
('3F24', '3rd', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('3F25', '3rd', 'Multi Occupancy', '120 sq ft', 15, 9, 'Occupied', 'Good'),
('3F26', '3rd', 'Multi Occupancy', '120 sq ft', 15, 6, 'Occupied', 'Good'),
('3F27', '3rd', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('3F28', '3rd', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good');

-- Insert 4th floor rooms (27 rooms)
INSERT INTO rooms (room_number, floor, room_type, room_size, max_occupancy, current_occupancy, status, condition) VALUES
('4F01', '4th', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good'),
('4F02', '4th', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('4F03', '4th', 'Multi Occupancy', '120 sq ft', 15, 8, 'Occupied', 'Good'),
('4F04', '4th', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('4F05', '4th', 'Multi Occupancy', '120 sq ft', 15, 14, 'Occupied', 'Good'),
('4F06', '4th', 'Multi Occupancy', '120 sq ft', 15, 10, 'Occupied', 'Good'),
('4F07', '4th', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('4F08', '4th', 'Multi Occupancy', '120 sq ft', 15, 5, 'Occupied', 'Good'),
('4F09', '4th', 'Multi Occupancy', '120 sq ft', 15, 13, 'Occupied', 'Good'),
('4F10', '4th', 'Multi Occupancy', '120 sq ft', 15, 7, 'Occupied', 'Good'),
('4F11', '4th', 'Multi Occupancy', '120 sq ft', 15, 11, 'Occupied', 'Good'),
('4F12', '4th', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('4F13', '4th', 'Multi Occupancy', '120 sq ft', 15, 9, 'Occupied', 'Good'),
('4F14', '4th', 'Multi Occupancy', '120 sq ft', 15, 6, 'Occupied', 'Good'),
('4F15', '4th', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good'),
('4F16', '4th', 'Multi Occupancy', '120 sq ft', 15, 12, 'Occupied', 'Good'),
('4F17', '4th', 'Multi Occupancy', '120 sq ft', 15, 8, 'Occupied', 'Good'),
('4F18', '4th', 'Multi Occupancy', '120 sq ft', 15, 14, 'Occupied', 'Good'),
('4F19', '4th', 'Multi Occupancy', '120 sq ft', 15, 10, 'Occupied', 'Good'),
('4F20', '4th', 'Multi Occupancy', '120 sq ft', 15, 5, 'Occupied', 'Good'),
('4F21', '4th', 'Multi Occupancy', '120 sq ft', 15, 13, 'Occupied', 'Good'),
('4F22', '4th', 'Multi Occupancy', '120 sq ft', 15, 7, 'Occupied', 'Good'),
('4F23', '4th', 'Multi Occupancy', '120 sq ft', 15, 11, 'Occupied', 'Good'),
('4F24', '4th', 'Multi Occupancy', '120 sq ft', 15, 0, 'Vacant', 'Good'),
('4F25', '4th', 'Multi Occupancy', '120 sq ft', 15, 9, 'Occupied', 'Good'),
('4F26', '4th', 'Multi Occupancy', '120 sq ft', 15, 6, 'Occupied', 'Good'),
('4F27', '4th', 'Multi Occupancy', '120 sq ft', 15, 15, 'Occupied', 'Good');
