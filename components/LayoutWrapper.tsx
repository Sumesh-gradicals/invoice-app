"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/providers/AuthContext";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
  const isLoginPage = pathname === "/login";

  // If it's the login page, or we're still loading the user state,
  // we just show the content without the sidebar layout.
  if (isLoginPage || (isLoading && !user)) {
    return <>{children}</>;
  }

  // Once logged in and on a normal page, show the sidebar layout
  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-[#f9fafb]">
        {children}
      </main>
    </div>
  );
}
