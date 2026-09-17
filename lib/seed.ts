import type { DatabaseSync } from "node:sqlite";
import type { ItineraryDay } from "./types";

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

type SeedPackage = {
  slug: string;
  title: string;
  tagline: string;
  days: number;
  nights: number;
  route: string[];
  price: number;
  image: string;
  gallery: string[];
  summary: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  difficulty: "Easy" | "Moderate" | "Challenging";
  season: string;
  groupSize: string;
  status?: "published" | "draft";
  featured?: boolean;
};

const STANDARD_INCLUSIONS = [
  "Private SUV / Tempo Traveller with experienced hill driver",
  "Handpicked boutique hotels & cottages (twin sharing)",
  "Daily breakfast & dinner",
  "Local trip lead & 24/7 on-trip support",
  "All tolls, parking, state taxes & driver allowances",
];
const STANDARD_EXCLUSIONS = [
  "Flights or trains to / from Delhi",
  "Lunches, snacks & personal expenses",
  "Adventure activities marked optional",
  "Monument & activity entry tickets",
];

export const SEED_PACKAGES: SeedPackage[] = [
  {
    slug: "himachal-highlights",
    title: "Himachal Highlights",
    tagline: "The classic first taste of the hills",
    days: 5,
    nights: 4,
    route: ["Shimla", "Manali"],
    price: 14999,
    image: u("1647014070673-43bad4171631"),
    gallery: [u("1597074866923-dc0589150358"), u("1606667544139-81e47935d769"), u("1593181629936-11c609b8db9b")],
    summary: "Colonial ridges, apple orchards and the snowline at Solang — the perfect first Himalayan holiday.",
    description:
      "Five easy-paced days that pair Shimla's heritage charm with Manali's alpine drama. Ideal for families and first-time visitors who want the icons of Himachal without rushing.",
    highlights: ["Heritage walk on Shimla's Ridge", "Snow play at Solang Valley", "Hadimba Temple & Old Manali cafés", "Riverside stay on the Beas"],
    inclusions: STANDARD_INCLUSIONS,
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Delhi → Shimla", detail: "Morning pickup and a scenic climb through the Shivalik hills. Evening on Mall Road.", stay: "Shimla", meals: "Dinner", travel: "≈ 7 hrs" },
      { title: "Shimla & Kufri", detail: "Kufri viewpoints, Jakhu Temple and a guided colonial heritage walk.", stay: "Shimla", meals: "Breakfast, dinner", travel: "≈ 3 hrs" },
      { title: "Shimla → Manali", detail: "Follow the Beas through the Kullu Valley with stops at shawl weavers.", stay: "Manali", meals: "Breakfast, dinner", travel: "≈ 8 hrs" },
      { title: "Solang Valley", detail: "Snow activities, cable car and an evening in Old Manali's cafés.", stay: "Manali", meals: "Breakfast, dinner", travel: "≈ 3 hrs" },
      { title: "Return to Delhi", detail: "Leisurely breakfast and the drive back to Delhi.", meals: "Breakfast", travel: "≈ 12 hrs" },
    ],
    difficulty: "Easy",
    season: "Mar – Jun · Oct – Feb",
    groupSize: "2 – 12",
    featured: true,
  },
  {
    slug: "mountain-explorer",
    title: "Mountain Explorer",
    tagline: "Our signature Himachal journey",
    days: 7,
    nights: 6,
    route: ["Shimla", "Manali", "Kasol"],
    price: 21999,
    image: u("1664018772215-371681ad2ae9"),
    gallery: [u("1612638039814-1a67ea727114"), u("1655921779894-6416de7aaf03"), u("1712388430474-ace0c16051e2")],
    summary: "Heritage Shimla, alpine Manali and slow riverside days in the Parvati Valley.",
    description:
      "A week that moves from the colonial ridges of Shimla to the meadows of Manali, and ends slowly on the riverbanks of the Parvati Valley. Private transport, handpicked stays and a local lead throughout.",
    highlights: ["Manikaran hot springs", "Forest walk to Chalal village", "Solang Valley & Old Manali", "Riverside bonfire in Kasol"],
    inclusions: STANDARD_INCLUSIONS,
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Delhi → Shimla", detail: "Leave the plains behind as the road climbs into the Shivalik hills.", stay: "Shimla", meals: "Dinner", travel: "≈ 7–8 hrs" },
      { title: "Explore Shimla", detail: "Kufri, Jakhu Temple, Christ Church and the Viceregal Lodge.", stay: "Shimla", meals: "Breakfast, dinner", travel: "≈ 3 hrs" },
      { title: "Shimla → Manali", detail: "Riverside stops, Kullu shawl weavers and optional rafting.", stay: "Manali", meals: "Breakfast, dinner", travel: "≈ 8 hrs" },
      { title: "Explore Manali", detail: "Solang Valley, Hadimba Temple, Vashisht hot springs and café hopping.", stay: "Manali", meals: "Breakfast, dinner", travel: "≈ 4 hrs" },
      { title: "Manali → Kasol", detail: "Into the Parvati Valley via Manikaran Sahib and its langar.", stay: "Kasol", meals: "Breakfast, dinner", travel: "≈ 3.5 hrs" },
      { title: "Kasol & Parvati Valley", detail: "Guided forest walk to Chalal, Pulga's fairy forest and a bonfire.", stay: "Kasol", meals: "Breakfast, dinner", travel: "≈ 2 hrs" },
      { title: "Return to Delhi", detail: "One last breakfast by the river before the long road home.", meals: "Breakfast", travel: "≈ 11–12 hrs" },
    ],
    difficulty: "Easy",
    season: "Mar – Jun · Sep – Nov",
    groupSize: "2 – 12",
    featured: true,
  },
  {
    slug: "spiti-expedition",
    title: "Spiti Expedition",
    tagline: "High passes & thousand-year-old monasteries",
    days: 9,
    nights: 8,
    route: ["Manali", "Kaza", "Key", "Chandratal"],
    price: 34999,
    image: u("1653844573020-71f77a0ccb8c"),
    gallery: [u("1652514284048-a297d43ab05d"), u("1643196539282-8a65ee03e715"), u("1637314995939-7560a94b1495")],
    summary: "Cross Kunzum La, sleep in Kaza and spend a night beside the Moon Lake at 4,300 m.",
    description:
      "A true high-altitude expedition through the cold desert of Spiti — ancient gompas, fossil villages and some of the clearest night skies on Earth. Paced for acclimatisation with an expedition lead and oxygen support.",
    highlights: ["Key & Dhankar monasteries", "Langza fossil village", "Night camp at Chandratal", "World's highest post office, Hikkim"],
    inclusions: [...STANDARD_INCLUSIONS, "Expedition lead, oxygen cylinder & first-aid kit", "Inner line permits"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Arrive Manali", detail: "Acclimatise with a gentle walk through Old Manali.", stay: "Manali", meals: "Dinner" },
      { title: "Manali → Chandratal", detail: "Over Atal Tunnel and Kunzum La to lakeside camps.", stay: "Chandratal camp", meals: "Breakfast, dinner", travel: "≈ 7 hrs" },
      { title: "Chandratal → Kaza", detail: "Lake walk at sunrise, then into the Spiti valley.", stay: "Kaza", meals: "Breakfast, dinner", travel: "≈ 6 hrs" },
      { title: "Key & Kibber", detail: "Key Monastery and the high village of Kibber.", stay: "Kaza", meals: "Breakfast, dinner", travel: "≈ 3 hrs" },
      { title: "Langza, Hikkim & Komic", detail: "Fossil hunting, the highest post office and Komic's gompa.", stay: "Kaza", meals: "Breakfast, dinner", travel: "≈ 3 hrs" },
      { title: "Dhankar & Tabo", detail: "Cliff-top Dhankar and the 1,000-year-old Tabo murals.", stay: "Tabo", meals: "Breakfast, dinner", travel: "≈ 4 hrs" },
      { title: "Tabo → Kalpa", detail: "Along the Spiti and Sutlej rivers to Kinnaur.", stay: "Kalpa", meals: "Breakfast, dinner", travel: "≈ 7 hrs" },
      { title: "Kalpa → Shimla", detail: "Descend through apple country to Shimla.", stay: "Shimla", meals: "Breakfast, dinner", travel: "≈ 8 hrs" },
      { title: "Return to Delhi", detail: "Drive back to Delhi.", meals: "Breakfast", travel: "≈ 7 hrs" },
    ],
    difficulty: "Challenging",
    season: "Jun – Sep",
    groupSize: "4 – 10",
    featured: true,
  },
  {
    slug: "dhauladhar-retreat",
    title: "Dhauladhar Retreat",
    tagline: "Monasteries, tea gardens & Triund",
    days: 4,
    nights: 3,
    route: ["Dharamshala", "McLeod Ganj", "Triund"],
    price: 11499,
    image: u("1635262132278-40d2468da96c"),
    gallery: [u("1628782379401-4fff9cdcbbfe"), u("1571401835393-8c5f35328320"), u("1626621341517-bbf3d9990a23")],
    summary: "Tibetan culture in McLeod Ganj, Kangra tea estates and a ridge-top night at Triund.",
    description:
      "A short, soulful escape into the Kangra Valley. Visit the Dalai Lama's temple, sip tea among the estates and trek to the Triund ridge for sunset over the Dhauladhars.",
    highlights: ["Tsuglagkhang temple complex", "Triund ridge trek & camp", "Kangra tea estate walk", "Bhagsu waterfall"],
    inclusions: [...STANDARD_INCLUSIONS, "Certified trek guide & camping gear at Triund"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Arrive Dharamshala", detail: "Tea estate walk and the cricket stadium at sunset.", stay: "Dharamshala", meals: "Dinner" },
      { title: "McLeod Ganj", detail: "Tsuglagkhang, Bhagsu Nag and Tibetan cafés.", stay: "McLeod Ganj", meals: "Breakfast, dinner" },
      { title: "Triund trek", detail: "A 9 km trek to the ridge; camp under the stars.", stay: "Triund camp", meals: "Breakfast, dinner", travel: "≈ 5 hrs walk" },
      { title: "Descend & depart", detail: "Sunrise over the Dhauladhars, then descend and depart.", meals: "Breakfast", travel: "≈ 3 hrs walk" },
    ],
    difficulty: "Moderate",
    season: "Mar – Jun · Sep – Dec",
    groupSize: "2 – 12",
  },
  {
    slug: "parvati-valley-trails",
    title: "Parvati Valley Trails",
    tagline: "Pine forests, hot springs & Kheerganga",
    days: 5,
    nights: 4,
    route: ["Kasol", "Tosh", "Kheerganga"],
    price: 12999,
    image: u("1612638039814-1a67ea727114"),
    gallery: [u("1662944113366-123561a844e1"), u("1655921779894-6416de7aaf03"), u("1581791534721-e599df4417f7")],
    summary: "Riverside cafés, the village of Tosh and a hot-spring soak at Kheerganga.",
    description:
      "For travellers who like to walk. Slow mornings by the Parvati, forest trails to hidden hamlets and a night on the Kheerganga meadow with its natural hot pool.",
    highlights: ["Kheerganga trek & hot spring", "Tosh village walk", "Manikaran Sahib", "Café trail in Kasol"],
    inclusions: [...STANDARD_INCLUSIONS, "Trek guide & camping at Kheerganga"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Arrive Kasol", detail: "Settle into a riverside cottage and walk to Chalal.", stay: "Kasol", meals: "Dinner" },
      { title: "Manikaran & Tosh", detail: "Hot springs at Manikaran and an afternoon in Tosh.", stay: "Kasol", meals: "Breakfast, dinner" },
      { title: "Trek to Kheerganga", detail: "12 km through forests and waterfalls to the meadow.", stay: "Kheerganga camp", meals: "Breakfast, dinner", travel: "≈ 6 hrs walk" },
      { title: "Return to Kasol", detail: "Descend to Barshaini and back to the river.", stay: "Kasol", meals: "Breakfast, dinner", travel: "≈ 5 hrs walk" },
      { title: "Depart", detail: "Breakfast by the river and departure.", meals: "Breakfast" },
    ],
    difficulty: "Moderate",
    season: "Apr – Jun · Sep – Nov",
    groupSize: "2 – 10",
  },
  {
    slug: "kinnaur-sangla-circuit",
    title: "Kinnaur & Sangla Circuit",
    tagline: "Apple country and India's last village",
    days: 6,
    nights: 5,
    route: ["Shimla", "Sangla", "Chitkul", "Kalpa"],
    price: 24499,
    image: u("1746093846930-ab89242b9fb9"),
    gallery: [u("1624304549170-587094a07a1e"), u("1712388429936-2abc7144083f"), u("1736914329433-4ad65d2371f7")],
    summary: "The Hindustan–Tibet road, wooden temples of Sangla and sunrise over Kinnaur Kailash.",
    description:
      "One of Himachal's most spectacular drives. Follow the Sutlej into Kinnaur, stay among orchards in Sangla, reach Chitkul near the Tibet border and wake up to Kinnaur Kailash from Kalpa.",
    highlights: ["Chitkul, the last village", "Kamru Fort, Sangla", "Kinnaur Kailash sunrise", "Suicide Point cliff road"],
    inclusions: STANDARD_INCLUSIONS,
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Delhi → Shimla", detail: "Drive up to Shimla.", stay: "Shimla", meals: "Dinner", travel: "≈ 7 hrs" },
      { title: "Shimla → Sangla", detail: "Along the Sutlej via Narkanda and Rampur.", stay: "Sangla", meals: "Breakfast, dinner", travel: "≈ 8 hrs" },
      { title: "Chitkul", detail: "Day trip to Chitkul and the Baspa river.", stay: "Sangla", meals: "Breakfast, dinner", travel: "≈ 2 hrs" },
      { title: "Sangla → Kalpa", detail: "Roghi village and the famous cliff road.", stay: "Kalpa", meals: "Breakfast, dinner", travel: "≈ 3 hrs" },
      { title: "Kalpa → Shimla", detail: "Sunrise over Kinnaur Kailash, then back to Shimla.", stay: "Shimla", meals: "Breakfast, dinner", travel: "≈ 8 hrs" },
      { title: "Return to Delhi", detail: "Drive back to Delhi.", meals: "Breakfast", travel: "≈ 7 hrs" },
    ],
    difficulty: "Moderate",
    season: "Apr – Oct",
    groupSize: "2 – 10",
  },
  {
    slug: "winter-snow-escape",
    title: "Winter Snow Escape",
    tagline: "Fresh powder, bonfires & frozen valleys",
    days: 6,
    nights: 5,
    route: ["Shimla", "Kufri", "Manali", "Solang"],
    price: 18999,
    image: u("1593181629936-11c609b8db9b"),
    gallery: [u("1647014070673-43bad4171631"), u("1418985991508-e47386d96a71"), u("1712388429936-2abc7144083f")],
    summary: "Timed for snowfall: skiing at Solang, snowy Kufri and warm cabin evenings.",
    description:
      "Himachal in white. Built around the best snowfall windows with flexible routing for road conditions, heated stays and a ski lesson at Solang Valley.",
    highlights: ["Beginner ski lesson at Solang", "Atal Tunnel snow point", "Kufri in winter", "Bonfire dinners"],
    inclusions: [...STANDARD_INCLUSIONS, "Heated rooms & snow chains on vehicles"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Delhi → Shimla", detail: "Drive to a snowy Shimla.", stay: "Shimla", meals: "Dinner" },
      { title: "Kufri snow day", detail: "Snow play at Kufri and Mashobra.", stay: "Shimla", meals: "Breakfast, dinner" },
      { title: "Shimla → Manali", detail: "Through the Kullu Valley.", stay: "Manali", meals: "Breakfast, dinner", travel: "≈ 8 hrs" },
      { title: "Solang ski day", detail: "A guided beginner ski session.", stay: "Manali", meals: "Breakfast, dinner" },
      { title: "Atal Tunnel & Sissu", detail: "Cross to the Lahaul side for frozen waterfalls.", stay: "Manali", meals: "Breakfast, dinner" },
      { title: "Return to Delhi", detail: "Overnight-friendly return drive.", meals: "Breakfast" },
    ],
    difficulty: "Easy",
    season: "Dec – Feb",
    groupSize: "2 – 12",
  },
  {
    slug: "himalayan-honeymoon",
    title: "Himalayan Honeymoon",
    tagline: "Private, slow and beautifully romantic",
    days: 6,
    nights: 5,
    route: ["Shimla", "Manali"],
    price: 27999,
    image: u("1597167231350-d057a45dc868"),
    gallery: [u("1571677465484-2dd540924245"), u("1756776507069-31111904f477"), u("1585409677983-0f6c41ca9c3b")],
    summary: "Luxury cottages, candlelit dinners and private sightseeing for two.",
    description:
      "A couples-only journey with upgraded stays, a private chauffeur, flower-decorated rooms and a candlelit dinner beside the Beas.",
    highlights: ["Premium valley-view cottages", "Candlelit riverside dinner", "Private photoshoot in Old Manali", "Couple's spa session"],
    inclusions: [...STANDARD_INCLUSIONS, "Room décor, cake & candlelit dinner", "60-min couple's spa"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Delhi → Shimla", detail: "Private chauffeur drive to a heritage hotel.", stay: "Shimla", meals: "Dinner" },
      { title: "Shimla at leisure", detail: "Mashobra forest walk and Mall Road evening.", stay: "Shimla", meals: "Breakfast, dinner" },
      { title: "Shimla → Manali", detail: "Scenic drive with orchard stops.", stay: "Manali", meals: "Breakfast, dinner" },
      { title: "Manali together", detail: "Photoshoot in Old Manali and a candlelit dinner.", stay: "Manali", meals: "Breakfast, dinner" },
      { title: "Solang & spa", detail: "Morning at Solang, afternoon spa.", stay: "Manali", meals: "Breakfast, dinner" },
      { title: "Depart", detail: "Drive back to Delhi.", meals: "Breakfast" },
    ],
    difficulty: "Easy",
    season: "All year",
    groupSize: "2",
  },
  {
    slug: "lahaul-road-trip",
    title: "Lahaul Road Trip",
    tagline: "Beyond the Atal Tunnel",
    days: 8,
    nights: 7,
    route: ["Manali", "Sissu", "Jispa", "Keylong"],
    price: 29999,
    image: u("1648131877984-f39ebc1647f1"),
    gallery: [u("1643196539282-8a65ee03e715"), u("1583912489026-898cdc54cbe0")],
    summary: "A self-paced road trip into the Lahaul valley. (Draft — itinerary in progress.)",
    description: "Draft package. Finalise the itinerary and pricing before publishing.",
    highlights: ["Sissu waterfall", "Jispa riverside camp", "Keylong monasteries"],
    inclusions: STANDARD_INCLUSIONS,
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [{ title: "Arrive Manali", detail: "Briefing and vehicle handover." }],
    difficulty: "Moderate",
    season: "Jun – Sep",
    groupSize: "2 – 8",
    status: "draft",
  },
];

// Illustrative testimonials — replace with real guest reviews from the admin panel.
const SEED_TESTIMONIALS = [
  { name: "Aanya & Rohan Mehta", location: "Mumbai", trip: "Mountain Explorer", quote: "Waking up in Kasol to the sound of the Parvati was something else. Every stay felt handpicked, and our driver knew every chai stop worth knowing." },
  { name: "Priya Nair", location: "Bengaluru", trip: "Spiti Expedition", quote: "The most humbling landscape I've ever seen. The team paced the altitude perfectly and the night at Chandratal is one I'll talk about for years." },
  { name: "James & Ellie Porter", location: "London, UK", trip: "Himachal Highlights", quote: "Our first trip to India and it felt effortless — Shimla's old-world charm, snow at Solang and genuinely warm people everywhere." },
];

// Placeholder contact details — edit in Admin → Settings.
const SEED_SETTINGS = {
  phone: "+91 98765 43210",
  email: "hello@himalayanescape.in",
  whatsapp: "919876543210",
  instagram: "himalayanescape",
  address: "Mall Road, Manali, Himachal Pradesh 175131",
  announcement: "Spiti 2026 departures are open — limited seats per batch.",
};

// Deterministic PRNG so demo data is stable across machines.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

function seedDemoActivity(db: DatabaseSync) {
  const rand = rng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const published = SEED_PACKAGES.filter((p) => p.status !== "draft");

  // Weighted page mix.
  const pages: [string, number][] = [
    ["/", 30],
    ["/packages", 18],
    ["/destinations", 10],
    ["/experiences", 6],
    ["/about", 4],
    ["/contact", 5],
    ...published.map((p, i): [string, number] => [`/packages/${p.slug}`, 9 - i]),
  ];
  const totalW = pages.reduce((s, [, w]) => s + w, 0);
  const pickPage = () => {
    let r = rand() * totalW;
    for (const [p, w] of pages) if ((r -= w) <= 0) return p;
    return "/";
  };
  const clicks = ["Explore Packages", "Plan My Trip", "Book Your Trip", "View Package", "WhatsApp Us", "Send Enquiry", "Destinations", "Packages"];
  const refs = ["", "", "https://www.google.com/", "https://www.instagram.com/", "https://www.google.com/", "https://www.youtube.com/", "https://t.co/"];

  const ins = db.prepare("INSERT INTO events (type, path, label, visitor, referrer, is_demo, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)");
  const now = Date.now();
  for (let d = 59; d >= 0; d--) {
    const growth = 1 + (59 - d) / 45;
    const weekend = new Date(now - d * 864e5).getDay() % 6 === 0 ? 1.35 : 1;
    const visitors = Math.round((14 + rand() * 10) * growth * weekend);
    for (let v = 0; v < visitors; v++) {
      const visitor = `demo-${d}-${v}`;
      const referrer = pick(refs);
      const views = 1 + Math.floor(rand() * 4);
      for (let k = 0; k < views; k++) {
        const t = new Date(now - d * 864e5 - rand() * 864e5 * 0.95);
        const path = k === 0 && rand() < 0.5 ? "/" : pickPage();
        ins.run("view", path, "", visitor, k === 0 ? referrer : "", iso(t));
        if (rand() < 0.45) ins.run("click", path, pick(clicks), visitor, "", iso(new Date(t.getTime() + 20000)));
      }
    }
  }

  const names = ["Aarav Sharma", "Ishita Kapoor", "Neha Gupta", "Kabir Singh", "Sara Thomas", "Vikram Rao", "Meera Iyer", "Arjun Malhotra", "Zoya Khan", "Rahul Verma", "Ananya Das", "Dev Patel", "Tanvi Joshi", "Liam Carter"];
  const statuses = ["new", "new", "new", "contacted", "contacted", "quoted", "quoted", "booked", "booked", "lost"];
  const insE = db.prepare(
    "INSERT INTO enquiries (name, email, phone, package_slug, travel_month, travellers, message, source, status, notes, value, is_demo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
  );
  names.forEach((name, i) => {
    const pkg = pick(published);
    const status = statuses[i % statuses.length];
    const travellers = 1 + Math.floor(rand() * 5);
    const t = iso(new Date(now - Math.floor(rand() * 40) * 864e5 - rand() * 864e5));
    const month = new Date(now + (1 + Math.floor(rand() * 5)) * 30 * 864e5).toISOString().slice(0, 7);
    insE.run(
      name,
      `${name.split(" ")[0].toLowerCase()}@example.com`,
      `+91 9${Math.floor(100000000 + rand() * 899999999)}`,
      pkg.slug,
      month,
      travellers,
      pick(["Travelling with parents, need easy pace.", "Is a vegetarian menu available?", "Can we add a day in Kasol?", "Looking for a honeymoon upgrade.", ""]),
      pick(["plan-dialog", "contact", "package-page"]),
      status,
      status === "new" ? "" : "Called and shared itinerary PDF.",
      ["quoted", "booked"].includes(status) ? pkg.price * travellers : 0,
      t,
      t,
    );
  });
}

export function seed(db: DatabaseSync) {
  const insP = db.prepare(`INSERT OR IGNORE INTO packages
    (slug, title, tagline, days, nights, route, price, image, gallery, summary, description, highlights, inclusions, exclusions, itinerary, difficulty, season, group_size, status, featured, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  SEED_PACKAGES.forEach((p, i) =>
    insP.run(
      p.slug, p.title, p.tagline, p.days, p.nights, JSON.stringify(p.route), p.price, p.image, JSON.stringify(p.gallery),
      p.summary, p.description, JSON.stringify(p.highlights), JSON.stringify(p.inclusions), JSON.stringify(p.exclusions),
      JSON.stringify(p.itinerary), p.difficulty, p.season, p.groupSize, p.status ?? "published", p.featured ? 1 : 0, i,
    ),
  );

  const insT = db.prepare("INSERT INTO testimonials (name, location, trip, quote) VALUES (?, ?, ?, ?)");
  for (const t of SEED_TESTIMONIALS) insT.run(t.name, t.location, t.trip, t.quote);

  const insS = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(SEED_SETTINGS)) insS.run(k, v);

  seedDemoActivity(db);
}
