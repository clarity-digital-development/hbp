import type { Inquiry } from "@prisma/client";
import { Mail, Phone, AlertTriangle } from "lucide-react";

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-warning/20 text-charcoal",
    contacted: "bg-sage/20 text-sage-dark",
    booked: "bg-sage/20 text-sage-dark",
    lost: "bg-beige text-medium-gray",
  };
  return (
    <span
      className={`inline-block text-xs px-2.5 py-1 rounded-full whitespace-nowrap capitalize ${
        styles[status] ?? styles.new
      }`}
    >
      {status}
    </span>
  );
}

export function InquiryCard({ inquiry: q }: { inquiry: Inquiry }) {
  const received = q.createdAt.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="border border-beige bg-white p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-display text-xl text-charcoal">{q.name}</p>
          <p className="text-medium-gray text-sm capitalize">
            {q.sessionType}
            {q.preferredDate ? ` · prefers ${q.preferredDate}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <StatusPill status={q.status} />
          <p className="text-xs text-medium-gray mt-1.5">{received}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm mb-3">
        <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 text-olive hover:underline">
          <Mail size={14} /> {q.email}
        </a>
        {q.phone && (
          <a href={`tel:${q.phone}`} className="flex items-center gap-1.5 text-olive hover:underline">
            <Phone size={14} /> {q.phone}
          </a>
        )}
      </div>

      <p className="text-charcoal text-sm whitespace-pre-wrap leading-relaxed">{q.message}</p>

      {!q.emailSent && (
        <p className="flex items-center gap-2 mt-3 text-xs text-error">
          <AlertTriangle size={14} />
          Saved here, but the notification email failed to send.
        </p>
      )}
    </div>
  );
}
