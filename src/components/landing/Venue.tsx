import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import venueImg from "@/assets/venue-bw.jpg";

export function Venue() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const stats = [
    { k: "20", v: "Floors Up" },
    { k: "200", v: "Limited Seats" },
    { k: "2", v: "Finals" },
    { k: "₹500", v: "Cover · F&B Redeemable" },
  ];

  return (
    <section id="venue" ref={ref} className="relative overflow-hidden border-y border-border">
      <motion.div style={{ y }} className="absolute inset-0 scale-125">
        <img
          src={venueImg}
          alt="Rooftop crowd watching the finals"
          loading="lazy"
          width={1600}
          height={1000}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-background/50" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6 py-32 md:px-12 md:py-48">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          ⌖ @20 Rooftop · Praveg's Grand Eulogia
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display mt-6 max-w-4xl text-5xl leading-[0.95] md:text-8xl"
        >
          TWENTY FLOORS UP.<br />
          <span className="text-stroke">UNMATCHED ENERGY.</span>
        </motion.h2>

        <div className="mt-20 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background p-8"
            >
              <div className="font-display text-5xl md:text-6xl">{s.k}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {s.v}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
