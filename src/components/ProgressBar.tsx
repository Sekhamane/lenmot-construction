import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color, height = 6 }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full bg-muted rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${clampedProgress}%`, ...(color ? { backgroundColor: color } : {}) }}
      />
    </div>
  );
}
