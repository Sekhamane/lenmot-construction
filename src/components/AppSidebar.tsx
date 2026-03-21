import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Landmark, BarChart3, ClipboardCheck, MoreHorizontal } from 'lucide-react';

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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen p-4">
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
          {navItems.map(item => {
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

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex">
        {navItems.map(item => {
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className={`flex-1 flex flex-col items-center py-2 gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
