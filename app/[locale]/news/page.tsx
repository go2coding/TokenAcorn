import { getLatestNews } from "@/lib/data";
import NewsClient from "@/components/news/NewsClient";

export const metadata = {
  title: "模型快讯 - TokenAcorn",
  description: "AI 模型最新动态、发布公告、价格变动等快讯",
};

export default async function NewsPage() {
  const news = await getLatestNews(50);

  return <NewsClient news={news} />;
}
