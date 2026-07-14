import type { SiteConfig } from "@/types/site-config";
import { AdminVisualEditor } from "@/components/admin/AdminVisualEditor";

export function AdminShell({ initialConfig }: { initialConfig: SiteConfig }) {
  return <AdminVisualEditor key={initialConfig.updatedAt} initialConfig={initialConfig} />;
}
