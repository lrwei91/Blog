import type { SiteConfig } from "@/types/site-config";
import type { EditorLanguage } from "@/components/admin/editor-i18n";
import { AdminVisualEditor } from "@/components/admin/AdminVisualEditor";

export function AdminShell({ initialConfig, initialLanguage }: { initialConfig: SiteConfig; initialLanguage: EditorLanguage }) {
 return <AdminVisualEditor key={initialConfig.updatedAt} initialConfig={initialConfig} initialLanguage={initialLanguage} />;
}
