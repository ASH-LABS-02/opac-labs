import type { Metadata } from "next";
import { Archivo_Black, Kalam, Space_Mono } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIFloatingButton from "@/components/AIFloatingButton";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OPAC Labs — Software & Hardware Project Studio",
  description: "OPAC Labs designs and builds custom software, ERP and CRM systems, hardware, IoT, and student projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${kalam.variable} ${spaceMono.variable}`}>
      <body className="opac-site">
        <noscript><p className="js-required">Enable JavaScript to sign in, send a project brief, or use the project planner.</p></noscript>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <AuthProvider>
          <Navbar />
          {children}
          <AIFloatingButton />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
