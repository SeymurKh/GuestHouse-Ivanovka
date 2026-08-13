import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Ivanovka Guest Houses | Отдых в горах Азербайджана",
  description: "Уютные гостевые дома в Исмаиллы. Отдых в окружении величественных гор и густых лесов. Бронирование домов, семейный отдых, романтические getaway.",
  keywords: ["Исмаиллы", "Азербайджан", "гостевые дома", "отдых в горах", "бронирование", "туризм", "природа"],
  authors: [{ name: "Ivanovka Guest Houses" }],
  icons: {
    icon: "/vacationhomelogo.png",
  },
  openGraph: {
    title: "Ivanovka Guest Houses | Отдых в горах Азербайджана",
    description: "Уютные гостевые дома в Исмаиллы. Отдых в окружении величественных гор и густых лесов.",
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
      </body>
    </html>
  );
}
