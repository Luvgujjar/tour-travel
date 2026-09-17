import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/controls";
import { TestimonialForm } from "@/components/admin/simple-forms";
import { Card, EmptyState, PageHeader, timeAgo } from "@/components/admin/ui";
import { flipTestimonial, removeTestimonial } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { listTestimonials } from "@/lib/data/crm";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  await requireAdmin();
  const items = listTestimonials({ onlyVisible: false });
  return (
    <>
      <PageHeader title="Testimonials" description="Reviews shown on the About page (latest three visible ones)." />
      <Card title="Add a review" className="mb-4">
        <TestimonialForm />
      </Card>
      {items.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((t) => (
            <li key={t.id} className={`rounded-2xl border border-line bg-surface p-5 ${t.visible ? "" : "opacity-60"}`}>
              <blockquote className="text-sm leading-relaxed">“{t.quote}”</blockquote>
              <p className="mt-3 text-sm font-medium">
                {t.name} <span className="font-normal text-slate">· {t.location} {t.trip && `· ${t.trip}`}</span>
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs text-slate">
                  {t.visible ? "● Visible on site" : "○ Hidden"} · added {timeAgo(t.createdAt)}
                </span>
                <span className="flex gap-1">
                  <form action={flipTestimonial}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="rounded-md border border-line px-2 py-1 text-xs hover:bg-snow/10">
                      {t.visible ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={removeTestimonial}>
                    <input type="hidden" name="id" value={t.id} />
                    <ConfirmButton message={`Delete the review from ${t.name}?`} className="rounded-md border border-[#d03b3b]/40 px-2 py-1 text-xs text-err hover:bg-[#d03b3b]/15">
                      Delete
                    </ConfirmButton>
                  </form>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No testimonials" text="Add your first guest review above." />
      )}
    </>
  );
}
