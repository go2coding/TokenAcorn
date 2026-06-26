"use client";

import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

export default function AdminHeader() {
  const router = useRouter();
  const { lang, setLang, t } = useAdminLang();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
        TokenAcorn {t("nav.admin")}
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          <button
            onClick={() => setLang("zh")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              lang === "zh"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            中文
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              lang === "en"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            EN
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-neutral-500 hover:text-red-500 transition-colors"
        >
          {t("nav.logout")}
        </button>
      </div>
    </header>
  );
}
