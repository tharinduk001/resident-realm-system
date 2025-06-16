
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Users, MessageSquare, Calendar, Key, LogOut, FileText } from "lucide-react";

interface NavigationProps {
  userRole: string;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  showRegistrationReview?: boolean;
}

const Navigation = ({ userRole, currentView, setCurrentView, onLogout, showRegistrationReview }: NavigationProps) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    ...(userRole === 'student' ? [
      { id: 'student-dashboard', label: 'Dashboard', icon: Home }
    ] : []),
    ...(userRole === 'staff' || userRole === 'admin' ? [
      { id: 'staff-dashboard', label: 'Dashboard', icon: Home },
      { id: 'room-management', label: 'Room Management', icon: Key },
      ...(showRegistrationReview ? [{ id: 'registration-review', label: 'Registration Review', icon: FileText }] : [])
    ] : []),
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'announcements', label: 'Announcements', icon: Calendar },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">HostelHub</span>
              </div>

              <div className="hidden md:flex items-center space-x-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => handleNavClick(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-600 capitalize">{userRole}</span>
                <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>

              {/* Mobile menu trigger */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    {menuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={currentView === item.id ? "default" : "ghost"}
                        onClick={() => handleNavClick(item.id)}
                        className="flex items-center space-x-2 justify-start"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    ))}
                    
                    <hr className="my-4" />
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 capitalize px-3">Role: {userRole}</p>
                      <Button variant="outline" onClick={onLogout} className="w-full flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
