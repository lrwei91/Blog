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
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] border font-medium transition disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0",
 size === "sm" && "h-9 px-3 text-sm",
 size === "md" && "h-10 px-4 text-sm",
 size === "icon" && "h-10 w-10",
 variant === "primary" && "border-transparent bg-[#B23C22] text-white hover:bg-[#7E2A16]",
 variant === "secondary" && "border-[#DDD6C8] bg-[#FCFAF5] text-[#201D18] hover:bg-[#F6F3EC]",
 variant === "ghost" && "border-transparent bg-transparent text-[#201D18] hover:bg-[#EDE8DB]",
 variant === "danger" && "border-transparent bg-red-600 text-white hover:bg-red-700",
 className
 )}
 {...props}
 />
 );
}
