
import {
  Barcode,
  FileText,
  FileSpreadsheet,
  FileChartPie,
  FileChartColumn,
  Search,
  Building,
  FileSearch,
  Users,
  UserRound,
  LogOut
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Sidebar = () => {
  const { currentUser, logout, hasPermission } = useUser();
  const navigate = useNavigate();
  
  // Base items available to all users
  const baseMenuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: FileChartPie,
      permission: null
    },
    {
      title: "Barcode Scanner",
      url: "/scanner",
      icon: Barcode,
      permission: "conductAudits"
    },
    {
      title: "Search",
      url: "/search",
      icon: Search,
      permission: null
    }
  ];

  // Admin only items
  const adminMenuItems = [
    {
      title: "User Management",
      url: "/users",
      icon: Users,
      permission: "manageUsers"
    },
    {
      title: "Admin Overview",
      url: "/admin",
      icon: FileSearch,
      permission: "viewAllLocations"
    }
  ];
  
  // Items for auditors and admins
  const operationalMenuItems = [
    {
      title: "Locations",
      url: "/locations",
      icon: Building,
      permission: null
    },
    {
      title: "Upload Data",
      url: "/upload",
      icon: FileText,
      permission: "viewAllLocations"
    }
  ];
  
  // Report items for all users
  const reportMenuItems = [
    {
      title: "Reports",
      url: "/reports",
      icon: FileSpreadsheet,
      permission: "viewReports"
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: FileChartColumn,
      permission: "viewReports"
    }
  ];

  // Filter menu items based on user permissions
  const getFilteredItems = (items) => {
    return items.filter(item => 
      item.permission === null || hasPermission(item.permission)
    );
  };

  const filteredBaseItems = getFilteredItems(baseMenuItems);
  const filteredAdminItems = getFilteredItems(adminMenuItems);
  const filteredOperationalItems = getFilteredItems(operationalMenuItems);
  const filteredReportItems = getFilteredItems(reportMenuItems);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader>
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold text-white">Stock Audit Vision</h2>
          <p className="text-xs text-gray-300">Inventory Management System</p>
        </div>
        <SidebarTrigger className="absolute right-2 top-4 text-white" />
      </SidebarHeader>
      <SidebarContent>
        {currentUser && (
          <div className="mb-6 px-4 py-2">
            <Link to="/profile" className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-gray-100">{currentUser.name}</div>
                <Badge variant="outline" className="mt-1 text-xs bg-transparent text-gray-300 border-gray-600">
                  {currentUser.role}
                </Badge>
              </div>
            </Link>
          </div>
        )}
      
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredBaseItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="font-medium">
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="ml-1">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {filteredOperationalItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredOperationalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="font-medium">
                      <Link to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="ml-1">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredReportItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Reports</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredReportItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="font-medium">
                      <Link to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="ml-1">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="font-medium">
                      <Link to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="ml-1">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-primary/20"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
