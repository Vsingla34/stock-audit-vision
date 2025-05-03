
import { useUser } from "@/context/UserContext";
import { useInventory } from "@/context/InventoryContext";

export const useUserAccess = () => {
  const { currentUser, hasPermission } = useUser();
  const { locations } = useInventory();
  
  // Get locations accessible to the current user
  const accessibleLocations = () => {
    if (!currentUser) return [];
    
    // Admins can access all locations
    if (currentUser.role === "admin") {
      return locations;
    }
    
    // For auditors and clients, filter by assigned locations
    if (currentUser.assignedLocations?.length) {
      return locations.filter(location => 
        currentUser.assignedLocations?.includes(location.id)
      );
    }
    
    return [];
  };
  
  // Check if user has access to a specific location
  const canAccessLocation = (locationId: string): boolean => {
    if (!currentUser) return false;
    
    // Admins can access all locations
    if (currentUser.role === "admin") return true;
    
    // Otherwise check if location is in assigned locations
    return currentUser.assignedLocations?.includes(locationId) || false;
  };
  
  // Check if user can perform physical audits
  const canPerformAudits = (): boolean => {
    if (!currentUser) return false;
    return ["admin", "auditor"].includes(currentUser.role);
  };
  
  // Check if user can upload data
  const canUploadData = (): boolean => {
    if (!currentUser) return false;
    
    // Only admins can upload item master data
    if (currentUser.role === "admin") return true;
    
    // Auditors can upload closing stock for their assigned locations
    if (currentUser.role === "auditor") return true;
    
    return false;
  };
  
  // Check if user can upload item master data (admin only)
  const canUploadItemMaster = (): boolean => {
    if (!currentUser) return false;
    return currentUser.role === "admin";
  };
  
  // Check if user can upload closing stock (admin and auditor only)
  const canUploadClosingStock = (): boolean => {
    if (!currentUser) return false;
    return ["admin", "auditor"].includes(currentUser.role);
  };
  
  // Check if user can view reports
  const canViewReports = (): boolean => {
    if (!currentUser) return false;
    return true; // All authenticated users can view reports
  };
  
  // Check if user is client (view-only)
  const isClientUser = (): boolean => {
    if (!currentUser) return false;
    return currentUser.role === "client";
  };
  
  // Get user role display name
  const userRoleDisplay = (): string => {
    if (!currentUser) return "";
    
    switch (currentUser.role) {
      case "admin": return "Administrator";
      case "auditor": return "Inventory Auditor";
      case "client": return "Client User";
      default: return currentUser.role;
    }
  };

  return {
    accessibleLocations,
    canAccessLocation,
    canPerformAudits,
    canUploadData,
    canUploadItemMaster,
    canUploadClosingStock,
    canViewReports,
    isClientUser,
    userRoleDisplay,
    hasPermission,
    userRole: currentUser?.role,
  };
};
