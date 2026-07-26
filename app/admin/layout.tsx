import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "个人主页编辑器",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
