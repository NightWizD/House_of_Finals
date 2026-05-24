import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import heroImg from "@/assets/hero-bw.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-background"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroImg}
          alt="Football and cricket players under stadium floodlights"
          className="h-full w-full object-cover opacity-60"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background" />
        <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-40" />
      </motion.div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 py-4 md:px-12 md:py-6"
      >
        <span className="font-display text-base tracking-widest md:text-xl">HOF/2026</span>
        <div className="hidden gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <a href="#matches" className="transition hover:text-foreground">Matches</a>
          <a href="#venue" className="transition hover:text-foreground">Venue</a>
          <a href="#book" className="transition hover:text-foreground">Book</a>
        </div>
        <a
          href="#book"
          className="rounded-full border border-border bg-foreground px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-background transition hover:opacity-80 active:scale-95 md:px-5 md:py-2.5 md:text-xs"
        >
          Reserve
        </a>
      </motion.nav>

      {/* Hero Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center md:px-6"
      >
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground md:text-xs"
        >
          Ahmedabad finally gets a <span className="italic text-foreground">real finals atmosphere</span>
        </motion.p>

        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mt-4 text-[17vw] leading-[0.88] sm:text-[16vw] md:text-[9rem] lg:text-[12rem]"
        >
          THE HOUSE
        </motion.h1>
        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-stroke text-[17vw] leading-[0.88] sm:text-[16vw] md:text-[9rem] lg:text-[12rem]"
        >
          OF FINALS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-5 text-[9px] uppercase tracking-[0.3em] text-muted-foreground md:mt-8 md:text-xs"
        >
          UCL · IPL · Rooftop · 20 Floors Up
        </motion.p>

        {/* Mobile CTA button */}
        <motion.a
          href="#book"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-foreground/40 px-7 py-3 text-[10px] uppercase tracking-[0.25em] text-foreground transition hover:bg-foreground hover:text-background active:scale-95 md:hidden"
        >
          Book a seat <span className="animate-bounce inline-block">↓</span>
        </motion.a>
      </motion.div>

      {/* Desktop scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block"
      >
        <span className="inline-block animate-bounce">↓</span> Scroll
      </motion.div>
    </section>
  );
}
