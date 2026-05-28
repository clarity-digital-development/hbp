import { redirect } from "next/navigation";
import type { Booking } from "@prisma/client";
import { isAuthed } from "@/lib/admin-auth";
import { prisma, isDbConfigured } from "@/lib/db";
import { LogoutButton, SendInvoiceButton } from "./AdminControls";

export const dynamic = "force-dynamic";

function StatusPill({ booking }: { booking: Booking }) {
  if (booking.paidInFull) {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-sage/20 text-sage-dark">
        Paid in full
      </span>
    );
  }
  if (booking.depositPaid) {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-warning/20 text-charcoal">
        Deposit paid
      </span>
    );
  }
  return (
    <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-beige text-medium-gray">
      Pending
    </span>
  );
}

export default async function AdminPage() {
  if (!(await isAuthed())) {
    redirect("/admin/login");
  }

  let bookings: Booking[] = [];
  let dbError = false;
  if (isDbConfigured()) {
    try {
      bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
    } catch {
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-off-white">
      <div className="container-custom py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-charcoal">Bookings</h1>
            <p className="text-medium-gray text-sm mt-1">
              {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            </p>
          </div>
          <LogoutButton />
        </div>

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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-medium-gray border-b border-beige">
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Session</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-right">Balance</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-beige/60 last:border-0 align-top">
                      <td className="px-4 py-4">
                        <p className="text-charcoal font-medium">{b.fullName}</p>
                        <p className="text-medium-gray">{b.phone}</p>
                        {b.email && <p className="text-medium-gray">{b.email}</p>}
                        {b.social && <p className="text-medium-gray">{b.social}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-charcoal">{b.sessionType}</p>
                        <p className="text-medium-gray">{b.packageName}</p>
                        {b.prints && <p className="text-medium-gray text-xs mt-1">{b.prints}</p>}
                      </td>
                      <td className="px-4 py-4 text-charcoal whitespace-nowrap">
                        {b.sessionDate}
                        <br />
                        <span className="text-medium-gray">{b.sessionTime}</span>
                      </td>
                      <td className="px-4 py-4 text-right text-charcoal whitespace-nowrap">
                        ${b.total}
                        <br />
                        <span className="text-medium-gray text-xs">${b.deposit} deposit</span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <span className={b.paidInFull ? "text-medium-gray" : "text-charcoal"}>
                          ${b.paidInFull ? 0 : b.balance}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill booking={b} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        {b.paidInFull || b.balance <= 0 ? (
                          <span className="text-xs text-medium-gray">—</span>
                        ) : (
                          <SendInvoiceButton
                            bookingId={b.id}
                            alreadySent={Boolean(b.balanceInvoiceId)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
