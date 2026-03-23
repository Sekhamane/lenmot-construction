import React, { useState, useMemo, useCallback } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, LogOut, UserX, Clock, Search, Calendar, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const { currentUser, hasPermission } = useAuth();
  const {
    employees, projects, attendance,
    checkInEmployee, checkOutEmployee, markAbsent,
    deleteAttendance, getTodayAttendance, getEmployeeTodayRecord, getMonthlyAttendanceSummary,
  } = useAppData();

  // Get default project ID (first active project)
  const defaultProjectId = useMemo(() => {
    const activeProj = projects.find(p => p.status === 'Active');
    return activeProj?.id || '';
  }, [projects]);

  const [selectedProject, setSelectedProject] = useState<string>(() => defaultProjectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summaryMonth, setSummaryMonth] = useState(new Date().toISOString().substring(0, 7));

  const activeEmployees = useMemo(() => {
    const proj = projects.find(p => p.id === selectedProject);
    if (!proj) return [];
    
    let filtered = employees.filter(e => e.isActive && e.assignedProject === proj.name);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
    }
    return filtered;
  }, [employees, selectedProject, projects, searchQuery]);

  const todayRecords = useMemo(() => {
    const proj = projects.find(p => p.id === selectedProject);
    if (!proj) return [];
    const records = getTodayAttendance(selectedDate);
    return records.filter(r => r.projectName === proj.name);
  }, [getTodayAttendance, selectedDate, selectedProject, projects]);

  const monthlySummary = useMemo(() => {
    const proj = projects.find(p => p.id === selectedProject);
    if (!proj) return [];
    const summary = getMonthlyAttendanceSummary(summaryMonth);
    return summary.filter(s => s.projectName === proj.name);
  }, [getMonthlyAttendanceSummary, summaryMonth, selectedProject, projects]);

  const checkedIn = todayRecords.filter(r => r.status === 'checked_in').length;
  const checkedOut = todayRecords.filter(r => r.status === 'checked_out').length;
  const absent = todayRecords.filter(r => r.status === 'absent').length;

  const openCheckInEmailDraft = useCallback((empName: string, projectName: string) => {
    if (currentUser?.role !== 'Site Supervisor') return;
    const configuredRecipients = (import.meta.env.VITE_ATTENDANCE_NOTIFICATION_EMAILS as string | undefined)
      ?.split(',')
      .map(v => v.trim())
      .filter(Boolean) || [];
    const recipients = configuredRecipients.length > 0
      ? configuredRecipients
      : (currentUser?.email ? [currentUser.email] : []);
    if (recipients.length === 0) return;

    const dateText = new Date(selectedDate).toLocaleDateString();
    const subject = encodeURIComponent(`Attendance Check-In: ${empName}`);
    const body = encodeURIComponent(
      `Employee: ${empName}\nProject: ${projectName}\nChecked in by: ${currentUser?.name || 'Supervisor'}\nDate: ${dateText}`,
    );
    window.open(`mailto:${recipients.join(',')}?subject=${subject}&body=${body}`, '_blank');
  }, [currentUser?.email, currentUser?.name, currentUser?.role, selectedDate]);

  const handleCheckIn = (emp: typeof activeEmployees[0]) => {
    const proj = projects.find(p => p.name === emp.assignedProject);
    if (!proj) { toast.error('Employee has no assigned project'); return; }
    const existing = getEmployeeTodayRecord(emp.id, selectedDate);
    if (existing) { toast.error('Already has a record today'); return; }
    checkInEmployee(emp.id, emp.name, proj.id, proj.name, currentUser?.name || 'Unknown');
    toast.success(`${emp.name} checked in`);
    openCheckInEmailDraft(emp.name, proj.name);
  };

  const handleCheckOut = (recordId: string, empName: string) => {
    checkOutEmployee(recordId);
    toast.success(`${empName} checked out`);
  };

  const handleMarkAbsent = (emp: typeof activeEmployees[0]) => {
    const proj = projects.find(p => p.name === emp.assignedProject);
    if (!proj) { toast.error('Employee has no assigned project'); return; }
    const existing = getEmployeeTodayRecord(emp.id, selectedDate);
    if (existing) { toast.error('Already has a record today'); return; }
    markAbsent(emp.id, emp.name, proj.id, proj.name, currentUser?.name || 'Unknown');
    toast.success(`${emp.name} marked absent`);
  };

  const getStatusColor = (status: string) => {
    if (status === 'checked_in') return 'text-success';
    if (status === 'checked_out') return 'text-primary';
    return 'text-destructive';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'checked_in') return 'On Site';
    if (status === 'checked_out') return 'Left';
    return 'Absent';
  };

  const exportCSV = useCallback(() => {
    if (monthlySummary.length === 0) { toast.error('No data to export'); return; }
    const headers = ['Employee', 'Project', 'Days Present', 'Days Absent', 'Total Hours', 'Avg Hours/Day'];
    const rows = monthlySummary.map(s => [s.employeeName, s.projectName, s.daysPresent, s.daysAbsent, s.totalHours.toFixed(1), s.avgHoursPerDay.toFixed(1)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance-${summaryMonth}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }, [monthlySummary, summaryMonth]);

  const exportPDF = useCallback(() => {
    if (monthlySummary.length === 0) { toast.error('No data to export'); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Please allow popups'); return; }
    const tableRows = monthlySummary.map(s =>
      `<tr><td>${s.employeeName}</td><td>${s.projectName}</td><td style="text-align:center">${s.daysPresent}</td><td style="text-align:center">${s.daysAbsent}</td><td style="text-align:center">${s.totalHours.toFixed(1)}</td><td style="text-align:center">${s.avgHoursPerDay.toFixed(1)}</td></tr>`
    ).join('');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Attendance Report - ${summaryMonth}</title>
      <style>body{font-family:Arial,sans-serif;padding:20px}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ccc;padding:8px;font-size:13px}th{background:#f5f5f5;font-weight:600}</style></head>
      <body><h1>Monthly Attendance Summary — ${summaryMonth}</h1>
      <table><thead><tr><th>Employee</th><th>Project</th><th>Present</th><th>Absent</th><th>Hours</th><th>Avg/Day</th></tr></thead><tbody>${tableRows}</tbody></table>
      <script>window.onload=()=>{window.print()}</script></body></html>`);
    printWindow.document.close();
    toast.success('PDF opened for printing');
  }, [monthlySummary, summaryMonth]);

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <SectionHeader title="Attendance Tracking" subtitle="Check-in / check-out employees per project" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-3 text-center">
          <LogIn className="w-5 h-5 mx-auto text-success mb-1" />
          <p className="text-lg font-bold text-foreground">{checkedIn}</p>
          <p className="text-xs text-muted-foreground">On Site</p>
        </div>
        <div className="glass-card p-3 text-center">
          <LogOut className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{checkedOut}</p>
          <p className="text-xs text-muted-foreground">Left</p>
        </div>
        <div className="glass-card p-3 text-center">
          <UserX className="w-5 h-5 mx-auto text-destructive mb-1" />
          <p className="text-lg font-bold text-foreground">{absent}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
      </div>

      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="checkin">Check In/Out</TabsTrigger>
          <TabsTrigger value="today">Today's Log</TabsTrigger>
          <TabsTrigger value="summary">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search employees..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Select Project" /></SelectTrigger>
              <SelectContent>
                {projects.filter(p => p.status === 'Active').map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full sm:w-40" />
          </div>

          <div className="space-y-2">
            {activeEmployees.map(emp => {
              const record = getEmployeeTodayRecord(emp.id, selectedDate);
              return (
                <div key={emp.id} className="glass-card p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role} • {emp.assignedProject}</p>
                  </div>
                  {record ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${getStatusColor(record.status)}`}>{getStatusLabel(record.status)}</span>
                      {record.status === 'checked_in' && (
                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(record.id, emp.name)}>
                          <LogOut className="w-4 h-4 mr-1" /> Out
                        </Button>
                      )}
                      {record.status === 'checked_out' && record.hoursWorked > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {record.hoursWorked.toFixed(1)}h
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleCheckIn(emp)} className="bg-success hover:bg-success/90 text-success-foreground">
                        <LogIn className="w-4 h-4 mr-1" /> In
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => handleMarkAbsent(emp)}>
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {activeEmployees.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No active employees found</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-40" />
            <span className="text-sm text-muted-foreground">{todayRecords.length} records</span>
          </div>

          <div className="space-y-2">
            {todayRecords.map(record => (
              <div key={record.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{record.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{record.projectName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      record.status === 'checked_in' ? 'bg-success/20 text-success' :
                      record.status === 'checked_out' ? 'bg-primary/20 text-primary' :
                      'bg-destructive/20 text-destructive'
                    }`}>{getStatusLabel(record.status)}</span>
                    {hasPermission('employees') && (
                      <button onClick={() => { deleteAttendance(record.id); toast.success('Record deleted'); }}
                        className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {record.checkIn && <span>In: {new Date(record.checkIn).toLocaleTimeString()}</span>}
                  {record.checkOut && <span>Out: {new Date(record.checkOut).toLocaleTimeString()}</span>}
                  {record.hoursWorked > 0 && <span>{record.hoursWorked.toFixed(1)} hrs</span>}
                </div>
                {record.notes && <p className="text-xs text-muted-foreground mt-1 italic">{record.notes}</p>}
              </div>
            ))}
            {todayRecords.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No attendance records for this date</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input type="month" value={summaryMonth} onChange={e => setSummaryMonth(e.target.value)} className="w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button size="sm" variant="outline" onClick={exportPDF}>
                <Download className="w-4 h-4 mr-1" /> PDF
              </Button>
            </div>
          </div>

          {monthlySummary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Employee</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Project</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Present</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Absent</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Hours</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Avg/Day</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map(s => (
                    <tr key={s.employeeId} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{s.employeeName}</td>
                      <td className="py-2 text-muted-foreground">{s.projectName}</td>
                      <td className="py-2 text-center text-success font-medium">{s.daysPresent}</td>
                      <td className="py-2 text-center text-destructive font-medium">{s.daysAbsent}</td>
                      <td className="py-2 text-center text-foreground">{s.totalHours.toFixed(1)}</td>
                      <td className="py-2 text-center text-foreground">{s.avgHoursPerDay.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No attendance data for this month</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
