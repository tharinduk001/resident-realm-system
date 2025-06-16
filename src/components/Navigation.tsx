
import { Button } from "@/components/ui/button";
import { Home, Users, Key, MessageSquare, AlertTriangle, Calendar, LogOut } from "lucide-react";

interface NavigationProps {
  userRole: string;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
}

const Navigation = ({ userRole, currentView, setCurrentView, onLogout }: NavigationProps) => {
  const studentMenuItems = [
    { id: 'student-dashboard', label: 'Dashboard', icon: Home },
    { id: 'requests', label: 'My Requests', icon: AlertTriangle },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
  ];

  const staffMenuItems = [
    { id: 'staff-dashboard', label: 'Dashboard', icon: Home },
    { id: 'room-management', label: 'Room Management', icon: Key },
    { id: 'requests', label: 'All Requests', icon: AlertTriangle },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
  ];

  const menuItems = userRole === 'student' ? studentMenuItems : staffMenuItems;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HostelHub</span>
            </div>
            
            <div className="flex space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => setCurrentView(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {userRole === 'student' ? 'Student' : 'Staff'} Portal
            </div>
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
