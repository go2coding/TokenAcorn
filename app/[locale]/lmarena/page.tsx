import { getLmArenaLeaderboards } from "@/lib/data";
import LmArenaClient from "@/components/lmarena/LmArenaClient";

export const metadata = {
  title: "LM Arena 排行榜 - TokenAcorn",
  description: "基于 LMSYS Chatbot Arena 众测投票数据，查看各大模型在不同任务维度的真实排名。",
};

export default async function LmArenaPage() {
  const leaderboards = await getLmArenaLeaderboards();

  return <LmArenaClient leaderboards={leaderboards} />;
}
