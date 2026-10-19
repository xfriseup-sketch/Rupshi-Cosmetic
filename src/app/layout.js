import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Toast from "@/components/Toast";
import ClientShell from "@/components/ClientShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "রূপসী কসমেটিক্স | Rupshi Cosmetics",
  description:
    "আপনার সৌন্দর্যের যত্নে বিশ্বস্ত নাম। স্কিনকেয়ার, মেকআপ ও হেয়ারকেয়ারের সেরা কালেকশন।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={`${inter.className} antialiased`}>
        <CartProvider>
          <ClientShell>{children}</ClientShell>
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
