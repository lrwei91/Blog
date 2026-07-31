import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
 return (
 <div className={cn("grid grid-cols-1 gap-1.5 text-sm font-medium text-[var(--ink)]", className)}>
 <span>{label}</span>
 {children}
 </div>
 );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
 return (
 <input
 {...props}
 className={cn(
 "h-10 w-full rounded-[10px] border border-[var(--rule)] bg-[var(--card)] px-3 text-sm outline-none transition focus:border-[var(--seal-deep)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--seal-deep)_10%,transparent)]",
 props.className
 )}
 />
 );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
 return (
 <textarea
 {...props}
 className={cn(
 "min-h-24 w-full rounded-[10px] border border-[var(--rule)] bg-[var(--card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--seal-deep)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--seal-deep)_10%,transparent)]",
 props.className
 )}
 />
 );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
 return (
 <select
 {...props}
 className={cn(
 "h-10 w-full rounded-[10px] border border-[var(--rule)] bg-[var(--card)] px-3 text-sm outline-none transition focus:border-[var(--seal-deep)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--seal-deep)_10%,transparent)]",
 props.className
 )}
 />
 );
}

export function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) {
 return <input type="checkbox" {...props} className={cn("h-4 w-4 accent-[var(--seal-deep)]", props.className)} />;
}
