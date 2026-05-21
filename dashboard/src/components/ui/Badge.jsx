import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = "default", children, ...props }) {
  const variants = {
    default: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
    success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100",
    outline: "text-slate-950 dark:text-slate-50 border-slate-200 dark:border-slate-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
