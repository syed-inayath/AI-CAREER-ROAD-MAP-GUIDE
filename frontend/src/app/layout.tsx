import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";

const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" });
const firaSans = Fira_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-fira-sans" });

export const metadata: Metadata = {
  title: "CareerAI Pro",
  description: "Your intelligent career advisor powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaCode.variable} ${firaSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
