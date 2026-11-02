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
  verification: {
    google: "GbC4iQo_pxMJ6fUDW5BO4nwUFo9y4zXr_uWH-_JREw0",
  },
};

// Tawk.to Widget ID (আপনার দেওয়া কোড থেকে নেওয়া)
const TAWK_TO_ID = "6ae83742aa99a33c309a20d0/1k6dhfnja";

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={`${inter.className} antialiased`}>
        <CartProvider>
          <ClientShell>{children}</ClientShell>
          <Toast />
        </CartProvider>

        {/* ✅ Tawk.to Chatbot Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/${TAWK_TO_ID}/default';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
