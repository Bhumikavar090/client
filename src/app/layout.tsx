import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevTraxe AI",
  description: "AI-powered software issue investigation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}