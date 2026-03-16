import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentinel — Security Intelligence",
  description: "AI-powered security scanning for your repositories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-sentinel-950 text-zinc-900 dark:text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
