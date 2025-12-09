import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import CardNav from "./components/CardNav";

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
        { label: "Dashboard", href: "/dashboard", ariaLabel: "Dashboard" },
      ],
    },
    {
      label: "Insights",
      bgColor: "#0b1b2f",
      textColor: "#e0f2fe",
      links: [
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
      ],
    },
  ];

  return (
    <html lang="en">
      <body className={`${manrope.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <div className="relative z-40 pt-4">
          <CardNav
            logo="/favicon.ico"
            logoAlt="Clinix AI"
            items={navItems}
            baseColor="#0b1324"
            menuColor="#e2e8f0"
            buttonBgColor="#0ea5e9"
            buttonTextColor="#0b1224"
          />
        </div>
        {children}
      </body>
    </html>
  );
}
