import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { AppSidebar } from "@/components/AppSidebar";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const PendingPage = lazy(() => import("@/pages/PendingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"));
const ProjectFormPage = lazy(() => import("@/pages/ProjectFormPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const FinancePage = lazy(() => import("@/pages/FinancePage"));
const TransactionFormPage = lazy(() => import("@/pages/TransactionFormPage"));
const LoanFormPage = lazy(() => import("@/pages/LoanFormPage"));
const InvestorFormPage = lazy(() => import("@/pages/InvestorFormPage"));
const EmployeeFormPage = lazy(() => import("@/pages/EmployeeFormPage"));
const MaterialFormPage = lazy(() => import("@/pages/MaterialFormPage"));
const EquipmentFormPage = lazy(() => import("@/pages/EquipmentFormPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const AttendancePage = lazy(() => import("@/pages/AttendancePage"));
const MorePage = lazy(() => import("@/pages/MorePage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const isNativeCapacitor =
  typeof window !== "undefined" &&
  !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === "true" || isNativeCapacitor;
const RouterComponent = useHashRouter ? HashRouter : BrowserRouter;

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-5 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  );
}

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
        <div className="flex min-h-screen overflow-x-clip">
          <AppSidebar />
          <main className="flex-1 min-h-screen pb-safe">
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
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
        <RouterComponent future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/pending" element={<PendingPage />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </Suspense>
        </RouterComponent>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
