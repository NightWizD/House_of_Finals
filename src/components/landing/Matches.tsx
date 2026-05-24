import { motion } from "motion/react";
import uclImg from "@/assets/trophy-ucl.jpg";
import iplImg from "@/assets/trophy-ipl.jpg";

const MATCHES = [
  {
    tag: "Match 01",
    title: "UCL FINAL",
    date: "30 MAY 2026",
    sub: "Champions League Final",
    img: uclImg,
  },
  {
    tag: "Match 02",
    title: "IPL FINAL",
    date: "31 MAY 2026",
    sub: "Indian Premier League Final",
    img: iplImg,
  },
];

export function Matches() {
  return (
    <section id="matches" className="relative px-5 py-16 md:px-12 md:py-48">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 flex flex-col items-start justify-between gap-4 md:mb-20 md:flex-row md:items-end"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              The Lineup
            </p>
            <h2 className="font-display mt-3 text-4xl leading-[0.9] sm:text-5xl md:text-8xl">
              TWO NIGHTS.<br />ONE ROOFTOP.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Back-to-back finals on a 200-seat rooftop. Giant screens, surround sound,
            and the loudest crowd in Ahmedabad.
          </p>
        </motion.div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {MATCHES.map((m, i) => (
            <motion.article
              key={m.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden border border-border bg-card"
            >
              <div className="aspect-[16/9] overflow-hidden sm:aspect-[4/3] md:aspect-[4/5]">
                <motion.img
                  src={m.img}
                  alt={m.title}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover grayscale transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-10">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:text-xs">
                  <span>{m.tag}</span>
                  <span>{m.date}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:text-xs">
                    {m.sub}
                  </p>
                  <h3 className="font-display mt-1 text-4xl md:mt-2 md:text-7xl">{m.title}</h3>
                  <a
                    href="#book"
                    className="mt-3 inline-flex items-center gap-1 border border-foreground/40 px-5 py-2.5 text-[10px] uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background active:scale-95"
                  >
                    Book this night →
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
