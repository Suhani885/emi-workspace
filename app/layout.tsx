import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { AppProvider } from "@/context/AppProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMI Workspace — Loan Calculator",
  description: "A premium Loan EMI Calculator with real-time cross-tab sync, amortization schedule, scenario comparison, and prepayment planner.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("emi-theme")?.value;
  const initialTheme = savedTheme === "dark" ? "dark" : "light";

  return (
    <html lang="en" className={initialTheme === "dark" ? "" : "light"} suppressHydrationWarning>
      <body className="font-display">
        <AppProvider initialTheme={initialTheme}>{children}</AppProvider>
      </body>
    </html>
  );
}