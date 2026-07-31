import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
 return <div className={cn("rounded-[12px] border border-[#E7E2D9] bg-[#FFFFFF]", className)} {...props} />;
}
