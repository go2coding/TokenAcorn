"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function VerifyPage() {
  const t = useTranslations("verify");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("missingToken"));
      return;
    }

    fetch(`/api/subscribe/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({ error: t("error") }));
        if (res.ok) {
          setStatus("success");
          setMessage(t("success"));
        } else {
          setStatus("error");
          setMessage(data.error || t("error"));
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage(t("error"));
      });
  }, [token, t]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div
        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
          status === "success"
            ? "bg-green-100 text-green-600 dark:bg-green-900/30"
            : status === "error"
            ? "bg-red-100 text-red-600 dark:bg-red-900/30"
            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800"
        }`}
      >
        {status === "success" ? "✓" : status === "error" ? "✕" : "..."}
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        {status === "success" ? t("successTitle") : status === "error" ? t("errorTitle") : t("loadingTitle")}
      </h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300">{message}</p>
      {status !== "loading" && (
        <Link
          href={`/${locale}`}
          className="mt-8 inline-block rounded-lg bg-acorn-600 px-6 py-2 text-sm font-semibold text-white hover:bg-acorn-700"
        >
          {t("backHome")}
        </Link>
      )}
    </div>
  );
}
