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
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border font-medium transition disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0",
 size === "sm" && "h-9 px-3 text-sm",
 size === "md" && "h-10 px-4 text-sm",
 size === "icon" && "h-10 w-10",
 variant === "primary" && "border-transparent bg-[#C0452A] text-white hover:brightness-95",
 variant === "secondary" && "border-[#E7E2D9] bg-[#FFFFFF] text-[#1F2328] hover:bg-[#F8F7F4]",
 variant === "ghost" && "border-transparent bg-transparent text-[#1F2328] hover:bg-[#F1EEE8]",
 variant === "danger" && "border-transparent bg-red-600 text-white hover:bg-red-700",
 className
 )}
 {...props}
 />
 );
}
