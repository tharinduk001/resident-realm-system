
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Room, Student } from "@/types/room";
import StudentAssignDialog from "./StudentAssignDialog";

interface RoomCardProps {
  room: Room;
  students: Student[];
  selectedStudent: string;
  showAssignDialog: boolean;
  selectedRoomId: string | null;
  onSelectedStudentChange: (value: string) => void;
  onAssignStudent: () => void;
  onDialogOpenChange: (open: boolean) => void;
  onRoomSelect: (room: Room) => void;
}

const RoomCard = ({
  room,
  students,
  selectedStudent,
  showAssignDialog,
  selectedRoomId,
  onSelectedStudentChange,
  onAssignStudent,
  onDialogOpenChange,
  onRoomSelect
}: RoomCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant': return 'secondary';
      case 'Occupied': return 'default';
      case 'Full': return 'destructive';
      case 'Maintenance': return 'destructive';
      default: return 'secondary';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Good': return 'secondary';
      case 'Fair': return 'default';
      case 'Poor': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-blue-50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900">{room.room_number}</CardTitle>
          <Badge variant={getStatusColor(room.status)}>
            {room.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Floor:</span>
            <span className="font-medium">{room.floor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{room.room_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{room.room_size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Occupancy:</span>
            <span className="font-medium">{room.current_occupancy}/{room.max_occupancy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Condition:</span>
            <Badge variant={getConditionColor(room.condition)} className="text-xs">
              {room.condition}
            </Badge>
          </div>
        </div>

        {room.current_occupancy < room.max_occupancy && room.status !== 'Maintenance' && (
          <StudentAssignDialog
            room={room}
            students={students}
            selectedStudent={selectedStudent}
            showAssignDialog={showAssignDialog && selectedRoomId === room.id}
            onSelectedStudentChange={onSelectedStudentChange}
            onAssignStudent={onAssignStudent}
            onDialogOpenChange={onDialogOpenChange}
            onRoomSelect={onRoomSelect}
          />
        )}

        {room.status === 'Full' && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            Room is at maximum capacity
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomCard;
