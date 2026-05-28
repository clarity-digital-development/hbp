"use client";

import { useState } from "react";
import type { Booking } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { SendInvoiceButton } from "./AdminControls";

function StatusPill({ booking: b }: { booking: Booking }) {
  if (b.paidInFull) {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-sage/20 text-sage-dark whitespace-nowrap">
        Paid in full
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
  const hasNotes = Boolean(b.notes && b.notes.trim());
  const hasInvoiceButton = !b.paidInFull && b.balance > 0;

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
          <p className="text-medium-gray text-xs">${b.deposit} deposit</p>
        </Field>
        <Field label="Balance">
          <p className={b.paidInFull ? "text-medium-gray" : ""}>${b.paidInFull ? 0 : b.balance}</p>
        </Field>
      </div>

      {b.prints && (
        <p className="text-xs text-medium-gray mb-4">
          <span className="uppercase tracking-wider">Prints</span> · {b.prints}
        </p>
      )}

      {/* Actions */}
      {(hasInvoiceButton || hasNotes) && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-beige/60">
          {hasInvoiceButton && (
            <SendInvoiceButton bookingId={b.id} alreadySent={Boolean(b.balanceInvoiceId)} />
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
