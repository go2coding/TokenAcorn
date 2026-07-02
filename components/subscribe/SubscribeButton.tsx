"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function SubscribeButton() {
  const t = useTranslations("subscribe");
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const open = () => {
    if (!dialogRef.current) return;
    dialogRef.current.showModal();
  };

  const close = () => {
    if (!dialogRef.current) return;
    dialogRef.current.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      const data = await res.json().catch(() => ({ error: t("errorGeneric") }));

      if (res.ok) {
        setStatus("success");
        setMessage(t("success"));
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || t("errorGeneric"));
      }
    } catch {
      setStatus("error");
      setMessage(t("errorGeneric"));
    }
  };

  return (
    <>
      <button
        onClick={open}
        className="rounded-lg bg-acorn-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-acorn-700 focus:outline-none focus:ring-2 focus:ring-acorn-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
      >
        {t("button")}
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl backdrop:bg-black/50 dark:bg-neutral-900"
        onClose={() => {
          setStatus("idle");
          setMessage("");
          setEmail("");
        }}
      >
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          {t("title")}
        </h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          {t("description")}
        </p>

        {status === "success" ? (
          <div className="mt-4">
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {message}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={close}
                className="rounded-lg bg-acorn-600 px-4 py-2 text-sm font-semibold text-white hover:bg-acorn-700"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-acorn-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-acorn-600 px-4 py-2 text-sm font-semibold text-white hover:bg-acorn-700 disabled:opacity-60"
              >
                {status === "loading" ? t("submitting") : t("submit")}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
