import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Bitácora GSP643",
  description: "Bitácora guiada de aprendizaje - lab Firebase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className={cn(
        inter.variable, 
        "min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200",
        "dark:bg-neutral-950 dark:text-neutral-100 dark:selection:bg-neutral-800"
      )}>
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {children}
        </div>
      </body>
    </html>
  );
}
