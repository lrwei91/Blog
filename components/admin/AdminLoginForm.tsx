"use client";

import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
 type EditorLanguage,
 editorLanguageStorageKey,
 resolveInitialEditorLanguage,
 subscribeToEditorLanguage
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
 <section lang={language} className="admin-login__panel w-full max-w-[440px]">
 <div className="mb-8">
 <div className="mb-8 flex items-center justify-between gap-4">
 <span className="admin-login__mark" aria-hidden="true"><img src="/brand-seal.png" alt="" /></span>
 <span className="admin-login__secure"><ShieldCheck className="h-3.5 w-3.5" /> {copy.secure}</span>
 </div>
 <p className="admin-login__eyebrow mb-3">01 / {copy.eyebrow}</p>
 <h1 className="text-[38px] font-bold leading-[1.02] tracking-[-0.055em] text-[#201D18]">{projectName}</h1>
 <p className="mt-4 max-w-[360px] text-[15px] leading-7 text-[#6F6A5E]">{copy.description}</p>
 </div>

 <form onSubmit={submit} className="grid gap-5">
 <label className="grid gap-2 text-[13px] font-bold text-[#201D18]" htmlFor="admin-password">
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
 "h-12 w-full rounded-[6px] border bg-[#FCFAF5] px-4 text-[15px] text-[#201D18] outline-none transition duration-200 placeholder:text-[#A39C8D] focus:ring-4",
 hasError
 ? "border-[#D85C5C] focus:border-[#C94343] focus:ring-[#D85C5C]/10"
 : "border-[#DDD6C8] hover:border-[#A39C8D] focus:border-[#B23C22] focus:ring-[#B23C22]/15"
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
 className="admin-login__submit group inline-flex h-12 items-center justify-center gap-2 rounded-[6px] px-4 text-sm font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
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

 <div className="admin-login__footer mt-8 flex items-center justify-between gap-3 border-t pt-5">
 <span>CONTENT STUDIO</span>
 <span>{"// DESIGNED BY LRWEI91"}</span>
 </div>
 </section>
 );
}
