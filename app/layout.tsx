import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cartina Gallery",
  description: "Luxury-style gallery website for a single artist."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
