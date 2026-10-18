import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Toast from "@/components/Toast";
import Navbar from "@/components/Navbar";
import GlobalFooter from "@/components/Footer";

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
          <div className="flex min-h-screen flex-col bg-[#fdf8f9]">
            <Navbar />
            <main className="flex-1">{children}</main>
            <GlobalFooter />
          </div>
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
