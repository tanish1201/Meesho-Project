import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Package, 
  Plus, 
  ImageIcon, 
  History, 
  Settings, 
  ChevronRight,
  Menu,
  BarChart3,
  GitCompare
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: BarChart3,
    description: "Analytics & insights" 
  },
  { 
    title: "Catalog", 
    url: "/catalog", 
    icon: Package,
    description: "Manage your products" 
  },
  { 
    title: "Add Product", 
    url: "/add-product", 
    icon: Plus,
    description: "Add new products" 
  },
  { 
    title: "Image Assistant", 
    url: "/assistant", 
    icon: ImageIcon,
    description: "AI-powered image optimization" 
  },
  { 
    title: "History", 
    url: "/history", 
    icon: History,
    description: "View past analysis" 
  },
  { 
    title: "Compare", 
    url: "/compare", 
    icon: GitCompare,
    description: "Compare product variants" 
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    description: "Configure preferences" 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" 
      : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground transition-colors";

  return (
    <Sidebar
      className={`border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">MSSS</h2>
              <p className="text-xs text-muted-foreground">Seller Support</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider ${collapsed ? 'sr-only' : ''}`}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 px-3">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">
                            {item.title}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">
                            {item.description}
                          </span>
                        </div>
                      )}
                      {!collapsed && isActive(item.url) && (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )}
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