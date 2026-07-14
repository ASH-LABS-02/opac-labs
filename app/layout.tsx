import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import AIFloatingButton from "@/components/AIFloatingButton";

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
    <html lang="en">
      <body>
        <FirebaseAuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <PageTransition>
                {children}
              </PageTransition>
              <AIFloatingButton />
              <Footer />
            </ToastProvider>
          </CartProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
