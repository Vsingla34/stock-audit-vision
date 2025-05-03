
import {
  Barcode,
  FileText,
  FileSpreadsheet,
  FileChartPie,
  FileChartColumn,
  Search,
  Building,
  FileSearch
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
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: FileChartPie
  },
  {
    title: "Barcode Scanner",
    url: "/scanner",
    icon: Barcode
  },
  {
    title: "Search",
    url: "/search",
    icon: Search
  },
  {
    title: "Locations",
    url: "/locations",
    icon: Building
  },
  {
    title: "Admin Overview",
    url: "/admin",
    icon: FileSearch
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileSpreadsheet
  },
  {
    title: "Upload Data",
    url: "/upload",
    icon: FileText
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: FileChartColumn
  }
];

export const Sidebar = () => {
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
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
      </SidebarContent>
    </ShadcnSidebar>
  );
};
