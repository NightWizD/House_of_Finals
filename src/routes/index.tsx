import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Matches } from "@/components/landing/Matches";
import { Venue } from "@/components/landing/Venue";
import { Booking } from "@/components/landing/Booking";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The House of Finals — UCL & IPL Screening, Ahmedabad" },
      {
        name: "description",
        content:
          "Ahmedabad's rooftop finals screening — UCL Final 30 May & IPL Final 31 May at Praveg's Grand Eulogia. Book your seat.",
      },
      { property: "og:title", content: "The House of Finals — Ahmedabad" },
      {
        property: "og:description",
        content: "UCL & IPL Finals screening on a 20-floor rooftop. Limited seats.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <Marquee />
      <Matches />
      <Venue />
      <Booking />
      <SiteFooter />
    </main>
  );
}
