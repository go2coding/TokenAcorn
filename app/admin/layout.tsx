import "../globals.css";
import { AdminLangProvider } from "@/contexts/AdminLangContext";

export const metadata = {
  title: "TokenAcorn Admin",
  description: "TokenAcorn Admin Panel",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <AdminLangProvider>{children}</AdminLangProvider>
      </body>
    </html>
  );
}
