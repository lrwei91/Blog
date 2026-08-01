import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
 variant?: "primary" | "secondary" | "ghost" | "danger";
 size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
 return (
 <button
 data-variant={variant}
 data-size={size}
 className={cn(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control,10px)] border font-medium transition disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0",
 size === "sm" && "h-9 px-3 text-sm",
 size === "md" && "h-10 px-4 text-sm",
 size === "icon" && "h-10 w-10",
 variant === "primary" &&
 "border-transparent bg-[var(--cta-bg,var(--seal-deep))] text-[var(--cta-text,#fff)] shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--cta-bg,var(--seal-deep))_80%,transparent)] hover:brightness-105",
 variant === "secondary" &&
 "border-[var(--rule)] bg-[var(--card)] text-[var(--ink)] hover:border-[var(--ink-2)] hover:bg-[var(--paper-2)]",
 variant === "ghost" && "border-transparent bg-transparent text-[var(--ink)] hover:bg-[var(--rule)]",
 variant === "danger" && "border-transparent bg-[var(--danger,#ef4444)] text-white hover:brightness-105",
 className
 )}
 {...props}
 />
 );
}
