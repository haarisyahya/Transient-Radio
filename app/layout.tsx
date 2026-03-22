import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  title: "Transient Radio",
  description:
    "A nomadic broadcast exploring the peripheries of electronic music and sound.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
