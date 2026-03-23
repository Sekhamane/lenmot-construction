import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { AppSidebar } from "@/components/AppSidebar";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PendingPage from "@/pages/PendingPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectFormPage from "@/pages/ProjectFormPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import FinancePage from "@/pages/FinancePage";
import TransactionFormPage from "@/pages/TransactionFormPage";
import LoanFormPage from "@/pages/LoanFormPage";
import InvestorFormPage from "@/pages/InvestorFormPage";
import EmployeeFormPage from "@/pages/EmployeeFormPage";
import MaterialFormPage from "@/pages/MaterialFormPage";
import EquipmentFormPage from "@/pages/EquipmentFormPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import ReportsPage from "@/pages/ReportsPage";
import AttendancePage from "@/pages/AttendancePage";
import MorePage from "@/pages/MorePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (currentUser?.status === 'pending') return <Navigate to="/pending" />;
  return <>{children}</>;
}

function PermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppLayout() {
  return (
    <AuthGuard>
      <AppDataProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 min-h-screen">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/project-form" element={<ProjectFormPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/finance" element={<PermissionGuard permission="finance"><FinancePage /></PermissionGuard>} />
              <Route path="/transaction-form" element={<PermissionGuard permission="finance"><TransactionFormPage /></PermissionGuard>} />
              <Route path="/loan-form" element={<PermissionGuard permission="finance"><LoanFormPage /></PermissionGuard>} />
              <Route path="/investor-form" element={<PermissionGuard permission="finance"><InvestorFormPage /></PermissionGuard>} />
              <Route path="/employee-form" element={<EmployeeFormPage />} />
              <Route path="/material-form" element={<MaterialFormPage />} />
              <Route path="/equipment-form" element={<EquipmentFormPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin-users" element={<AdminUsersPage />} />
              <Route path="/reports" element={<PermissionGuard permission="reports"><ReportsPage /></PermissionGuard>} />
              <Route path="/more" element={<MorePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AppDataProvider>
    </AuthGuard>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending" element={<PendingPage />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
