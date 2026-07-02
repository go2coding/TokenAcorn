import Link from "next/link";
import prisma from "@/lib/db";
import LmArenaTable from "@/components/admin/tables/LmArenaTable";

export const dynamic = "force-dynamic";

export default async function AdminLmArenaPage() {
  const leaderboards = await prisma.lmArenaLeaderboard.findMany({
    include: {
      _count: {
        select: { entries: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          LM Arena 排行榜管理 / LM Arena Leaderboards
        </h1>
        <Link
          href="/admin/lmarena/new"
          className="rounded-lg bg-acorn-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-acorn-600"
        >
          + 新建排行榜 / New Leaderboard
        </Link>
      </div>

      <LmArenaTable leaderboards={leaderboards} />
    </div>
  );
}
