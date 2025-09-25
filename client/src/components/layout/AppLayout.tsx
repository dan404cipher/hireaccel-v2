import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-sidebar">
        <AppSidebar />
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto transition-all duration-300 ease-in-out">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}