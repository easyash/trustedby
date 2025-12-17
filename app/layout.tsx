// app/layout.tsx
// Root layout with Sonner toast notifications, reCAPTCHA, and Razorpay

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // NEW: Import Script component
import "./globals.css";
import { Toaster } from "sonner";
import ReCaptchaProvider from "@/components/recaptcha-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustedBy - Collect & Display Beautiful Testimonials",
  description: "The simplest way to gather social proof and boost conversions. Built for solo founders. Just $12/month.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Load Razorpay SDK - use lazyOnload to avoid hydration issues */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="lazyOnload"
        />
        
        <ReCaptchaProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ReCaptchaProvider>
      </body>
    </html>
  );
}