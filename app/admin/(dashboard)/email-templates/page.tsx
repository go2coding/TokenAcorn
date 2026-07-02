"use client";

import { useEffect, useState } from "react";

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  locale: string;
  subject: string;
  htmlBody: string;
  updatedAt: string;
}

const locales = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLocale, setSelectedLocale] = useState("zh");

  useEffect(() => {
    loadTemplates();
  }, [selectedLocale]);

  const loadTemplates = () => {
    setLoading(true);
    fetch(`/api/admin/email-templates?locale=${selectedLocale}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: EmailTemplate[]) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => {
        setMessage("加载失败 / Failed to load");
        setLoading(false);
      });
  };

  const updateTemplate = async (template: EmailTemplate) => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(
        `/api/admin/email-templates/${template.key}?locale=${template.locale}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: template.subject,
            htmlBody: template.htmlBody,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save");
      setMessage("保存成功 / Saved successfully");
    } catch {
      setMessage("保存失败 / Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    index: number,
    field: keyof EmailTemplate,
    value: string
  ) => {
    const updated = [...templates];
    updated[index] = { ...updated[index], [field]: value };
    setTemplates(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          邮件模板 / Email Templates
        </h1>
        <select
          value={selectedLocale}
          onChange={(e) => setSelectedLocale(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        >
          {locales.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.includes("成功") || message.includes("Saved")
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
          加载中... / Loading...
        </div>
      ) : (
        <div className="space-y-6">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {template.name}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Key: {template.key} · Locale: {template.locale} · 更新于{" "}
                    {new Date(template.updatedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <button
                  onClick={() => updateTemplate(template)}
                  disabled={saving}
                  className="rounded-lg bg-acorn-600 px-4 py-2 text-sm font-medium text-white hover:bg-acorn-700 disabled:opacity-60"
                >
                  {saving ? "保存中..." : "保存 / Save"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    邮件主题 / Subject
                  </label>
                  <input
                    type="text"
                    value={template.subject}
                    onChange={(e) =>
                      handleChange(index, "subject", e.target.value)
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    HTML 内容 / HTML Body
                  </label>
                  <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
                    可用变量：{" "}
                    {template.key === "verification"
                      ? "{{verifyUrl}} {{unsubscribeUrl}}"
                      : "{{content}} 以及邮件正文中直接插入的变量"}
                  </p>
                  <textarea
                    value={template.htmlBody}
                    onChange={(e) =>
                      handleChange(index, "htmlBody", e.target.value)
                    }
                    rows={12}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
