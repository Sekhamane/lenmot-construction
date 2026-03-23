import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Landmark, BarChart3, ClipboardCheck, MoreHorizontal, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/finance', icon: Landmark, label: 'Finance' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/more', icon: MoreHorizontal, label: 'More' },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const visibleNavItems = navItems.filter(item => {
    if (item.to === '/finance') return hasPermission('finance');
    if (item.to === '/reports') return hasPermission('reports');
    return true;
  });

  return (
    <>
      <header className="sticky top-0 z-40 md:hidden border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-display text-base">L</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground font-display leading-none">Lenmot</h1>
              <p className="text-[11px] text-muted-foreground mt-1 leading-none">Construction FIS</p>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[84vw] max-w-[320px] border-r border-border p-0">
              <SheetHeader className="px-4 py-4 border-b border-border">
                <SheetTitle className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold font-display text-base">L</span>
                  </div>
                  <span>Lenmot Navigation</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="p-3 space-y-1">
                {visibleNavItems.map(item => {
                  const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
                  return (
                    <SheetClose asChild key={item.to}>
                      <NavLink
                        to={item.to}
                        className={`nav-item min-h-12 ${isActive ? 'nav-item-active' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-base">{item.label}</span>
                      </NavLink>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:sticky md:top-0 flex-col w-64 bg-card border-r border-border min-h-screen p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold font-display text-lg">L</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground font-display">Lenmot</h1>
            <p className="text-xs text-muted-foreground">Construction FIS</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {visibleNavItems.map(item => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} className={`nav-item ${isActive ? 'nav-item-active' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
