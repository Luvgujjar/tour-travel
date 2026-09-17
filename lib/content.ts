// Static brand copy and imagery. Packages, testimonials and contact details live in the database.
// Photography: Unsplash (https://unsplash.com/license).

export const img = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const site = {
  name: "Himalayan Escape",
  tagline: "Find Your Way to the Mountains.",
  description:
    "Discover the dramatic landscapes, quiet valleys, winding mountain roads and unforgettable experiences of Himachal Pradesh.",
  url: "https://himalayanescape.in",
};

export const whatsappLink = (number: string, text = "Hi Himalayan Escape! I'd like to plan a Himachal trip.") =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/experiences" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const heroImage = {
  src: img("1664018772215-371681ad2ae9"),
  alt: "Snow-covered Himalayan ridge rising above a pine-forested valley in Himachal Pradesh",
};

export const destinations = [
  {
    name: "Manali",
    slug: "Manali",
    region: "Kullu Valley",
    altitude: "2,050 m",
    line: "Snow peaks, pine forests & unforgettable adventures.",
    src: img("1606667544139-81e47935d769"),
    alt: "Manali town spread beneath snow-dusted mountains",
  },
  {
    name: "Kasol",
    slug: "Kasol",
    region: "Parvati Valley",
    altitude: "1,580 m",
    line: "A peaceful escape into the Parvati Valley.",
    src: img("1612638039814-1a67ea727114"),
    alt: "The Parvati river rushing over boulders between pine forests near Kasol",
  },
  {
    name: "Spiti Valley",
    slug: "Kaza",
    region: "Lahaul & Spiti",
    altitude: "3,800 m",
    line: "Raw landscapes. Ancient monasteries. Endless horizons.",
    src: img("1652514284048-a297d43ab05d"),
    alt: "Key Monastery on a rocky hill above the Spiti river under a golden sky",
  },
  {
    name: "Shimla",
    slug: "Shimla",
    region: "Shivalik Hills",
    altitude: "2,276 m",
    line: "Colonial charm surrounded by Himalayan forests.",
    src: img("1597074866923-dc0589150358"),
    alt: "Colourful houses of Shimla stacked across a forested hillside",
  },
  {
    name: "Dharamshala",
    slug: "Dharamshala",
    region: "Kangra Valley",
    altitude: "1,457 m",
    line: "Mountain culture, monasteries & serene valleys.",
    src: img("1635262132278-40d2468da96c"),
    alt: "Green alpine meadow and pines beneath a snow peak of the Dhauladhar range",
  },
];

export const experiences = [
  { title: "Snow Adventures", note: "Solang · Rohtang", text: "Skiing, snow scooters and your first real snowfall.", src: img("1593181629936-11c609b8db9b"), alt: "Travellers on a snowfield below Himalayan peaks" },
  { title: "Mountain Road Trips", note: "Hindustan–Tibet Road", text: "Cliff roads, high passes and chai at every bend.", src: img("1736914329433-4ad65d2371f7"), alt: "A Himachal bus on a mountain highway" },
  { title: "Camping Under the Stars", note: "Chandratal · Tosh", text: "Alpine meadows by day, the Milky Way by night.", src: img("1662944113366-123561a844e1"), alt: "Blue tents pitched on an alpine meadow near snow" },
  { title: "Local Himachali Food", note: "Siddu · Dham · Trout", text: "Village kitchens, festival feasts and river trout.", src: img("1567337710282-00832b415979"), alt: "A thali with dal, curries and fresh bread" },
  { title: "Monastery & Culture", note: "Key · Tabo · McLeod Ganj", text: "Prayer halls, butter lamps and thousand-year murals.", src: img("1653844573020-71f77a0ccb8c"), alt: "Key Monastery above the Spiti valley" },
  { title: "Trekking", note: "Triund · Kheerganga", text: "Guided day hikes to multi-day ridge treks.", src: img("1626621341517-bbf3d9990a23"), alt: "Trekkers crossing a snowy ridge through oak trees" },
  { title: "River Adventures", note: "Beas rafting · Kullu", text: "Grade II–III rapids with certified guides.", src: img("1642933196504-62107dac9258"), alt: "A raft crew paddling through turquoise rapids" },
  { title: "Village Experiences", note: "Homestays · Orchards", text: "Apple harvests, wood homes and warm hosts.", src: img("1756776507069-31111904f477"), alt: "A rustic wooden cabin among trees on a hillside" },
];

export const benefits = [
  { title: "Curated Itineraries", text: "Thoughtfully designed routes with the best experiences." },
  { title: "Local Expertise", text: "Travel with people who know the mountains." },
  { title: "Comfort & Safety", text: "Reliable stays, transport and trip support." },
  { title: "Small Group Experiences", text: "More personal. More memorable." },
  { title: "24/7 Trip Support", text: "We're with you throughout your journey." },
];

export const storyMoments = [
  { title: "Wake up above the clouds", src: img("1506905925346-21bda4d32df4"), alt: "Snow peaks glowing at sunrise above a sea of clouds" },
  { title: "Drive dramatic mountain roads", src: img("1643196539282-8a65ee03e715"), alt: "A road winding through a barren high-altitude valley" },
  { title: "Discover hidden villages", src: img("1624304549170-587094a07a1e"), alt: "Traditional wooden Himachali houses on a mountainside" },
  { title: "Sleep beneath the stars", src: img("1637314995939-7560a94b1495"), alt: "The Milky Way arching over a Buddha statue in Spiti" },
];

export const faqs = [
  { q: "When is the best time to visit Himachal?", a: "March–June and September–November for most routes. Spiti and Lahaul open June–September; snow trips run December–February." },
  { q: "Can you customise a package?", a: "Always. Every itinerary can be lengthened, shortened or combined — tell us your dates and pace." },
  { q: "Is it safe for families and solo travellers?", a: "Yes. Vetted stays, experienced hill drivers and a trip lead reachable 24/7 on every journey." },
  { q: "How do I confirm a booking?", a: "Send an enquiry, approve your personalised quote, and we'll share payment details to lock in your dates." },
];
