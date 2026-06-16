"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Copy, ExternalLink } from "lucide-react";

interface CreatedInvoice {
  url: string;
  bookingId: string;
}

export function CustomInvoiceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedInvoice | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [total, setTotal] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setSessionType("");
    setSessionDate("");
    setSessionTime("");
    setTotal("");
    setDescription("");
    setError("");
    setCreated(null);
    setCopyState("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          sessionType,
          sessionDate,
          sessionTime,
          total: Number(total),
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create invoice.");
        setSubmitting(false);
        return;
      }
      setCreated({ url: data.invoiceUrl, bookingId: data.bookingId });
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
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 btn-sage-dark"
        >
          <Plus size={16} /> New custom invoice
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl text-charcoal">New custom invoice</h2>
        <button
          onClick={() => {
            setOpen(false);
            // keep `created` so user can re-open later? simpler: reset on close
            reset();
          }}
          aria-label="Close"
          className="text-medium-gray hover:text-charcoal transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      {created ? (
        // ---- Success state: show the hosted invoice link --------------
        <div className="space-y-4">
          <div className="rounded-md bg-sage/15 border border-sage/30 p-4">
            <p className="text-charcoal font-medium mb-1">Invoice sent</p>
            <p className="text-medium-gray text-sm">
              Stripe emailed the hosted invoice to {email || "the client"}. You can also share the
              payment link directly:
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
            <Field label="Session type" required>
              <input
                type="text"
                required
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="form-input"
                placeholder="Wedding, Branding, etc."
              />
            </Field>
            <Field label="Date" required>
              <input
                type="date"
                required
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
            <Field label="Total (USD)" required>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="form-input"
                placeholder="2500"
              />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input resize-y"
              placeholder="e.g. Wedding photography — 6 hours coverage, 400+ edited images, online gallery."
            />
          </Field>

          {error && (
            <p className="bg-error/10 border border-error/30 text-error rounded-md p-3 text-sm">
              {error}
            </p>
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
              {submitting ? "Creating…" : "Create & send invoice"}
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
