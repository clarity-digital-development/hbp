import { redirect } from "next/navigation";
import type { Booking, Inquiry } from "@prisma/client";
import { isAuthed } from "@/lib/admin-auth";
import { prisma, isDbConfigured } from "@/lib/db";
import { LogoutButton } from "./AdminControls";
import { BookingCard } from "./BookingCard";
import { InquiryCard } from "./InquiryCard";
import { CustomInvoiceForm } from "./CustomInvoiceForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthed())) {
    redirect("/admin/login");
  }

  let bookings: Booking[] = [];
  let inquiries: Inquiry[] = [];
  let dbError = false;
  if (isDbConfigured()) {
    try {
      [bookings, inquiries] = await Promise.all([
        prisma.booking.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } }),
      ]);
    } catch {
      dbError = true;
    }
  }
  const newInquiries = inquiries.filter((q) => q.status === "new").length;

  return (
    <main className="min-h-screen bg-off-white">
      <div className="container-custom py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-charcoal">Dashboard</h1>
            <p className="text-medium-gray text-sm mt-1">
              {bookings.length} booking{bookings.length === 1 ? "" : "s"}
              {" · "}
              {inquiries.length} inquir{inquiries.length === 1 ? "y" : "ies"}
              {newInquiries > 0 ? ` (${newInquiries} new)` : ""}
            </p>
          </div>
          <LogoutButton />
        </div>

        {isDbConfigured() && !dbError && <CustomInvoiceForm />}

        {/* Inquiries first: they are the time-sensitive item, and until now they
            existed only as email and never reached this page at all. */}
        {isDbConfigured() && !dbError && (
          <section className="mb-12">
            <h2 className="font-display text-2xl text-charcoal mb-4">Inquiries</h2>
            {inquiries.length === 0 ? (
              <Notice title="No inquiries yet">
                Messages from the contact form and the wedding path on the booking page will
                appear here as they come in.
              </Notice>
            ) : (
              <div className="space-y-4">
                {inquiries.map((q) => (
                  <InquiryCard key={q.id} inquiry={q} />
                ))}
              </div>
            )}
          </section>
        )}

        {isDbConfigured() && !dbError && (
          <h2 className="font-display text-2xl text-charcoal mb-4">Bookings</h2>
        )}

        {!isDbConfigured() ? (
          <Notice title="Database not connected">
            Add a PostgreSQL service in Railway and set <code>DATABASE_URL</code>, then redeploy.
            Bookings will appear here automatically as deposits are paid.
          </Notice>
        ) : dbError ? (
          <Notice title="Couldn't load bookings">
            The database is configured but the query failed. Make sure the schema has been pushed
            (<code>prisma db push</code>) and the connection string is correct.
          </Notice>
        ) : bookings.length === 0 ? (
          <Notice title="No bookings yet">
            Paid deposits will show up here. Each booking that still has a balance can be sent a
            Stripe invoice for the remainder.
          </Notice>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-xl mx-auto">
      <h2 className="font-display text-xl text-charcoal mb-2">{title}</h2>
      <p className="text-medium-gray text-sm leading-relaxed">{children}</p>
    </div>
  );
}
