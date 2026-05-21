import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Ivanovka Vacation Homes | Отдых в горах Азербайджана",
  description: "Уютные дома для отдыха в Исмаиллы. Отдых в окружении величественных гор и густых лесов. Бронирование домов, семейный отдых, романтические getaway.",
  keywords: ["Исмаиллы", "Азербайджан", "дома для отдыха", "отдых в горах", "бронирование", "туризм", "природа"],
  authors: [{ name: "Ivanovka Vacation Homes" }],
  icons: {
    icon: "/vacationhomelogo.png",
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
        className={`${montserrat.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
