
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  searchTerm: string;
  floorFilter: string;
  statusFilter: string;
  filteredRoomsCount: number;
  totalRoomsCount: number;
  onSearchTermChange: (value: string) => void;
  onFloorFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

const SearchFilters = ({
  searchTerm,
  floorFilter,
  statusFilter,
  filteredRoomsCount,
  totalRoomsCount,
  onSearchTermChange,
  onFloorFilterChange,
  onStatusFilterChange
}: SearchFiltersProps) => {
  return (
    <Card className="mb-8 border-blue-200 shadow-lg">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-blue-900">Search & Filter Rooms</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by room number or floor..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-500"
            />
          </div>

          <Select value={floorFilter} onValueChange={onFloorFilterChange}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500">
              <SelectValue placeholder="Filter by floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              <SelectItem value="Ground">Ground Floor</SelectItem>
              <SelectItem value="2nd">2nd Floor</SelectItem>
              <SelectItem value="3rd">3rd Floor</SelectItem>
              <SelectItem value="4th">4th Floor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Vacant">Vacant</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Full">Full</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredRoomsCount} of {totalRoomsCount} rooms
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
