import { Search, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, User } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useState } from "react";

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClick = () => {
    if (user?.role === 'candidate') {
      // Use customId from user object
      if (user.customId) {
        navigate(`/dashboard/candidate-profile/${user.customId}`);
      } else {
        // Fallback to base route if customId is not available
        navigate('/dashboard/candidate-profile');
      }
    } else if (user?.role === 'hr') {
      // Navigate to HR profile route, it will auto-update with customId
      navigate('/dashboard/hr-profile');
    } else if (user?.role === 'admin') {
      navigate('/dashboard/admin-profile');
    } else {
      navigate('/dashboard/profile');
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'hr': return 'HR Manager';
      case 'agent': return 'Agent';
      case 'candidate': return 'Candidate';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600 text-white';
      case 'hr': return 'bg-blue-600 text-white';
      case 'agent': return 'bg-purple-600 text-white';
      case 'candidate': return 'bg-emerald-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getUserInitials = (user: User | null) => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search jobs, candidates, companies..." 
            className="pl-10 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell 
          onClick={() => setNotificationCenterOpen(true)}
          className="relative"
        />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${getRoleColor(user?.role || 'default')}`}>
                {getUserInitials(user)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user ? getRoleDisplayName(user.role) : 'Role'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
            {(user?.role === 'admin' || user?.role === 'agent') && (
              <>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        open={notificationCenterOpen}
        onOpenChange={setNotificationCenterOpen}
      />
    </header>
  );
}