"use client";

import { useState } from "react";
import type { Booking } from "@prisma/client";
import { ChevronDown, ExternalLink } from "lucide-react";
import { RequestPaymentButton } from "./AdminControls";
import { formatCents, paymentUrl } from "@/lib/payments";

function StatusPill({ booking: b }: { booking: Booking }) {
  if (b.paidInFull) {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-sage/20 text-sage-dark whitespace-nowrap">
        Paid in full
      </span>
    );
  }
  if (b.finalRequestedAt) {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-warning/20 text-charcoal whitespace-nowrap">
        Balance requested
      </span>
    );
  }
  // For a one-off custom invoice, "deposit paid" doesn't apply — there's just
  // one invoice. Until it's paid in full, show "Invoice sent".
  if (b.kind === "invoice") {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-warning/20 text-charcoal whitespace-nowrap">
        Invoice sent
      </span>
    );
  }
  if (b.depositPaid) {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-warning/20 text-charcoal whitespace-nowrap">
        Deposit paid
      </span>
    );
  }
  return (
    <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-beige text-medium-gray whitespace-nowrap">
      Pending
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-medium-gray mb-1">{label}</p>
      <div className="text-charcoal">{children}</div>
    </div>
  );
}

export function BookingCard({ booking: b }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const isInvoice = b.kind === "invoice";
  const hasNotes = Boolean(b.notes && b.notes.trim());
  // Anything with a balance gets a /pay link. Legacy Stripe-invoice bookings
  // keep their hosted invoice link instead.
  const showRequest = !isInvoice && !b.paidInFull && b.balance > 0;
  const showViewInvoice = Boolean(b.balanceInvoiceUrl);

  return (
    <article className="bg-white rounded-lg shadow-sm p-5 md:p-6">
      {/* Header — name + contact, status pill */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h3 className="font-display text-xl text-charcoal truncate">{b.fullName}</h3>
          <div className="text-sm text-medium-gray space-y-0.5 mt-1">
            <p>{b.phone}</p>
            {b.email && <p className="break-all">{b.email}</p>}
            {b.social && <p className="break-all">{b.social}</p>}
          </div>
        </div>
        <StatusPill booking={b} />
      </div>

      {/* Details grid — adapts from 1 column (small phones) → 2 → 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
        <Field label="Session">
          <p>{b.sessionType}</p>
          <p className="text-medium-gray text-xs">{b.packageName}</p>
        </Field>
        <Field label="Date">
          <p>{b.sessionDate}</p>
          <p className="text-medium-gray text-xs">{b.sessionTime}</p>
        </Field>
        <Field label="Total">
          <p>${b.total}</p>
          {!isInvoice && b.deposit > 0 && (
            <p className="text-medium-gray text-xs">
              ${b.deposit} {b.kind === "session" ? "deposit" : "paid before"}
            </p>
          )}
        </Field>
        <Field label={isInvoice ? "Due" : "Balance"}>
          <p className={b.paidInFull ? "text-medium-gray" : ""}>${b.paidInFull ? 0 : b.balance}</p>
          {b.tipCents > 0 && <p className="text-olive text-xs">{formatCents(b.tipCents)} tip</p>}
        </Field>
      </div>

      {b.addOns && (
        <p className="text-xs text-medium-gray mb-4">
          <span className="uppercase tracking-wider">Add-ons</span> · {b.addOns}
        </p>
      )}

      {b.prints && (
        <p className="text-xs text-medium-gray mb-4">
          <span className="uppercase tracking-wider">Prints</span> · {b.prints}
        </p>
      )}

      {/* Actions */}
      {(showRequest || showViewInvoice || hasNotes) && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-beige/60">
          {showRequest && (
            <RequestPaymentButton
              bookingId={b.id}
              url={b.paymentToken ? paymentUrl(b.paymentToken) : null}
              requestedAt={b.finalRequestedAt ? new Date(b.finalRequestedAt).toISOString() : null}
              hasEmail={Boolean(b.email)}
            />
          )}
          {showViewInvoice && (
            <a
              href={b.balanceInvoiceUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-sage-dark text-white hover:bg-sage-deep transition-colors"
            >
              View invoice <ExternalLink size={12} />
            </a>
          )}
          {hasNotes && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={`notes-${b.id}`}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white transition-colors"
            >
              {open ? "Hide notes" : "Notes"}
              <ChevronDown
                size={12}
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      )}

      {open && hasNotes && (
        <div
          id={`notes-${b.id}`}
          className="mt-4 bg-cream/60 rounded-md px-4 py-3 border border-beige/60"
        >
          <p className="text-xs uppercase tracking-wider text-medium-gray mb-1">Notes</p>
          <p className="text-charcoal italic leading-relaxed whitespace-pre-wrap">{b.notes}</p>
        </div>
      )}
    </article>
  );
}
