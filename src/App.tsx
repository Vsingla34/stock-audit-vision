
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { InventoryProvider } from "@/context/InventoryContext";
import { UserProvider, useUser } from "@/context/UserContext";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import LocationManagement from "./pages/LocationManagement";
import AdminOverview from "./pages/AdminOverview";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Questionnaire from "./pages/Questionnaire";
import { useUserAccess } from "./hooks/useUserAccess";

const queryClient = new QueryClient();

// Protected route wrapper component
const ProtectedRoute = ({ children, requiredPermission = null }: { children: React.ReactNode, requiredPermission?: string | null }) => {
  const { isAuthenticated } = useUser();
  const { hasPermission } = useUserAccess();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <InventoryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/scanner" element={<ProtectedRoute requiredPermission="conductAudits"><Scanner /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute requiredPermission="viewReports"><Reports /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute requiredPermission="viewReports"><Analytics /></ProtectedRoute>} />
              <Route path="/locations" element={<ProtectedRoute><LocationManagement /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredPermission="viewAllLocations"><AdminOverview /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requiredPermission="manageUsers"><UserManagement /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/questionnaire" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InventoryProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
