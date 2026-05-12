import type { Metadata } from "next";
import LandingContent from "@/components/LandingContent";

export const metadata: Metadata = {
  title: "Ready2Cook | Premium meal kits delivered across the UK",
  description:
    "Restaurant-quality meal kits and pantry staples — fresh ingredients, clear recipes, and reliable UK delivery from Ready2Cook.",
};

export default function HomePage() {
  return <LandingContent />;
}
