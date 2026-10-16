import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./navbar";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cacao Trazabilidad - Huila",
  description: "Sistema de trazabilidad, control de mermas y costos de cacao del Huila",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const t = localStorage.getItem('cacao-theme');
                  if (t === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (_) {
                  document.documentElement.classList.add('dark');
                }
              `,
            }}
          />
        </head>
        <body className="min-h-screen flex flex-col transition-colors duration-150">
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <BottomNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
