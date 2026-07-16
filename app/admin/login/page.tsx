import { headers } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { resolveEditorLanguageFromLanguageTag } from "@/components/admin/editor-i18n";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminLoginPage() {
  const requestHeaders = await headers();
  const config = await getSiteConfig(requestHeaders.get("accept-language"));
  const initialLanguage = resolveEditorLanguageFromLanguageTag(requestHeaders.get("accept-language"));

  return (
    <main className="admin-login relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
      <AdminLoginForm projectName={config.settings.projectName} initialLanguage={initialLanguage} />
    </main>
  );
}
