import React, { useState } from "react";
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Building2, 
  BarChart3, 
  Settings,
  UserCheck,
  ClipboardList,
  MessageSquare,
  Home,
  UserPlus,
  FileText,
  Search,
  PieChart,
  TrendingUp,
  Image
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, roles: ['admin', 'hr', 'agent', 'candidate'], color: "text-blue-600" },
  { title: "Agent Allocation", url: "/dashboard/agents", icon: UserCheck, roles: ['admin'], color: "text-green-600" },
  { title: "Assignment Management", url: "/dashboard/assignment-management", icon: ClipboardList, roles: ['agent'], color: "text-orange-600" },
  { title: "Assignment Tracking", url: "/dashboard/assignment-tracking", icon: TrendingUp, roles: ['admin', 'agent'], color: "text-purple-600" },
  { title: "Job Management", url: "/dashboard/jobs", icon: Briefcase, roles: ['admin', 'hr'], color: "text-indigo-600" },
  { title: "Shared Candidates", url: "/dashboard/shared-candidates", icon: UserPlus, roles: ['admin', 'hr', 'agent'], color: "text-pink-600" },
  { title: "Interview Management", url: "/dashboard/interviews", icon: Calendar, roles: ['admin', 'hr'], color: "text-red-600" },
  { title: "Company Management", url: "/dashboard/companies", icon: Building2, roles: ['admin', 'hr'], color: "text-teal-600" },
  { title: "User Management", url: "/dashboard/users", icon: Users, roles: ['admin'], color: "text-cyan-600" },
  { title: "Post Ads", url: "/dashboard/post-ads", icon: Image, roles: ['admin'], color: "text-yellow-600" },
  
  // Candidate-specific navigation
  { title: "My Applications", url: "/dashboard/candidate-applications", icon: FileText, roles: ['candidate'], color: "text-emerald-600" },
  { title: "My Interviews", url: "/dashboard/candidate-interviews", icon: Calendar, roles: ['candidate'], color: "text-rose-600" },
  { 
    title: "My Profile", 
    url: (user) => `/dashboard/candidate-profile/${user?.customId}`, 
    icon: Users, 
    roles: ['candidate'],
    color: "text-violet-600"
  },
];

const secondaryItems = [
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: ['admin'], color: "text-slate-600" },
  { title: "Communications", url: "/dashboard/communications", icon: MessageSquare, roles: ['admin', 'agent'], color: "text-lime-600" },
  { title: "Reports", url: "/dashboard/reports", icon: ClipboardList, roles: ['admin'], color: "text-amber-600" },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, roles: ['admin', 'agent'], color: "text-gray-600" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  // Add gradient animation styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradient-x {
        0%, 100% {
          background-size: 200% 200%;
          background-position: left center;
        }
        50% {
          background-size: 200% 200%;
          background-position: right center;
        }
      }
      .animate-gradient-x {
        background: linear-gradient(-45deg, #2563eb, #7c3aed, #2563eb, #7c3aed);
        background-size: 400% 400%;
        animation: gradient-x 3s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/dashboard/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const baseClasses = "transition-all duration-300 ease-in-out rounded-lg";
    const isActivePath = isActive(path);
    return isActivePath 
      ? `${baseClasses} bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:!text-white animate-gradient-x`
      : `${baseClasses} hover:bg-gray-100 hover:text-gray-700`;
  };

  // Filter navigation items based on user role
  const allowedNavigationItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const allowedSecondaryItems = secondaryItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  // Get role display name for the portal label
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin Portal';
      case 'hr': return 'HR Portal';
      case 'agent': return 'Agent Portal';
      case 'candidate': return 'Candidate Portal';
      default: return 'Portal';
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo/Brand Section */}
        <div className={`border-b border-sidebar-border flex items-center ${collapsed ? 'h-13 justify-center' : 'h-16 px-4'}`}>
          <div className="flex items-center gap-3">
            <img 
              src="/app-logo.png" 
              alt="HireAccel Logo" 
              className={`${collapsed ? 'w-16 h-16 py-1.5' : 'w-10 h-10'} `}
            />
            {!collapsed && (
              <div>
                <h1 className="font-bold text-sidebar-foreground text-lg">Hire Accel</h1>
                <p className="text-xs text-sidebar-foreground/60 font-medium">powered by v-accel</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={typeof item.url === 'function' ? item.url(user) : item.url} 
                      className={getNavCls(typeof item.url === 'function' ? item.url(user) : item.url)}
                    >
                      <item.icon className={`w-4 h-4 ${isActive(typeof item.url === 'function' ? item.url(user) : item.url) ? 'text-white' : item.color}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation - Only show for admin and agent */}
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <SidebarGroup>
            <SidebarGroupLabel>Tools & Reports</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {allowedSecondaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls(item.url)}>
                        <item.icon className={`w-4 h-4 ${isActive(item.url) ? 'text-white' : item.color}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}