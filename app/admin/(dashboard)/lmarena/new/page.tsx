import LmArenaForm from "@/components/admin/forms/LmArenaForm";

export const metadata = {
  title: "新建 LM Arena 排行榜 - TokenAcorn Admin",
};

export default function NewLmArenaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        新建 LM Arena 排行榜 / New LM Arena Leaderboard
      </h1>
      <LmArenaForm />
    </div>
  );
}
