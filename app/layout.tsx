import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

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
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
