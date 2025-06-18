
-- Clear dummy data from requests table
DELETE FROM public.requests WHERE description LIKE '%test%' OR description LIKE '%dummy%' OR description LIKE '%sample%';

-- Clear dummy data from announcements table  
DELETE FROM public.announcements WHERE title LIKE '%test%' OR title LIKE '%dummy%' OR title LIKE '%sample%';

-- Add academic_year column to student_registrations for year progression tracking
ALTER TABLE public.student_registrations 
ADD COLUMN IF NOT EXISTS academic_year INTEGER DEFAULT 1;

-- Add graduation_status to track student progression
ALTER TABLE public.student_registrations 
ADD COLUMN IF NOT EXISTS graduation_status TEXT DEFAULT 'active' CHECK (graduation_status IN ('active', 'passed_out', 'graduated'));

-- Update rooms table to support multiple occupancy (up to 15 students)
ALTER TABLE public.rooms 
ALTER COLUMN room_type SET DEFAULT 'Multi Occupancy';

-- Add max_occupancy column to rooms
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS max_occupancy INTEGER DEFAULT 15;

-- Add current_occupancy column to rooms  
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0;

-- Update condition column to include maintenance options
ALTER TABLE public.rooms 
DROP CONSTRAINT IF EXISTS rooms_condition_check;

ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_condition_check 
CHECK (condition IN ('Good', 'Fair', 'Poor', 'Maintenance', 'Under Repair'));

-- Create a function to update room occupancy when assignments change
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    -- Update occupancy count for the room
    UPDATE public.rooms 
    SET current_occupancy = (
        SELECT COUNT(*) 
        FROM public.room_assignments 
        WHERE room_id = COALESCE(NEW.room_id, OLD.room_id) 
        AND is_active = true
    )
    WHERE id = COALESCE(NEW.room_id, OLD.room_id);
    
    -- Update room status based on occupancy
    UPDATE public.rooms 
    SET status = CASE 
        WHEN current_occupancy = 0 THEN 'Vacant'
        WHEN current_occupancy >= max_occupancy THEN 'Full'
        ELSE 'Occupied'
    END
    WHERE id = COALESCE(NEW.room_id, OLD.room_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room occupancy updates
DROP TRIGGER IF EXISTS trigger_update_room_occupancy ON public.room_assignments;
CREATE TRIGGER trigger_update_room_occupancy
    AFTER INSERT OR UPDATE OR DELETE ON public.room_assignments
    FOR EACH ROW EXECUTE FUNCTION update_room_occupancy();

-- Initialize current occupancy for existing rooms
UPDATE public.rooms 
SET current_occupancy = (
    SELECT COUNT(*) 
    FROM public.room_assignments ra 
    WHERE ra.room_id = rooms.id 
    AND ra.is_active = true
);

-- Update room status based on current occupancy
UPDATE public.rooms 
SET status = CASE 
    WHEN current_occupancy = 0 THEN 'Vacant'
    WHEN current_occupancy >= max_occupancy THEN 'Full'
    ELSE 'Occupied'
END;
