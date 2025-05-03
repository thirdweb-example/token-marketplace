"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThirdwebProvider } from "thirdweb/react";
import Footer from "@/components/Footer";
import { client } from "./client";

const inter = Inter({ subsets: ["latin"] });

// Metadata is not available in client components, so we'll define it separately


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThirdwebProvider>
            {children}
            <Footer />
          </ThirdwebProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
