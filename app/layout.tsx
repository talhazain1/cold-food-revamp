import type { Metadata } from "next";
import AnnouncementSlider from "@/components/AnnouncementSlider";
import { Providers } from "@/components/providers";
import SiteShell from "@/components/SiteShell";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ready2Cook",
  description: "Ready-to-cook meal kits and food products in the UK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <AnnouncementSlider />
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
