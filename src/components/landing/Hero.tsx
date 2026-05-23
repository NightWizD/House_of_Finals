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

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-12"
      >
        <span className="font-display text-xl tracking-widest">HOF/2026</span>
        <div className="hidden gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <a href="#matches" className="transition hover:text-foreground">Matches</a>
          <a href="#venue" className="transition hover:text-foreground">Venue</a>
          <a href="#book" className="transition hover:text-foreground">Book</a>
        </div>
        <a
          href="#book"
          className="rounded-full border border-border bg-foreground px-4 py-2 text-xs font-medium uppercase tracking-widest text-background transition hover:opacity-80"
        >
          Reserve
        </a>
      </motion.nav>

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:text-xs"
        >
          Ahmedabad finally gets a <span className="italic text-foreground">real finals atmosphere</span>
        </motion.p>

        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mt-6 text-[18vw] leading-[0.85] md:text-[10rem] lg:text-[12rem]"
        >
          THE HOUSE
        </motion.h1>
        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-stroke text-[18vw] leading-[0.85] md:text-[10rem] lg:text-[12rem]"
        >
          OF FINALS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs uppercase tracking-[0.35em] text-muted-foreground"
        >
          UCL · IPL · Rooftop · 20 Floors Up
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
      >
        <span className="inline-block animate-bounce">↓</span> Scroll
      </motion.div>
    </section>
  );
}
