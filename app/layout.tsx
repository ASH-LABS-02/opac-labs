import type { Metadata } from "next";
import { Archivo_Black, Kalam, Space_Mono } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
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
  description: "OPAC Labs designs and builds software, hardware, IoT, and student projects from idea to working prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${kalam.variable} ${spaceMono.variable}`}>
      <body className="opac-site">
        <FirebaseAuthProvider>
          <Navbar />
          {children}
          <AIFloatingButton />
          <Footer />
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
