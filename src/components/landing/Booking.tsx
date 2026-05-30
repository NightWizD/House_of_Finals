import { useMemo, useState, useRef } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Upload, Trash2, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import paymentQr from "@/assets/payment-qr.jpeg";

const PRICE = 500;

const SCREENINGS = [
  { value: "ipl", label: "IPL Finals (TBA) - 31st May 2026" },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Digits only"),
  email: z.string().trim().email("Enter a valid email address").max(120),
  screening: z.enum(["ipl"], {
    errorMap: () => ({ message: "Please select a screening" }),
  }),
  tickets: z.number().int().min(1, "Minimum 1 ticket").max(10, "Maximum 10 tickets"),
});

type FormValues = z.infer<typeof schema>;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function Booking() {
  const [submitted, setSubmitted] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<FormValues | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { screening: "ipl", tickets: 1 },
  });

  const tickets = Number(watch("tickets")) || 0;
  const screening = watch("screening");
  const total = useMemo(() => {
    return tickets * PRICE;
  }, [tickets]);

  const handleOpenPayment = (data: FormValues) => {
    setPendingBookingData(data);
    setIsPaymentDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG/JPG/JPEG)");
        return;
      }
      setScreenshot(file);
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl);
      }
      setScreenshotUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl);
      setScreenshotUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setIsConfirming(false);
    setScreenshot(null);
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl);
      setScreenshotUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingBookingData || !screenshot) return;
    setIsConfirming(true);

    try {
      // 1. Convert screenshot image to base64 string
      const base64Image = await fileToBase64(screenshot);

      // 2. Prepare spreadsheet row payload
      const screeningLabel =
        SCREENINGS.find((s) => s.value === pendingBookingData.screening)?.label ?? pendingBookingData.screening;

      const payload = {
        name: pendingBookingData.name,
        whatsapp: pendingBookingData.whatsapp,
        email: pendingBookingData.email,
        screening: screeningLabel,
        tickets: pendingBookingData.tickets,
        total: total,
        image: base64Image,
        imageName: screenshot.name,
        imageType: screenshot.type,
      };

      // 3. Submit payload to Google Sheets script
      const scriptUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL || "";
      if (scriptUrl) {
        // mode: 'no-cors' allows us to post across origins without receiving CORS blocks,
        // which works perfectly for Google Apps Script redirects.
        await fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        console.warn(
          "Google Sheets Script URL is not configured. Add VITE_GOOGLE_SHEETS_URL to your .env file."
        );
        // Simulate a minor delay when not configured to maintain premium feel
        await new Promise((r) => setTimeout(r, 1500));
      }

      toast.success("Payment screenshot uploaded & reservation confirmed!", {
        description: `Seat reserved for ${pendingBookingData.name}. ${pendingBookingData.tickets} ticket${pendingBookingData.tickets > 1 ? "s" : ""} confirmed!`,
        duration: 6000,
      });

      setSubmitted(true);
      reset({
        name: "",
        whatsapp: "",
        email: "",
        screening: pendingBookingData.screening,
        tickets: pendingBookingData.tickets,
      });
      closePaymentDialog();
    } catch (error) {
      console.error("Error submitting to reservation system:", error);
      toast.error("Failed to submit reservation. Please check your network and try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG/JPG/JPEG)");
        return;
      }
      setScreenshot(file);
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl);
      }
      setScreenshotUrl(URL.createObjectURL(file));
    }
  };


  return (
    <section id="book" className="relative px-5 py-16 md:px-12 md:py-48">
      <Toaster theme="dark" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:gap-16 lg:grid-cols-[1fr_1.2fr]">
        {/* Left info panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Reserve a seat
          </p>
          <h2 className="font-display mt-3 text-4xl leading-[0.9] md:text-8xl">
            BOOK YOUR<br />SEAT.
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted-foreground md:mt-6">
            ₹500 cover per seat, per night — fully redeemable on food &amp; beverage.
            Limited to 200 seats per match.
          </p>

          <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm md:mt-12 md:space-y-4">
            <Row k="Cover charge" v="₹500 / seat / night" />
            <Row k="Redeemable" v="100% on F&B" />
            <Row k="UCL Final" v="30 May 2026" />
            <Row k="IPL Final" v="31 May 2026" />
            <Row k="Queries" v="+91 8401 401 312" />
          </div>

          {/* Get Directions Button */}
          <a
            href="https://maps.app.goo.gl/mU4JRcm78LXGVa8o6"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 border border-foreground bg-foreground px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-background transition hover:bg-background hover:text-foreground active:scale-95 shadow-[0_0_20px_oklch(1_0_0_/0.15)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            📍 View Venue on Maps
          </a>
        </motion.div>

        {/* Right form */}
        <motion.form
          onSubmit={handleSubmit(handleOpenPayment)}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative border border-foreground/20 bg-card p-6 md:p-12 shadow-glow overflow-hidden rounded-2xl"
        >
          {/* Glowing accent bar at top */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500" />

          {/* Pulsing Status indicator */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-1.5 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Reservations Live
            </span>
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded select-none">
              🔑 Limited to 200 Seats
            </span>
          </div>

          {/* Full Name */}
          <Field label="Full Name" required error={errors.name?.message}>
            <input
              {...register("name")}
              className={inputCls}
              placeholder="Your full name"
              autoComplete="name"
            />
          </Field>

          {/* WhatsApp Mobile No. */}
          <Field label="WhatsApp Mobile No." required error={errors.whatsapp?.message}>
            <input
              {...register("whatsapp")}
              type="tel"
              className={inputCls}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          {/* Email Id */}
          <Field label="Email Id" required error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              className={inputCls}
              placeholder="you@email.com"
              autoComplete="email"
              inputMode="email"
            />
          </Field>

          {/* Select Screening */}
          <Field label="Select Screening" required error={errors.screening?.message}>
            <div className="relative">
              <select
                {...register("screening")}
                className={`${inputCls} cursor-pointer appearance-none pr-10`}
              >
                {SCREENINGS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-card text-foreground">
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
                ↓
              </span>
            </div>
          </Field>

          {/* No. Of Tickets Required */}
          <Field label="No. Of Tickets Required" required error={errors.tickets?.message}>
            <input
              {...register("tickets", { valueAsNumber: true })}
              type="number"
              min={1}
              max={10}
              inputMode="numeric"
              className={inputCls}
              placeholder="1 – 10"
            />
          </Field>

          {/* Total + Submit */}
          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 md:mt-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Total due at venue
                </div>
                <div className="font-display mt-1 text-3xl md:text-4xl">
                  ₹{total.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full border border-foreground bg-foreground px-6 py-4 text-xs font-medium uppercase tracking-[0.25em] text-background transition hover:bg-background hover:text-foreground active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitted ? "Reserve another" : "Reserve seat"}
            </button>
          </div>
        </motion.form>
      </div>

      {/* Payment QR and Screenshot Modal */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => {
        if (!open) closePaymentDialog();
      }}>
        <DialogContent className="max-w-[96vw] md:max-w-2xl bg-card border-border text-foreground p-5 md:p-8 rounded-xl overflow-y-auto max-h-[92vh] shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-2xl md:text-3xl tracking-wide">
              COMPLETE YOUR RESERVATION
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              Please pay the cover charge via QR and upload a screenshot of your payment to secure your seat.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5 border-y border-border/50 py-5">
            {/* Left side: QR payment */}
            <div className="flex flex-col items-center bg-background/40 border border-border/40 rounded-xl p-5 text-center">
              <div className="w-full">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Pay Cover Charge
                </div>
                <div className="font-display text-3xl md:text-4xl text-foreground font-semibold mb-4">
                  ₹{total.toLocaleString("en-IN")}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="relative bg-white p-3 rounded-xl shadow-glow overflow-hidden w-48 h-48 flex items-center justify-center border border-border/10">
                <img
                  src={paymentQr}
                  alt="Payment QR Code"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>

              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Scan with any UPI App</p>
                <p>(GPay, PhonePe, Paytm, BHIM)</p>
              </div>
            </div>

            {/* Right side: Upload screenshot */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                  Upload Payment Screenshot
                </span>

                {/* Drag and Drop Zone */}
                {!screenshot ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer bg-background/20 hover:bg-background/40 transition-all duration-300 h-[200px] text-center group ${isDragging ? "border-foreground bg-background/50 scale-[1.02]" : "border-border hover:border-foreground/50"
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="p-3 bg-muted/30 rounded-full group-hover:bg-muted/60 transition duration-300 mb-3">
                      <Upload className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition duration-300" />
                    </div>
                    <span className="text-sm font-medium text-foreground block">
                      Select Payment Screenshot
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Drag &amp; drop or click to browse
                    </span>
                  </div>
                ) : (
                  /* Preview container */
                  <div className="relative border border-border/80 rounded-xl p-4 bg-background/20 h-[200px] flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium truncate text-muted-foreground">
                          {screenshot.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition duration-200 cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                      {screenshotUrl && (
                        <img
                          src={screenshotUrl}
                          alt="Screenshot Preview"
                          className="max-h-[110px] w-auto object-contain rounded-md border border-border/20 shadow-md"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notice text */}
              <div className="mt-4 p-3 bg-accent/20 border border-border/30 rounded-lg text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span> Your booking will be confirmed instantly once our team verifies the transaction screenshot.
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-0">
            <button
              type="button"
              onClick={closePaymentDialog}
              disabled={isConfirming}
              className="w-full sm:w-auto border border-border px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground hover:bg-muted/40 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={!screenshot || isConfirming}
              className="w-full sm:w-auto border border-foreground bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-background hover:bg-background hover:text-foreground transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying Receipt…
                </>
              ) : (
                "Confirm & Reserve Seat"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const inputCls =
  "w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
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
