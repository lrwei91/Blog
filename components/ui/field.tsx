import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
 return (
 <div className={cn("grid gap-1.5 text-sm font-medium text-[#201D18]", className)}>
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
 "h-10 w-full rounded-[5px] border border-[#DDD6C8] bg-[#FCFAF5] px-3 text-sm outline-none transition focus:border-[#B23C22] focus:ring-4 focus:ring-[#B23C22]/10",
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
 "min-h-24 w-full rounded-[5px] border border-[#DDD6C8] bg-[#FCFAF5] px-3 py-2 text-sm outline-none transition focus:border-[#B23C22] focus:ring-4 focus:ring-[#B23C22]/10",
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
 "h-10 w-full rounded-[5px] border border-[#DDD6C8] bg-[#FCFAF5] px-3 text-sm outline-none transition focus:border-[#B23C22] focus:ring-4 focus:ring-[#B23C22]/10",
 props.className
 )}
 />
 );
}

export function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) {
 return <input type="checkbox" {...props} className={cn("h-4 w-4 accent-[#B23C22]", props.className)} />;
}
