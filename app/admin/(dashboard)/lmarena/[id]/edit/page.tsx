import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import LmArenaForm from "@/components/admin/forms/LmArenaForm";

export const metadata = {
  title: "编辑 LM Arena 排行榜 - TokenAcorn Admin",
};

export default async function EditLmArenaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const leaderboard = await prisma.lmArenaLeaderboard.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: [{ rank: "asc" }, { rating: "desc" }],
      },
    },
  });

  if (!leaderboard) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        编辑 LM Arena 排行榜 / Edit LM Arena Leaderboard
      </h1>
      <LmArenaForm
        initialData={{
          ...leaderboard,
          description: leaderboard.description ?? "",
          sourceUrl: leaderboard.sourceUrl ?? "",
        }}
        isEdit
      />
    </div>
  );
}
