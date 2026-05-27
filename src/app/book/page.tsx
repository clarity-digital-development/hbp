"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ChevronDown, ArrowLeft, Check } from "lucide-react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { formatLongDate, toISODate } from "@/lib/availability";
import { packages, addOns, computeTotals } from "@/lib/pricing";

const sessionTypeOptions = [
  "Couple",
  "Portrait",
  "Family",
  "Branding",
  "Maternity",
  "Engagement",
  "Wedding",
  "Other",
];

export default function BookPage() {
  const [step, setStep] = useState<1 | 2>(1);

  // Required + optional fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [otherType, setOtherType] = useState("");
  const [social, setSocial] = useState("");
  const [notes, setNotes] = useState("");
  const [packageName, setPackageName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(addOns.map((a) => [a.id, 0]))
  );
  const [showErrors, setShowErrors] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "cancelled") setCancelled(true);
  }, []);

  const setQty = (id: string, next: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, next) }));

  const selectedPackage = packages.find((p) => p.name === packageName);
  const { printsTotal, total, deposit, balance } = computeTotals(packageName, quantities);

  const errors = {
    fullName: !fullName.trim(),
    phone: !phone.trim(),
    sessionType: !sessionType || (sessionType === "Other" && !otherType.trim()),
    package: !packageName,
    schedule: !date || !time,
  };
  const isValid = !Object.values(errors).some(Boolean);

  const resolvedType =
    sessionType === "Other" ? otherType.trim() || "Other" : sessionType;

  const handleContinue = () => {
    if (!isValid) {
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePay = async () => {
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName,
          quantities,
          fullName,
          phone,
          social,
          sessionType: resolvedType,
          date: date ? toISODate(date) : "",
          time,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || "Something went wrong. Please try again.");
        setPaying(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
        return;
      }
      setPayError("Could not start checkout. Please try again.");
      setPaying(false);
    } catch {
      setPayError("Network error. Please try again.");
      setPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero */}
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-6"
          >
            Book Your Session
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-medium-gray text-lg max-w-2xl mx-auto"
          >
            Tell me a little about your session and pick a date that works for you.
            A 30% deposit reserves your spot.
          </motion.p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-8 text-sm">
            {["Details", "Payment"].map((label, i) => {
              const n = (i + 1) as 1 | 2;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-2 ${
                      active || done ? "text-charcoal" : "text-medium-gray"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                        active
                          ? "bg-dusty-rose text-white"
                          : done
                          ? "bg-sage text-white"
                          : "bg-beige text-medium-gray"
                      }`}
                    >
                      {done ? <Check size={14} /> : n}
                    </span>
                    {label}
                  </span>
                  {i === 0 && <span className="w-8 h-px bg-beige" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step 1 — Details */}
      {step === 1 && (
        <section className="section-padding">
          <div className="container-custom max-w-3xl space-y-10">
            {cancelled && (
              <div className="bg-warning/10 border border-warning/30 text-charcoal rounded-lg p-4 text-sm">
                Payment was cancelled and no charge was made. Your details weren&apos;t saved —
                please re-enter them to try again.
              </div>
            )}
            {showErrors && !isValid && (
              <div className="bg-error/10 border border-error/30 text-error rounded-lg p-4 text-sm">
                Please complete the required fields marked with an asterisk (*).
              </div>
            )}

            {/* Session type */}
            <Field label="Type of session" required error={showErrors && errors.sessionType}>
              <StyledSelect
                value={sessionType}
                onChange={(v) => setSessionType(v)}
                placeholder="Select a session type"
                options={sessionTypeOptions}
              />
              {sessionType === "Other" && (
                <input
                  type="text"
                  value={otherType}
                  onChange={(e) => setOtherType(e.target.value)}
                  placeholder="Tell me what you have in mind"
                  className="mt-3 w-full border border-beige rounded-md px-4 py-3 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-dusty-rose"
                />
              )}
            </Field>

            {/* Package */}
            <Field label="Session package" required error={showErrors && errors.package}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((p) => {
                  const active = packageName === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setPackageName(p.name)}
                      className={`text-left rounded-lg border p-4 transition-all ${
                        active
                          ? "border-dusty-rose ring-1 ring-dusty-rose bg-white"
                          : "border-beige bg-white hover:border-dusty-rose/50"
                      }`}
                    >
                      <p className="font-display text-lg text-charcoal">{p.name}</p>
                      <p className="text-dusty-rose font-display text-xl">${p.price}</p>
                      <p className="text-xs text-medium-gray mt-1">{p.detail}</p>
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Full name" required error={showErrors && errors.fullName}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-beige rounded-md px-4 py-3 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-dusty-rose"
                />
              </Field>
              <Field label="Phone number" required error={showErrors && errors.phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(502) 555-0123"
                  className="w-full border border-beige rounded-md px-4 py-3 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-dusty-rose"
                />
              </Field>
            </div>

            {/* Social (optional) */}
            <Field label="Social media handle" optional>
              <input
                type="text"
                value={social}
                onChange={(e) => setSocial(e.target.value)}
                placeholder="@yourhandle"
                className="w-full border border-beige rounded-md px-4 py-3 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-dusty-rose"
              />
            </Field>

            {/* Calendar */}
            <Field label="Choose a date & time" required error={showErrors && errors.schedule}>
              <BookingCalendar
                selectedDate={date}
                selectedTime={time}
                onSelectDate={setDate}
                onSelectTime={setTime}
              />
            </Field>

            {/* Notes (optional) */}
            <Field label="Notes" optional>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Anything I should know — location ideas, vision, who's joining, etc."
                className="w-full border border-beige rounded-md px-4 py-3 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-dusty-rose resize-y"
              />
            </Field>

            {/* Optional prints */}
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-display text-xl text-charcoal">Add prints</h3>
                <span className="text-xs uppercase tracking-wider text-medium-gray">
                  Optional
                </span>
              </div>
              <p className="text-medium-gray text-sm mb-4">
                Add physical prints or polaroids to your session.
              </p>
              <div className="bg-white rounded-lg shadow-sm p-6 divide-y divide-beige">
                {addOns.map((addOn) => {
                  const qty = quantities[addOn.id] || 0;
                  return (
                    <div
                      key={addOn.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="text-charcoal">{addOn.label}</p>
                        <p className="text-sm text-medium-gray">${addOn.price} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQty(addOn.id, qty - 1)}
                          disabled={qty <= 0}
                          aria-label={`Remove one ${addOn.label}`}
                          className="h-8 w-8 rounded-full border border-charcoal/30 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-charcoal"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-display text-lg w-7 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(addOn.id, qty + 1)}
                          aria-label={`Add one ${addOn.label}`}
                          className="h-8 w-8 rounded-full border border-charcoal/30 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="w-16 text-right text-charcoal">
                        ${qty * addOn.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-2">
              <button onClick={handleContinue} className="btn-sage-dark inline-block">
                Continue to Payment
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2 — Payment */}
      {step === 2 && (
        <section className="section-padding">
          <div className="container-custom max-w-2xl">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 text-sm text-medium-gray hover:text-charcoal transition-colors mb-8"
            >
              <ArrowLeft size={16} /> Back to details
            </button>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="font-display text-2xl text-charcoal mb-6">Your booking</h2>
              <dl className="space-y-3 text-sm">
                <Row label="Session">{resolvedType}</Row>
                <Row label="Package">
                  {selectedPackage?.name} (${selectedPackage?.price})
                </Row>
                <Row label="Date">{date ? formatLongDate(date) : ""}</Row>
                <Row label="Time">{time}</Row>
                <Row label="Name">{fullName}</Row>
                <Row label="Phone">{phone}</Row>
                {social.trim() && <Row label="Social">{social}</Row>}
                {printsTotal > 0 && <Row label="Prints">${printsTotal}</Row>}
              </dl>

              <div className="border-t border-beige mt-6 pt-6 space-y-2">
                <div className="flex justify-between text-medium-gray">
                  <span>Session total</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-display text-lg text-charcoal">
                    Deposit due today (30%)
                  </span>
                  <span className="font-display text-3xl text-dusty-rose">${deposit}</span>
                </div>
                <p className="text-xs text-medium-gray pt-1">
                  Remaining balance of ${balance} is due at your session.
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="font-display text-xl text-charcoal mb-4">Pay your deposit</h3>
              <p className="text-sm text-medium-gray mb-6">
                Your deposit reserves your date. After booking, I&apos;ll email you a secure link
                to pay your remaining balance whenever you&apos;re ready.
              </p>
              {payError && (
                <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 text-sm mb-4">
                  {payError}
                </div>
              )}
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-sage-dark w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? "Redirecting to secure checkout…" : `Pay $${deposit} Deposit & Reserve`}
              </button>
              <p className="text-xs text-medium-gray mt-4 text-center">
                🔒 Secure payment powered by Stripe. Your card details are never stored.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ---------- Small presentational helpers ---------- */

function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm tracking-wider uppercase text-medium-gray mb-3">
        {label}
        {required && <span className="text-dusty-rose ml-1">*</span>}
        {optional && <span className="text-medium-gray/60 ml-1 normal-case">(optional)</span>}
      </label>
      {children}
      {error && (
        <p className="text-error text-sm mt-2">This field is required.</p>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-medium-gray">{label}</dt>
      <dd className="text-charcoal text-right">{children}</dd>
    </div>
  );
}

function StyledSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-beige rounded-md px-4 py-3 bg-white text-left focus:outline-none focus:ring-2 focus:ring-dusty-rose"
      >
        <span className={value ? "text-charcoal" : "text-medium-gray"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-medium-gray transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="absolute z-20 mt-2 w-full bg-white border border-beige rounded-md shadow-lg overflow-hidden">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blush-light ${
                  value === opt ? "bg-blush-light text-charcoal" : "text-charcoal"
                }`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
