import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";
import { resolveEditorLanguageFromLanguageTag } from "@/components/admin/editor-i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminPage() {
  if (!(await getCurrentSessionIsValid())) {
    redirect("/admin/login");
  }

  const acceptLanguage = (await headers()).get("accept-language");
  const config = await getSiteConfig(acceptLanguage);
  const initialLanguage = resolveEditorLanguageFromLanguageTag(acceptLanguage);

  return <AdminShell initialConfig={config} initialLanguage={initialLanguage} />;
}
