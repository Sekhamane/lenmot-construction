import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, color }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="p-2 rounded-lg bg-primary/10" style={color ? { backgroundColor: `${color}20` } : undefined}>
          <Icon className="w-4 h-4 text-primary" style={color ? { color } : undefined} />
        </div>
      </div>
      <p className="text-xl font-bold text-foreground font-display">{value}</p>
      {trend && (
        <span className={`text-xs font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </div>
  );
}
