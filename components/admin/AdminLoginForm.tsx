"use client";

import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  type EditorLanguage,
  editorLanguageStorageKey,
  resolveInitialEditorLanguage
} from "@/components/admin/editor-i18n";
import { cn } from "@/lib/utils";

type AdminLoginFormProps = {
  projectName: string;
  initialLanguage: EditorLanguage;
};

const loginCopy = {
  "zh-CN": {
    eyebrow: "管理后台",
    description: "输入管理员密码，继续进入编辑器。",
    password: "管理员密码",
    passwordPlaceholder: "输入密码",
    submit: "进入编辑器",
    submitting: "正在验证…",
    error: "密码不正确，或尚未配置管理员密码。",
    success: "登录成功",
    secure: "安全的管理入口"
  },
  en: {
    eyebrow: "Admin workspace",
    description: "Enter the admin password to continue to the editor.",
    password: "Admin password",
    passwordPlaceholder: "Enter password",
    submit: "Continue to editor",
    submitting: "Verifying…",
    error: "The password is incorrect, or the admin password is not configured.",
    success: "Signed in",
    secure: "Secure admin access"
  }
} satisfies Record<EditorLanguage, Record<string, string>>;

export function AdminLoginForm({ projectName, initialLanguage }: AdminLoginFormProps) {
  const router = useRouter();
  const language = useSyncExternalStore(
    subscribeToEditorLanguage,
    resolveInitialEditorLanguage,
    () => initialLanguage
  );
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const copy = loginCopy[language];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        setHasError(true);
        return;
      }

      toast.success(copy.success);
      router.push("/admin");
      router.refresh();
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section lang={language} className="w-full max-w-[400px]">
      <div className="mb-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1479FF]">{copy.eyebrow}</p>
        <h1 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.035em] text-[#111111]">{projectName}</h1>
        <p className="mt-3 max-w-[360px] text-[15px] leading-6 text-[#64748B]">{copy.description}</p>
      </div>

      <form onSubmit={submit} className="grid gap-5">
        <label className="grid gap-2 text-[13px] font-medium text-[#334155]" htmlFor="admin-password">
          <span>{copy.password}</span>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (hasError) setHasError(false);
            }}
            placeholder={copy.passwordPlaceholder}
            autoComplete="current-password"
            autoFocus
            aria-invalid={hasError}
            aria-describedby={hasError ? "admin-login-error" : undefined}
            className={cn(
              "h-12 w-full rounded-[14px] border bg-white px-4 text-[15px] text-[#111111] outline-none transition duration-200 placeholder:text-[#94A3B8] focus:ring-4",
              hasError
                ? "border-[#D85C5C] focus:border-[#C94343] focus:ring-[#D85C5C]/10"
                : "border-[#D9E6F8] hover:border-[#AFCDF4] focus:border-[#1479FF] focus:ring-[#1479FF]/10"
            )}
          />
        </label>

        {hasError ? (
          <p id="admin-login-error" role="alert" className="-mt-2 text-[13px] leading-5 text-[#B83D3D]">
            {copy.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || !password}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#1479FF] bg-[#1479FF] px-4 text-sm font-medium text-white transition duration-200 hover:border-[#0F67D9] hover:bg-[#0F67D9] disabled:cursor-not-allowed disabled:border-[#B7D6FA] disabled:bg-[#B7D6FA]"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {copy.submitting}
            </>
          ) : (
            <>
              {copy.submit}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-2 border-t border-[#EAF0F8] pt-5 text-[12px] text-[#94A3B8]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#1479FF]" strokeWidth={1.8} />
        <span>{copy.secure}</span>
      </div>
    </section>
  );
}

function subscribeToEditorLanguage(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === editorLanguageStorageKey) onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}
