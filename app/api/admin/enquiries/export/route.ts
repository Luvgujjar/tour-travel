import { getAdmin } from "@/lib/auth";
import { listEnquiries } from "@/lib/data/crm";

const cell = (v: string | number | boolean) => {
  let s = String(v);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const rows = listEnquiries({ status: url.searchParams.get("status") ?? "", q: url.searchParams.get("q") ?? "" });
  const header = ["id", "name", "email", "phone", "package", "travel_month", "travellers", "status", "value_inr", "source", "message", "notes", "created_at"];
  const lines = rows.map((e) =>
    [e.id, e.name, e.email, e.phone, e.packageSlug, e.travelMonth, e.travellers, e.status, e.value, e.source, e.message, e.notes, e.createdAt].map(cell).join(","),
  );
  const csv = [header.join(","), ...lines].join("\r\n");
  return new Response(`﻿${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
