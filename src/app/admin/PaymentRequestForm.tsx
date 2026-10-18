"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Copy, ExternalLink } from "lucide-react";

interface Created {
  url: string;
  emailed: boolean;
  warning?: string;
}

/**
 * A payment link for a client who didn't book through the site (a wedding, a
 * referral). The client pays on the same /pay page, tip option included.
 */
export function PaymentRequestForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState("");
  const [description, setDescription] = useState("");
  const [tipEnabled, setTipEnabled] = useState(true);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setSessionType("");
    setSessionDate("");
    setSessionTime("");
    setAmountDue("");
    setAlreadyPaid("");
    setDescription("");
    setTipEnabled(true);
    setError("");
    setCreated(null);
    setCopyState("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          sessionType,
          sessionDate,
          sessionTime,
          amountDue: Number(amountDue),
          alreadyPaid: alreadyPaid ? Number(alreadyPaid) : 0,
          description,
          tipEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create the payment request.");
        setSubmitting(false);
        return;
      }
      setCreated({ url: data.url, emailed: data.emailed, warning: data.warning });
      setSubmitting(false);
      router.refresh(); // pull the new booking into the dashboard list
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!created?.url) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  if (!open) {
    return (
      <div className="mb-6 flex justify-end">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 btn-sage-dark">
          <Plus size={16} /> New payment request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl text-charcoal">New payment request</h2>
        <button
          onClick={() => {
            setOpen(false);
            reset();
          }}
          aria-label="Close"
          className="text-medium-gray hover:text-charcoal transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      {created ? (
        // ---- Success state: show the payment link ----------------------
        <div className="space-y-4">
          <div
            className={`rounded-md p-4 border ${
              created.emailed ? "bg-sage/15 border-sage/30" : "bg-warning/10 border-warning/30"
            }`}
          >
            <p className="text-charcoal font-medium mb-1">
              {created.emailed ? "Payment link sent" : "Payment link created"}
            </p>
            <p className="text-medium-gray text-sm">
              {created.emailed
                ? `Emailed to ${email}. You can also text them the link:`
                : created.warning || "Copy the link and send it to them:"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={created.url}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 border border-beige rounded-md px-3 py-2 text-sm text-charcoal bg-off-white"
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-charcoal/20 text-sm text-charcoal hover:bg-charcoal hover:text-white transition-colors"
            >
              <Copy size={14} />
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
            <a
              href={created.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-charcoal/20 text-sm text-charcoal hover:bg-charcoal hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
              Open
            </a>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-medium-gray hover:text-charcoal transition-colors"
            >
              Create another
            </button>
          </div>
        </div>
      ) : (
        // ---- Form ------------------------------------------------------
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client name" required>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="jane@example.com"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                placeholder="(555) 123-4567"
              />
            </Field>
            <Field label="What it's for" required>
              <input
                type="text"
                required
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="form-input"
                placeholder="Wedding, Branding, etc."
              />
            </Field>
            <Field label="Session date">
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Time">
              <input
                type="text"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="form-input"
                placeholder="e.g. 2:00 PM"
              />
            </Field>
            <Field label="Amount due now (USD)" required>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                className="form-input"
                placeholder="2000"
              />
            </Field>
            <Field label="Already paid (USD)">
              <input
                type="number"
                min={0}
                step={1}
                value={alreadyPaid}
                onChange={(e) => setAlreadyPaid(e.target.value)}
                className="form-input"
                placeholder="e.g. a 500 retainer"
              />
            </Field>
          </div>

          <Field label="Notes (only you see these)">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input resize-y"
              placeholder="e.g. 6 hours coverage, second shooter."
            />
          </Field>

          <label className="flex items-start gap-3 text-sm text-charcoal cursor-pointer">
            <input
              type="checkbox"
              checked={tipEnabled}
              onChange={(e) => setTipEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-olive"
            />
            <span>
              Offer an optional tip
              <span className="block text-xs text-medium-gray">
                5%, 10% or 15% of the full price, or a custom amount. &quot;No tip&quot; is selected by
                default.
              </span>
            </span>
          </label>

          {error && (
            <p className="bg-error/10 border border-error/30 text-error rounded-md p-3 text-sm">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="text-sm text-medium-gray hover:text-charcoal transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-sage-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Create & send link"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-medium-gray mb-1.5">
        {label} {required && <span className="text-dusty-rose">*</span>}
      </span>
      {children}
    </label>
  );
}
