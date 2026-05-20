import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ivanovka Vacation Homes | Отдых в горах Азербайджана",
  description: "Уютные дома для отдыха в Исмаиллы. Отдых в окружении величественных гор и густых лесов. Бронирование домов, семейный отдых, романтические getaway.",
  keywords: ["Исмаиллы", "Азербайджан", "дома для отдыха", "отдых в горах", "бронирование", "туризм", "природа"],
  authors: [{ name: "Ivanovka Vacation Homes" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Ivanovka Vacation Homes | Отдых в горах Азербайджана",
    description: "Уютные дома для отдыха в Исмаиллы. Отдых в окружении величественных гор и густых лесов.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
