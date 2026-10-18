"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { CHRISTMAS_MINIS as MINI, miniTotals, type MiniAddOnId } from "@/lib/minis";

export type MiniSlot = { time: string; open: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  "w-full border border-beige rounded-md px-4 py-3 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-dusty-rose";

export function MiniBookingForm({ slots }: { slots: MiniSlot[] }) {
  const router = useRouter();
  const timesRef = useRef<HTMLDivElement>(null);
  const payRef = useRef<HTMLDivElement>(null);

  const [time, setTime] = useState<string | null>(null);
  const [justTaken, setJustTaken] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [people, setPeople] = useState("");
  const [children, setChildren] = useState<"" | "Yes" | "No">("");
  const [requests, setRequests] = useState("");
  const [addOns, setAddOns] = useState<MiniAddOnId[]>([]);
  // Nothing preselected: the client chooses full payment or the deposit.
  const [payInFull, setPayInFull] = useState<boolean | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [cancelled, setCancelled] = useState(false);

  // Back from Stripe without paying: free the slot that was held for them.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hold = params.get("hold");
    if (params.get("canceled") !== "1") return;
    setCancelled(true);
    // Replacing the URL also re-renders the page, so the freed time shows as open.
    const reload = () => router.replace(window.location.pathname, { scroll: false });
    if (!hold) return reload();
    fetch("/api/minis/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hold }),
    })
      .catch(() => {})
      .finally(reload);
  }, [router]);

  const isOpen = (s: MiniSlot) => s.open && !justTaken.includes(s.time);
  const peopleCount = Number(people);
  const errors = {
    time: !time,
    fullName: !fullName.trim(),
    phone: !phone.trim(),
    email: !EMAIL_RE.test(email.trim()),
    people: !Number.isInteger(peopleCount) || peopleCount < 1 || peopleCount > 30,
    children: !children,
    payment: payInFull === null,
  };
  const isValid = !Object.values(errors).some(Boolean);
  const { total } = miniTotals(true, addOns);
  const due = payInFull === null ? null : miniTotals(payInFull, addOns);

  const toggleAddOn = (id: MiniAddOnId) =>
    setAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const handlePay = async () => {
    if (!isValid) {
      setShowErrors(true);
      // Jump to the payment choice when that's all that's missing; otherwise to the top.
      const onlyPayment = Object.entries(errors).every(([k, v]) => k === "payment" || !v);
      (onlyPayment ? payRef : timesRef).current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch("/api/minis/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, fullName, phone, email, people: peopleCount, children, requests, addOns, payInFull }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.taken && time) {
        // Someone got there first: grey that time out and send them back to pick another.
        setJustTaken((prev) => [...prev, time]);
        setTime(null);
        timesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        router.refresh();
      }
      setPayError(data.error || "Could not start checkout. Please try again.");
    } catch {
      setPayError("Network error. Please try again.");
    }
    setPaying(false);
  };

  return (
    <div className="space-y-10">
      {cancelled && (
        <div className="bg-warning/10 border border-warning/30 text-charcoal rounded-lg p-4 text-sm">
          Payment was cancelled and nothing was charged. Your time is open again if you&apos;d
          still like it.
        </div>
      )}
      {showErrors && !isValid && (
        <div className="bg-error/10 border border-error/30 text-error rounded-lg p-4 text-sm">
          Please complete the required fields marked with an asterisk (*).
        </div>
      )}

      {/* Time */}
      <div ref={timesRef} className="scroll-mt-28">
        <Field label="Choose a time" required error={showErrors && errors.time}>
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-charcoal mb-3">
              Saturday, November 21 · {MINI.minutes}-minute sessions
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {slots.map((slot) => {
                const open = isOpen(slot);
                const active = time === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!open}
                    onClick={() => setTime(slot.time)}
                    aria-pressed={active}
                    className={`px-2 py-2 rounded-full text-xs sm:text-sm border transition-colors text-center whitespace-nowrap ${
                      active
                        ? "bg-dusty-rose text-white border-dusty-rose"
                        : open
                          ? "border-beige text-charcoal hover:border-dusty-rose"
                          : "border-beige/60 text-medium-gray/50 line-through cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
            {slots.some((s) => !isOpen(s)) && (
              <p className="text-xs text-medium-gray mt-3">Crossed-out times are already booked.</p>
            )}
          </div>
        </Field>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Full name" htmlFor="mini-name" required error={showErrors && errors.fullName}>
          <input
            id="mini-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className={inputClass}
          />
        </Field>
        <Field label="Phone number" htmlFor="mini-phone" required error={showErrors && errors.phone}>
          <input
            id="mini-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(502) 555-0123"
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        label="Email address"
        htmlFor="mini-email"
        required
        error={showErrors && errors.email}
        errorText={email.trim() ? "Please enter a valid email." : undefined}
      >
        <input
          id="mini-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>

      {/* Intake */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="How many people will be in the photos?" htmlFor="mini-people" required error={showErrors && errors.people}>
          <input
            id="mini-people"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="e.g. 4"
            className={inputClass}
          />
        </Field>
        <Field label="Any children?" required error={showErrors && errors.children}>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Any children?">
            {(["Yes", "No"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={children === v}
                onClick={() => setChildren(v)}
                className={`rounded-md border px-4 py-3 transition-all ${
                  children === v
                    ? "border-dusty-rose ring-1 ring-dusty-rose bg-white text-charcoal"
                    : "border-beige bg-white text-charcoal hover:border-dusty-rose/50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <Field label="Any specific asks or requests?" htmlFor="mini-requests" optional>
        <textarea
          id="mini-requests"
          value={requests}
          onChange={(e) => setRequests(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="A pose you love, a pet joining, anything I should know"
          className={`${inputClass} resize-y`}
        />
      </Field>

      {/* Add-ons */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-display text-xl text-charcoal">Add-ons</h3>
          <span className="text-xs uppercase tracking-wider text-medium-gray">Optional</span>
        </div>
        <p className="text-medium-gray text-sm mb-4">Add-ons are paid when you book.</p>
        <div className="bg-white rounded-lg shadow-sm divide-y divide-beige">
          {MINI.addOns.map((a) => {
            const on = addOns.includes(a.id);
            return (
              <label key={a.id} className="flex items-start gap-4 p-4 sm:p-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleAddOn(a.id)}
                  className="mt-1 h-4 w-4 accent-olive shrink-0"
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-charcoal">{a.label}</span>
                  <span className="block text-sm text-medium-gray">{a.detail}</span>
                </span>
                <span className="text-charcoal whitespace-nowrap">+${a.price}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Payment option */}
      <div ref={payRef} className="scroll-mt-28">
        <h3 className="font-display text-xl text-charcoal mb-4">
          How would you like to pay?<span className="text-dusty-rose ml-1">*</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Payment option">
          <PayOption
            active={payInFull === true}
            onClick={() => setPayInFull(true)}
            title="Pay in full"
            price={`$${MINI.price}`}
            detail="Nothing left to pay after your session."
          />
          <PayOption
            active={payInFull === false}
            onClick={() => setPayInFull(false)}
            title="Pay a deposit"
            price={`$${MINI.deposit}`}
            detail={`The other $${MINI.price - MINI.deposit} is due after your session — I'll email you a secure link.`}
          />
        </div>
        {showErrors && errors.payment && (
          <p className="text-error text-sm mt-2">Please choose how you&apos;d like to pay.</p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <dl className="space-y-2 text-sm">
          <Line label="Christmas mini session">${MINI.price}</Line>
          {MINI.addOns
            .filter((a) => addOns.includes(a.id))
            .map((a) => (
              <Line key={a.id} label={a.label}>
                ${a.price}
              </Line>
            ))}
          {addOns.length > 0 && <Line label="Total">${total}</Line>}
        </dl>
        <div className="border-t border-beige mt-5 pt-5 flex justify-between items-baseline">
          <span className="font-display text-lg text-charcoal">Due today</span>
          <span className="font-display text-3xl text-olive">{due ? `$${due.dueNow}` : "—"}</span>
        </div>
        {!due ? (
          <p className="text-xs text-medium-gray pt-1">Choose how you&apos;d like to pay above.</p>
        ) : (
          due.balance > 0 && (
            <p className="text-xs text-medium-gray pt-1">
              Remaining ${due.balance} is due after your session.
            </p>
          )
        )}

        {payError && (
          <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 text-sm mt-5" role="alert">
            {payError}
          </div>
        )}
        <button
          type="button"
          onClick={handlePay}
          disabled={paying}
          className="btn-olive w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {paying
            ? "Redirecting to secure checkout…"
            : [time ? `Reserve ${time}` : "Reserve my spot", due && `Pay $${due.dueNow}`].filter(Boolean).join(" · ")}
        </button>
        <p className="text-xs text-medium-gray mt-4 text-center">
          🔒 Secure payment powered by Stripe. Your time is held for you while you check out.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  optional,
  error,
  errorText,
  children,
}: {
  label: string;
  /** The input this label names; omitted for grouped controls (time, yes/no). */
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  errorText?: string;
  children: React.ReactNode;
}) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <div>
      <Tag htmlFor={htmlFor} className="block text-sm tracking-wider uppercase text-medium-gray mb-3">
        {label}
        {required && <span className="text-dusty-rose ml-1">*</span>}
        {optional && <span className="text-medium-gray/60 ml-1 normal-case">(optional)</span>}
      </Tag>
      {children}
      {error && <p className="text-error text-sm mt-2">{errorText || "This field is required."}</p>}
    </div>
  );
}

function PayOption({
  active,
  onClick,
  title,
  price,
  detail,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`relative text-left rounded-lg border p-4 transition-all ${
        active ? "border-dusty-rose ring-1 ring-dusty-rose bg-white" : "border-beige bg-white hover:border-dusty-rose/50"
      }`}
    >
      {active && (
        <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-dusty-rose text-white flex items-center justify-center">
          <Check size={12} />
        </span>
      )}
      <p className="font-display text-lg text-charcoal">{title}</p>
      <p className="text-dusty-rose font-display text-xl">{price}</p>
      <p className="text-xs text-medium-gray mt-1 pr-4">{detail}</p>
    </button>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-medium-gray">{label}</dt>
      <dd className="text-charcoal text-right">{children}</dd>
    </div>
  );
}
