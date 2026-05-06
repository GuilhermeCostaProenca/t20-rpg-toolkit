import type { Metadata } from "next";
import { Cinzel, DM_Sans, JetBrains_Mono } from "next/font/google";

import { AppFeedbackProvider } from "@/components/app-feedback-provider";
import { cn } from "@/lib/utils";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Tormenta 20 OS",
  description: "Painel privado para comandar campanhas Tormenta 20.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          dmSans.variable,
          jetBrainsMono.variable,
          cinzel.variable
        )}
      >
        <AppFeedbackProvider>{children}</AppFeedbackProvider>
      </body>
    </html>
  );
}
