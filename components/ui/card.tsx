import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
 return <div className={cn("rounded-[12px] border border-[var(--rule)] bg-[var(--card)]", className)} {...props} />;
}
