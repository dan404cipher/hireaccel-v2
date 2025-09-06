import { useState } from "react";
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
  TrendingUp
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
  { title: "Dashboard", url: "/dashboard", icon: Home, roles: ['admin', 'hr', 'agent', 'candidate'] },
  { title: "Agent Allocation", url: "/dashboard/agents", icon: UserCheck, roles: ['admin'] },
  { title: "Assignment Management", url: "/dashboard/assignment-management", icon: ClipboardList, roles: ['agent'] },
  { title: "Assignment Tracking", url: "/dashboard/assignment-tracking", icon: TrendingUp, roles: ['admin', 'agent'] },
  { title: "Job Management", url: "/dashboard/jobs", icon: Briefcase, roles: ['admin', 'hr'] },
  { title: "Shared Candidates", url: "/dashboard/shared-candidates", icon: UserPlus, roles: ['admin', 'hr', 'agent'] },
  { title: "Interview Management", url: "/dashboard/interviews", icon: Calendar, roles: ['admin', 'hr'] },
  { title: "Company Management", url: "/dashboard/companies", icon: Building2, roles: ['admin', 'hr'] },
  { title: "User Management", url: "/dashboard/users", icon: Users, roles: ['admin'] },
  
  // Candidate-specific navigation
  { title: "My Applications", url: "/dashboard/candidate-applications", icon: FileText, roles: ['candidate'] },
];

const secondaryItems = [
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: ['admin', 'hr'] },
  { title: "Communications", url: "/dashboard/communications", icon: MessageSquare, roles: ['admin', 'hr', 'agent'] },
  { title: "Reports", url: "/dashboard/reports", icon: ClipboardList, roles: ['admin', 'hr'] },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, roles: ['admin', 'hr', 'agent', 'candidate'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/dashboard/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const baseClasses = "transition-colors duration-200";
    return isActive(path) 
      ? `${baseClasses} bg-primary text-primary-foreground font-medium shadow-sm`
      : `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
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
        <div className={`border-b border-sidebar-border flex items-center px-4 ${collapsed ? 'h-14 justify-center' : 'h-16'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-transparent"></div>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
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
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools & Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedSecondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}