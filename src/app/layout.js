import "./globals.css";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-bengali",
});

export const metadata = {
  title: "রূপসী - কসমেটিক শপ",
  description:
    "রূপসী - তোমার বিশ্বস্ত কসমেটিক শপ। স্কিনকেয়ার, মেকআপ ও হেয়ারকেয়ার পণ্যে ভরা আমাদের কালেকশন।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={`${notoSansBengali.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
