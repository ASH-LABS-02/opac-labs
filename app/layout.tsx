import type { Metadata } from "next";
import { Archivo_Black, Kalam, Space_Mono } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { CartProvider } from "@/contexts/CartContext";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
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
  title: "OPAC Labs - Electronics for Students",
  description: "Tools and kits for students building real electronics projects",
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
          <CartProvider>
            <ToastProvider>
              <Navbar />
              {children}
              <AIFloatingButton />
              <Footer />
            </ToastProvider>
          </CartProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
