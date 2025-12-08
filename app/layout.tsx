import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import TopNav from "./components/TopNav";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clinix AI | Medical-grade Claims & Revenue Platform",
  description:
    "A clinically polished experience for eligibility, clean claims, status, remits, and appeal automation powered by Stedi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    {
      label: "Products",
      bgColor: "#0f172a",
      textColor: "#e2e8f0",
      links: [
        { label: "API Workbench", href: "/api", ariaLabel: "API Workbench" },
        { label: "RAG", href: "/rag", ariaLabel: "RAG" },
        { label: "Mocks", href: "/mocks", ariaLabel: "Mocks" },
      ],
    },
    {
      label: "Insights",
      bgColor: "#0b1b2f",
      textColor: "#e0f2fe",
      links: [
        { label: "Analytics", href: "/analytics", ariaLabel: "Analytics" },
        { label: "Claims pipeline", href: "/#workflow", ariaLabel: "Workflow" },
        { label: "Playbooks", href: "/#playbooks", ariaLabel: "Playbooks" },
      ],
    },
    {
      label: "Help",
      bgColor: "#0f172a",
      textColor: "#e2e8f0",
      links: [
        { label: "Docs", href: "/api", ariaLabel: "Docs" },
        { label: "Status", href: "/analytics", ariaLabel: "Status" },
      ],
    },
  ];

  return (
    <html lang="en">
      <body className={`${manrope.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
