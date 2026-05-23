import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const PRICE = 500;

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Invalid email").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Digits only"),
  match: z.enum(["ucl", "ipl", "both"]),
  seats: z.number().int().min(1, "Min 1 seat").max(10, "Max 10 seats"),
  notes: z.string().max(280).optional(),
});

type FormValues = z.infer<typeof schema>;

export function Booking() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { match: "both", seats: 2 },
  });

  const seats = Number(watch("seats")) || 0;
  const match = watch("match");
  const total = useMemo(() => {
    const nights = match === "both" ? 2 : 1;
    return seats * PRICE * nights;
  }, [seats, match]);

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success(`Booking received — ₹${total} due at venue.`);
    setSubmitted(true);
    reset({ ...data, notes: "" });
  };

  return (
    <section id="book" className="relative px-6 py-32 md:px-12 md:py-48">
      <Toaster theme="dark" />
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Reserve a seat
          </p>
          <h2 className="font-display mt-4 text-6xl leading-[0.9] md:text-8xl">
            BOOK YOUR<br />SEAT.
          </h2>
          <p className="mt-6 max-w-md text-sm text-muted-foreground">
            ₹500 cover per seat, per night — fully redeemable on food & beverage.
            Limited to 200 seats per match.
          </p>

          <div className="mt-12 space-y-4 border-t border-border pt-8 text-sm">
            <Row k="Cover charge" v="₹500 / seat / night" />
            <Row k="Redeemable" v="100% on F&B" />
            <Row k="UCL Final" v="30 May 2026" />
            <Row k="IPL Final" v="31 May 2026" />
            <Row k="Queries" v="+91 8401 401 312" />
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="border border-border bg-card p-8 md:p-12"
        >
          <Field label="Full Name" error={errors.name?.message}>
            <input {...register("name")} className={inputCls} placeholder="Your name" />
          </Field>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} placeholder="you@email.com" />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <input {...register("phone")} className={inputCls} placeholder="+91 ..." />
            </Field>
          </div>

          <Field label="Match" error={errors.match?.message}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "ucl", l: "UCL · 30 May" },
                { v: "ipl", l: "IPL · 31 May" },
                { v: "both", l: "Both nights" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`cursor-pointer border border-border px-3 py-3 text-center text-xs uppercase tracking-widest transition ${
                    match === o.v ? "bg-foreground text-background" : "bg-background hover:bg-accent"
                  }`}
                >
                  <input type="radio" value={o.v} {...register("match")} className="sr-only" />
                  {o.l}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Seats (1–10)" error={errors.seats?.message}>
            <input
              {...register("seats")}
              type="number"
              min={1}
              max={10}
              className={inputCls}
            />
          </Field>

          <Field label="Notes (optional)" error={errors.notes?.message}>
            <textarea
              {...register("notes")}
              rows={3}
              maxLength={280}
              className={`${inputCls} resize-none`}
              placeholder="Anything we should know?"
            />
          </Field>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Total due at venue
              </div>
              <div className="font-display mt-1 text-4xl">₹{total.toLocaleString("en-IN")}</div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative overflow-hidden border border-foreground bg-foreground px-6 py-4 text-xs font-medium uppercase tracking-[0.25em] text-background transition hover:bg-background hover:text-foreground disabled:opacity-50"
            >
              {isSubmitting ? "Reserving…" : submitted ? "Reserve another" : "Reserve seat"}
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

const inputCls =
  "w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 pb-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
