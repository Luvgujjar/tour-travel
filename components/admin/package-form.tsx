"use client";

import Image from "next/image";
import { useState } from "react";
import { savePackage, type FormState } from "@/lib/actions/admin";
import { useActionForm } from "@/lib/use-action-form";
import type { ItineraryDay, TourPackage } from "@/lib/types";

type Day = ItineraryDay & { key: number };

const blank: Omit<TourPackage, "id" | "createdAt" | "updatedAt"> = {
  slug: "",
  title: "",
  tagline: "",
  days: 5,
  nights: 4,
  route: [],
  price: 0,
  image: "",
  gallery: [],
  summary: "",
  description: "",
  highlights: [],
  inclusions: [],
  exclusions: [],
  itinerary: [],
  difficulty: "Easy",
  season: "",
  groupSize: "2 – 12",
  status: "draft",
  featured: false,
};

const isImage = (s: string) => /^https:\/\/images\.unsplash\.com\/photo-[\w-]+$/.test(s);

export function PackageForm({ pkg }: { pkg?: TourPackage }) {
  const p = pkg ?? { ...blank, id: 0 };
  const { state, pending, formProps } = useActionForm<FormState>(savePackage, null);
  const err = state?.errors ?? {};
  const [image, setImage] = useState(p.image);
  const [days, setDays] = useState<Day[]>(() => p.itinerary.map((d, i) => ({ ...d, key: i })));
  const [nextKey, setNextKey] = useState(p.itinerary.length);

  const addDay = () => {
    setDays((d) => [...d, { key: nextKey, title: "", detail: "", stay: "", meals: "", travel: "" }]);
    setNextKey((k) => k + 1);
  };
  const move = (i: number, dir: -1 | 1) =>
    setDays((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.length) return d;
      const copy = [...d];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const input = (name: string) => ({
    id: name,
    name,
    className: "field",
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${name}-err` : undefined,
  });
  const errorText = (name: string) =>
    err[name] ? (
      <p id={`${name}-err`} className="mt-1 text-xs text-err">
        {err[name]}
      </p>
    ) : null;

  const section = "rounded-2xl border border-line bg-surface p-5";

  return (
    <form {...formProps} className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}

      <div className="space-y-4">
        <fieldset className={section}>
          <legend className="px-1 text-sm font-semibold">Basics</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="label">Title *</label>
              <input {...input("title")} defaultValue={p.title} required />
              {errorText("title")}
            </div>
            <div>
              <label htmlFor="slug" className="label">URL slug</label>
              <input {...input("slug")} defaultValue={p.slug} placeholder="auto from title" />
              {errorText("slug")}
            </div>
            <div>
              <label htmlFor="tagline" className="label">Tagline</label>
              <input {...input("tagline")} defaultValue={p.tagline} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="route" className="label">Route (comma separated)</label>
              <input {...input("route")} defaultValue={p.route.join(", ")} placeholder="Shimla, Manali, Kasol" />
            </div>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <div>
                <label htmlFor="days" className="label">Days *</label>
                <input {...input("days")} type="number" min={1} max={60} defaultValue={p.days} />
                {errorText("days")}
              </div>
              <div>
                <label htmlFor="nights" className="label">Nights *</label>
                <input {...input("nights")} type="number" min={0} max={60} defaultValue={p.nights} />
                {errorText("nights")}
              </div>
              <div>
                <label htmlFor="price" className="label">Price ₹ / person *</label>
                <input {...input("price")} inputMode="numeric" defaultValue={p.price || ""} />
                {errorText("price")}
              </div>
            </div>
            <div>
              <label htmlFor="difficulty" className="label">Difficulty</label>
              <select {...input("difficulty")} defaultValue={p.difficulty}>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Challenging</option>
              </select>
            </div>
            <div>
              <label htmlFor="season" className="label">Best season</label>
              <input {...input("season")} defaultValue={p.season} placeholder="Mar – Jun · Sep – Nov" />
            </div>
            <div>
              <label htmlFor="groupSize" className="label">Group size</label>
              <input {...input("groupSize")} defaultValue={p.groupSize} />
            </div>
          </div>
        </fieldset>

        <fieldset className={section}>
          <legend className="px-1 text-sm font-semibold">Content</legend>
          <div className="mt-3 space-y-4">
            <div>
              <label htmlFor="summary" className="label">Card summary</label>
              <textarea {...input("summary")} rows={2} maxLength={400} defaultValue={p.summary} />
            </div>
            <div>
              <label htmlFor="description" className="label">Full description</label>
              <textarea {...input("description")} rows={4} defaultValue={p.description} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["highlights", "Highlights", p.highlights],
                  ["inclusions", "Inclusions", p.inclusions],
                  ["exclusions", "Exclusions", p.exclusions],
                ] as const
              ).map(([name, label, value]) => (
                <div key={name}>
                  <label htmlFor={name} className="label">{label} <span className="text-slate">(one per line)</span></label>
                  <textarea {...input(name)} rows={6} defaultValue={value.join("\n")} />
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className={section}>
          <legend className="px-1 text-sm font-semibold">Itinerary</legend>
          {errorText("itinerary")}
          <ol className="mt-3 space-y-3">
            {days.map((d, i) => (
              <li key={d.key} className="rounded-xl border border-line p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-glacier">Day {i + 1}</span>
                  <span className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move day ${i + 1} up`} className="rounded-md border border-line px-2 text-xs disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === days.length - 1} aria-label={`Move day ${i + 1} down`} className="rounded-md border border-line px-2 text-xs disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => setDays((all) => all.filter((x) => x.key !== d.key))} aria-label={`Remove day ${i + 1}`} className="rounded-md border border-[#d03b3b]/40 px-2 text-xs text-err">Remove</button>
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input name="dayTitle" defaultValue={d.title} placeholder="Title, e.g. Shimla → Manali" aria-label={`Day ${i + 1} title`} className="field sm:col-span-3" />
                  <textarea name="dayDetail" defaultValue={d.detail} rows={2} placeholder="What happens today" aria-label={`Day ${i + 1} details`} className="field sm:col-span-3" />
                  <input name="dayStay" defaultValue={d.stay} placeholder="Stay" aria-label={`Day ${i + 1} stay`} className="field" />
                  <input name="dayMeals" defaultValue={d.meals} placeholder="Meals" aria-label={`Day ${i + 1} meals`} className="field" />
                  <input name="dayTravel" defaultValue={d.travel} placeholder="Travel time" aria-label={`Day ${i + 1} travel time`} className="field" />
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={addDay} className="btn btn-ghost btn-sm mt-3">
            + Add day
          </button>
        </fieldset>
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <fieldset className={section}>
          <legend className="px-1 text-sm font-semibold">Publishing</legend>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-line p-1">
              {(["draft", "published"] as const).map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name="status" value={s} defaultChecked={p.status === s} className="peer sr-only" />
                  <span className="block rounded-lg py-1.5 text-center text-sm capitalize text-mist peer-checked:bg-snow peer-checked:font-medium peer-checked:text-night peer-focus-visible:ring-2 peer-focus-visible:ring-sky">
                    {s}
                  </span>
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={p.featured} className="size-4 accent-sky" />
              Feature on the home page
            </label>
          </div>
        </fieldset>

        <fieldset className={section}>
          <legend className="px-1 text-sm font-semibold">Images</legend>
          <div className="mt-3 space-y-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-night-3">
              {isImage(image) ? (
                <Image src={image} alt="Cover preview" fill sizes="20rem" className="object-cover" />
              ) : (
                <span className="grid h-full place-items-center text-xs text-slate">Cover preview</span>
              )}
            </div>
            <div>
              <label htmlFor="image" className="label">Cover image URL *</label>
              <input {...input("image")} value={image} onChange={(e) => setImage(e.target.value.trim())} placeholder="https://images.unsplash.com/photo-…" />
              {errorText("image")}
            </div>
            <div>
              <label htmlFor="gallery" className="label">Gallery URLs (one per line)</label>
              <textarea {...input("gallery")} rows={4} defaultValue={p.gallery.join("\n")} className="field text-xs" />
              {errorText("gallery")}
            </div>
            <p className="text-xs text-slate">Paste Unsplash image links (Right-click photo → Copy image address, then remove everything after “?”).</p>
          </div>
        </fieldset>

        {state && !state.ok && (
          <p role="alert" className="rounded-xl border border-[#d03b3b]/40 bg-[#d03b3b]/10 px-4 py-2.5 text-sm text-err">
            {state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
          {pending ? "Saving…" : pkg ? "Save changes" : "Create package"}
        </button>
      </div>
    </form>
  );
}
