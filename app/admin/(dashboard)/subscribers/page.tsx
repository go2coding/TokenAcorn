"use client";

import { useEffect, useState } from "react";

interface Subscriber {
  id: string;
  email: string;
  verified: boolean;
  locale: string;
  createdAt: string;
  verifiedAt: string | null;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: Subscriber[]) => {
        setSubscribers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载失败 / Failed to load");
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          邮件订阅用户 / Email Subscribers
        </h1>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          共 {subscribers.length} 条 / Total {subscribers.length}
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
          加载中... / Loading...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200">
                  邮箱 / Email
                </th>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200">
                  状态 / Status
                </th>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200">
                  订阅时间 / Subscribed At
                </th>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200">
                  验证时间 / Verified At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {subscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">
                    {subscriber.email}
                  </td>
                  <td className="px-4 py-3">
                    {subscriber.verified ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        已激活 / Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        未激活 / Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {new Date(subscriber.createdAt).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {subscriber.verifiedAt
                      ? new Date(subscriber.verifiedAt).toLocaleString("zh-CN")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subscribers.length === 0 && (
            <div className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
              暂无订阅用户 / No subscribers yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
