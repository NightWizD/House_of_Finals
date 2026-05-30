import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { Booking } from "@/components/landing/Booking";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { BookingsStopped } from "@/components/landing/BookingsStopped";

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
      <Booking />
      <SiteFooter />
      <BookingsStopped />
    </main>
  );
}
