
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Room, Student } from "@/types/room";

interface StudentAssignDialogProps {
  room: Room;
  students: Student[];
  selectedStudent: string;
  showAssignDialog: boolean;
  onSelectedStudentChange: (value: string) => void;
  onAssignStudent: () => void;
  onDialogOpenChange: (open: boolean) => void;
  onRoomSelect: (room: Room) => void;
}

const StudentAssignDialog = ({
  room,
  students,
  selectedStudent,
  showAssignDialog,
  onSelectedStudentChange,
  onAssignStudent,
  onDialogOpenChange,
  onRoomSelect
}: StudentAssignDialogProps) => {
  return (
    <Dialog 
      open={showAssignDialog} 
      onOpenChange={(open) => {
        onDialogOpenChange(open);
        if (!open) {
          onSelectedStudentChange('');
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          onClick={() => onRoomSelect(room)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-blue-900">
            Assign Student to Room {room.room_number}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="text-sm text-gray-600">
            Current occupancy: {room.current_occupancy}/{room.max_occupancy}
          </div>

          <Select value={selectedStudent} onValueChange={onSelectedStudentChange}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.user_id}>
                  {student.full_name} - {student.id_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onDialogOpenChange(false);
                onSelectedStudentChange('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={onAssignStudent}
            >
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAssignDialog;
