import { motion } from "motion/react";

const ITEMS = [
  "UCL FINAL",
  "★",
  "IPL FINAL",
  "★",
  "ROOFTOP SCREENING",
  "★",
  "200 SEATS",
  "★",
  "AHMEDABAD",
  "★",
  "20 FLOORS UP",
  "★",
];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-background py-6">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className="font-display mx-8 text-4xl tracking-widest text-foreground/70 md:text-6xl"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
