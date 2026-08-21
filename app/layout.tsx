import type { Metadata, Viewport } from "next";
import { Jomhuria, Inter } from "next/font/google";
import "./globals.css";

const jomhuria = Jomhuria({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jomhuria",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sodoit",
  description: "Your life. Your list. Your proof.",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jomhuria.variable} ${inter.variable}`}>
      <body className="antialiased selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
