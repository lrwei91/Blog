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
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#F8FBFF] px-5 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#1479FF]/15" />
      <AdminLoginForm projectName={config.settings.projectName} initialLanguage={initialLanguage} />
    </main>
  );
}
