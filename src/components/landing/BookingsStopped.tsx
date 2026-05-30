import { useEffect } from "react";
import { motion } from "motion/react";

export function BookingsStopped() {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookings-stopped-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl p-3 md:p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-4xl h-[94vh] md:h-[88vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_0_80px_rgba(245,158,11,0.15)] md:p-16"
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-500 via-red-500 to-amber-500" />

        {/* Grain overlay */}
        <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30 pointer-events-none" />

        <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500 md:mb-7 md:text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            Important Notice
          </motion.span>

          <motion.h2
            id="bookings-stopped-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[14vw] leading-[0.9] sm:text-6xl md:text-8xl"
          >
            BOOKINGS
            <br />
            <span className="text-stroke">STOPPED</span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="my-5 h-px w-20 origin-center bg-foreground/30 md:my-7"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-base leading-relaxed text-foreground/80 md:text-xl"
          >
            Limited{" "}
            <span className="font-semibold text-foreground">walk-in seats</span>{" "}
            are still available at the venue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15 }}
            className="mt-7 w-full max-w-md rounded-xl border border-border/60 bg-background/40 p-5 backdrop-blur-sm md:mt-10 md:p-6"
          >
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:text-xs">
              For Inquiry, Contact
            </p>
            <a
              href="tel:+918401401312"
              className="font-display block text-2xl text-foreground transition hover:text-amber-500 md:text-4xl"
            >
              +91 84014 01312
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-7 text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:mt-10 md:text-xs"
          >
            See you at the rooftop · 31 May 2026
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
