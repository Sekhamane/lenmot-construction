import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  Active: 'bg-success/20 text-success',
  'In Use': 'bg-success/20 text-success',
  Planned: 'bg-info/20 text-info',
  Available: 'bg-info/20 text-info',
  Suspended: 'bg-warning/20 text-warning',
  Maintenance: 'bg-warning/20 text-warning',
  Completed: 'bg-muted text-muted-foreground',
  checked_in: 'bg-success/20 text-success',
  checked_out: 'bg-info/20 text-info',
  absent: 'bg-destructive/20 text-destructive',
  active: 'bg-success/20 text-success',
  pending: 'bg-warning/20 text-warning',
  suspended: 'bg-destructive/20 text-destructive',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-muted text-muted-foreground';
  return <span className={`status-badge ${style}`}>{status}</span>;
}
