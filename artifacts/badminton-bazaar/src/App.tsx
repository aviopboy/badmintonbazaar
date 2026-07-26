import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, BadgeCheck, Check, ChevronDown, CreditCard, Edit3, Heart,
  LayoutDashboard, Loader2, Minus, Package, Play, Plus, Search,
  ShieldCheck, ShoppingBag, Sparkles, Trash2, Truck, UserPlus, UserRound,
  X, Eye, EyeOff, RefreshCw, Video,
} from "lucide-react";
import "./index.css";

/* ─── Types ─────────────────────────────────────────────────── */
type Category =
  | "Rackets" | "Shoes" | "Shuttlecocks" | "Strings" | "Grips"
  | "Kit Bags" | "Apparel" | "Socks" | "Accessories";

type Product = {
  id: string; name: string; brand: string; category: Category;
  price: number; compareAt?: number; description: string;
  image: string; tags: string[]; featured?: boolean; badge?: string;
  showcase?: string; // URL to a showcase image or YouTube video (e.g. https://youtube.com/watch?v=...)
};
type CartLine = { productId: string; quantity: number };
type User = { id: string; name: string; email: string; password: string; admin: boolean; joined: string };
type Toast = { id: number; message: string; error?: boolean };
type View = "store" | "account" | "admin";
type Modal = "auth" | "product" | "cart" | "checkout" | "add-user" | null;

/* ─── Category metadata ──────────────────────────────────────── */
const ALL_CATEGORIES: Category[] = [
  "Rackets", "Shoes", "Shuttlecocks", "Strings", "Grips",
  "Kit Bags", "Apparel", "Socks", "Accessories",
];

/* ─── SVG Placeholder fallbacks ─────────────────────────────── */
const svgArt = (kind: "racket" | "shoe" | "shuttle" | "bag" | "apparel" | "accessory", color: string, accent = "#b9e532") => {
  const bodies: Record<string, string> = {
    racket: `<g transform="rotate(-10 220 220)"><ellipse cx="220" cy="111" rx="82" ry="104" fill="${color}" stroke="#191b18" stroke-width="7"/><ellipse cx="220" cy="111" rx="64" ry="83" fill="none" stroke="${accent}" stroke-width="3"/><path d="M173 37L267 185M267 37L173 185M149 111h142M220 9v204" stroke="#191b18" stroke-width="2" opacity=".45"/><path d="M206 202h28l18 184-30 10-30-10z" fill="${accent}" stroke="#191b18" stroke-width="7"/><path d="M190 374l45 14-10 35-48-15z" fill="#191b18"/></g>`,
    shoe: `<g transform="rotate(-5 220 240)"><path d="M100 302c38-52 67-104 74-175l8-79c31-18 81-15 109 9l-7 83c-4 47 28 73 72 106 15 12 16 31-2 42-51 31-148 29-230 26-25-1-37-1-24-12z" fill="${color}" stroke="#191b18" stroke-width="7"/><path d="M185 81c29 25 61 35 99 31M177 125c32 26 67 35 104 32" stroke="${accent}" stroke-width="10" fill="none"/><path d="M96 302c73 15 137 8 230-14 33 11 44 27 27 43-57 50-192 30-272 18-21-4-9-28 15-47z" fill="#191b18"/></g>`,
    shuttle: `<g><ellipse cx="220" cy="300" rx="40" ry="30" fill="${color}" stroke="#191b18" stroke-width="5"/><path d="M220 270 L180 100 M220 270 L220 80 M220 270 L260 100 M220 270 L250 120 M220 270 L190 120" stroke="${color}" stroke-width="4" opacity=".8"/><ellipse cx="220" cy="95" rx="70" ry="25" fill="none" stroke="${accent}" stroke-width="4" opacity=".7"/></g>`,
    bag: `<g><rect x="100" y="130" width="240" height="180" rx="20" fill="${color}" stroke="#191b18" stroke-width="7"/><path d="M160 130 v-30 a60 60 0 0 1 120 0 v30" fill="none" stroke="#191b18" stroke-width="6"/><rect x="115" y="195" width="210" height="2" fill="${accent}" opacity=".5"/><rect x="130" y="155" width="80" height="60" rx="5" fill="#191b18" opacity=".3"/></g>`,
    apparel: `<g><path d="M140 100 L100 160 L150 180 L150 330 L290 330 L290 180 L340 160 L300 100 L260 130 C250 150 190 150 180 130 Z" fill="${color}" stroke="#191b18" stroke-width="7"/><path d="M180 130 C190 150 250 150 260 130" stroke="${accent}" stroke-width="4" fill="none"/></g>`,
    accessory: `<g><rect x="130" y="140" width="180" height="160" rx="10" fill="${color}" stroke="#191b18" stroke-width="6"/><circle cx="220" cy="220" r="40" fill="${accent}" opacity=".4"/><circle cx="220" cy="220" r="20" fill="#191b18" opacity=".3"/></g>`,
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 440"><rect width="440" height="440" fill="#1a1c17"/><circle cx="366" cy="72" r="54" fill="${accent}" opacity=".08"/><circle cx="67" cy="361" r="92" fill="#2a2d26" opacity=".7"/>${bodies[kind] ?? bodies.accessory}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/* ─── Seed products ──────────────────────────────────────────── */
const Y = "https://www.yonex.com/media/catalog/product";
const V = "https://www.victorsport.com/media/catalog/product";
const DIN = "https://www.decathlon.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-SharedLibrary/default/dw/badminton";

const initialProducts: Product[] = [
  // ── Rackets ──
  {
    id: "p-astrox-100-zz", name: "ASTROX 100 ZZ", brand: "Yonex", category: "Rackets",
    price: 16990, compareAt: 19990, featured: true, badge: "Best Seller",
    image: `${Y}/a/x/ax100zz-366.jpg`,
    showcase: `${Y}/a/x/ax100zz_2.jpg`,
    description: "The definitive smash weapon. Head-heavy balance with Rotational Generator System delivers devastating attack power from the back court. Favoured by the world's best including Kento Momota.",
    tags: ["head heavy", "4U", "stiff", "attack"],
  },
  {
    id: "p-nanoflare-1000-z", name: "NANOFLARE 1000 Z", brand: "Yonex", category: "Rackets",
    price: 15490, compareAt: 17990, featured: true, badge: "New",
    image: `${Y}/n/f/nf1000z-366.jpg`,
    showcase: `${Y}/n/f/nf1000z_2.jpg`,
    description: "Fastest in the Nanoflare family. M-shaped frame slices through the air for instant shuttle acceleration. Built for counter-punchers who take the shuttle early.",
    tags: ["head light", "4U", "speed", "quick"],
  },
  {
    id: "p-axforce-canon", name: "AXFORCE CANNON", brand: "Li-Ning", category: "Rackets",
    price: 12490, compareAt: 14990, featured: true,
    image: `${DIN}/li-ning-axforce-cannon.jpg`,
    description: "Explosive doubles power. Carbon Fibre Box Beam technology delivers maximum stability at impact. A serious weapon for competitive doubles play.",
    tags: ["head heavy", "4U", "power", "doubles"],
  },
  {
    id: "p-axforce-100", name: "AXFORCE 100", brand: "Li-Ning", category: "Rackets",
    price: 10990, compareAt: 12490,
    image: svgArt("racket", "#454b49", "#d9a441"),
    description: "Precision-engineered for all-court control. Even-balanced frame with flexible shaft gives complete command from net to baseline.",
    tags: ["balanced", "3U", "control", "all-court"],
  },
  {
    id: "p-astrox-99", name: "ASTROX 99", brand: "Yonex", category: "Rackets",
    price: 13990, compareAt: 15490,
    image: `${Y}/a/x/ax99-366.jpg`,
    description: "Engineered for the aggressive baseliner. NAMD graphite technology generates explosive repulsion from deep court drives and steep smashes.",
    tags: ["head heavy", "3U/4U", "stiff", "power"],
  },
  {
    id: "p-voltric-zf2", name: "VOLTRIC Z-FORCE II", brand: "Yonex", category: "Rackets",
    price: 8990, compareAt: 11490,
    image: `${Y}/v/t/vtzf2ex-553.jpg`,
    description: "The legendary smash machine. Tri-Voltage System concentrates weight at the top for maximum impact. A timeless tournament weapon still seen at the highest level.",
    tags: ["head heavy", "4U", "stiff", "smash"],
  },
  {
    id: "p-victor-ryuga2", name: "THRUSTER RYUGA II PRO", brand: "Victor", category: "Rackets",
    price: 11490, compareAt: 13490,
    image: `${V}/t/k/tk-ryuga-ii-pro-1.jpg`,
    description: "Pro-spec precision from Victor's elite Ryuga series. Aero-Sword frame profile and stiff NANO FORTIFY shaft deliver pin-point targeting in every rally.",
    tags: ["even balance", "4U", "stiff", "precision"],
  },

  // ── Shoes ──
  {
    id: "p-yonex-65z3", name: "POWER CUSHION 65 Z3", brand: "Yonex", category: "Shoes",
    price: 9990, compareAt: 11990, featured: true, badge: "Popular",
    image: `${Y}/p/c/pc65z3ex-551.jpg`,
    description: "Court-dominating cushion with the grip to match. Power Cushion+ absorbs impact and returns energy, keeping your footwork sharp through long rallies.",
    tags: ["stability", "all court", "cushion"],
  },
  {
    id: "p-aerus-z2", name: "AERUS Z2", brand: "Yonex", category: "Shoes",
    price: 8490, compareAt: 9990,
    image: `${Y}/s/h/sh-aerusz2mex-101_3.jpg`,
    description: "Ultralight design at just 290g. Power Cushion technology returns energy into every step. The choice for players who live on the front foot.",
    tags: ["lightweight", "speed", "front court"],
  },
  {
    id: "p-yonex-pc88", name: "POWER CUSHION 88", brand: "Yonex", category: "Shoes",
    price: 11490, compareAt: 13490,
    image: `${Y}/p/c/pc88ex-001.jpg`,
    description: "The top-of-the-line Yonex competition shoe. Round Sole technology and wide toe box provide exceptional lateral support for aggressive court coverage.",
    tags: ["competition", "stability", "all court"],
  },
  {
    id: "p-ranger-lite", name: "RANGER LITE", brand: "Li-Ning", category: "Shoes",
    price: 4990, compareAt: 6490,
    image: svgArt("shoe", "#b65a39", "#d7e8c1"),
    description: "Club-session ready at an honest price. Premium rubber sole, padded collar, and reinforced toe area — the dependable daily choice.",
    tags: ["value", "all court", "durable"],
  },
  {
    id: "p-victor-a970", name: "A970", brand: "Victor", category: "Shoes",
    price: 7290, compareAt: 8490,
    image: `${V}/a/9/a970-ab_1.jpg`,
    description: "Stable and responsive. ENERGYMAX technology in the midsole returns energy into every push. A competition favourite for defensive players.",
    tags: ["stability", "grip", "defensive"],
  },
  {
    id: "p-victor-p9200", name: "SH-P9200", brand: "Victor", category: "Shoes",
    price: 8990, compareAt: 10490,
    image: `${V}/s/h/sh-p9200-ab_1.jpg`,
    description: "Victor's flagship court shoe. Lightweight VSR technology with ENERGYMAX cushion delivers elite-level performance in every direction.",
    tags: ["lightweight", "competition", "cushion"],
  },

  // ── Shuttlecocks ──
  {
    id: "p-as50", name: "AEROSENSA 50", brand: "Yonex", category: "Shuttlecocks",
    price: 1150, compareAt: 1290, featured: true, badge: "Tournament",
    image: `${Y}/a/s/as50-001_1.jpg`,
    description: "Top-grade feather shuttlecock used at the BWF World Championships. Natural goose feathers hand-sorted for consistent flight and superior feel.",
    tags: ["feather", "tournament", "BWF approved"],
  },
  {
    id: "p-mavis-350", name: "MAVIS 350", brand: "Yonex", category: "Shuttlecocks",
    price: 590, compareAt: 690,
    image: `${Y}/m/v/mv350-001.jpg`,
    description: "The gold standard of nylon shuttlecocks. Consistent speed in all conditions, durable dome, and natural feather-like flight path.",
    tags: ["nylon", "all weather", "durable"],
  },
  {
    id: "p-as9-shuttle", name: "AEROSENSA 9", brand: "Yonex", category: "Shuttlecocks",
    price: 890,
    image: svgArt("shuttle", "#f3f0e6", "#b9e532"),
    description: "Mid-grade feather shuttlecock for training and club play. Grade 9 feathers deliver reliable flight and good durability for regular sessions.",
    tags: ["feather", "training", "club"],
  },

  // ── Strings ──
  {
    id: "p-bg80", name: "BG80", brand: "Yonex", category: "Strings",
    price: 690, compareAt: 790, featured: true,
    image: `${Y}/b/g/bg80-001.jpg`,
    description: "The tournament string of champions. Thinner 0.68mm gauge for explosive repulsion and a sharp, crisp hit feel. Go-to choice of professional players worldwide.",
    tags: ["repulsion", "0.68mm", "tournament"],
  },
  {
    id: "p-bg65ti", name: "BG65 TITANIUM", brand: "Yonex", category: "Strings",
    price: 590, compareAt: 690,
    image: `${Y}/b/g/bg65ti-001.jpg`,
    description: "Titanium-treated surface adds durability and resilience. A versatile 0.70mm string that balances power, control, and longevity for regular players.",
    tags: ["titanium", "durable", "0.70mm"],
  },

  // ── Grips ──
  {
    id: "p-ac102c", name: "SUPER GRAP OVERGRIP", brand: "Yonex", category: "Grips",
    price: 299, compareAt: 349,
    image: `${Y}/a/c/ac102c-001.jpg`,
    description: "World's best-selling badminton overgrip. Super absorbent PU material wicks sweat instantly. Pack of 3, available in multiple colours.",
    tags: ["overgrip", "absorbent", "PU", "pack of 3"],
  },
  {
    id: "p-ac102", name: "TOWEL GRIP", brand: "Yonex", category: "Grips",
    price: 349, compareAt: 399,
    image: `${Y}/a/c/ac102-001.jpg`,
    description: "Classic towel grip for players who prefer a softer, more natural feel. Excellent sweat absorption without chemical coating — used by many professionals.",
    tags: ["towel", "natural feel", "heavy sweaters"],
  },
  {
    id: "p-ac108ex", name: "WAVE GRAP OVERGRIP", brand: "Yonex", category: "Grips",
    price: 249,
    image: `${Y}/a/c/ac108ex-001.jpg`,
    description: "Wave-texture surface provides reliable grip in humid conditions. Lightweight and thin — ideal for players who want minimal added bulk on the handle.",
    tags: ["wave texture", "thin", "overgrip"],
  },

  // ── Kit Bags ──
  {
    id: "p-bag92229", name: "TOURNAMENT BAG EX", brand: "Yonex", category: "Kit Bags",
    price: 5490, compareAt: 6490, featured: true,
    image: `${Y}/b/a/ba92229ex-522.jpg`,
    description: "Spacious 2-compartment tournament bag with dedicated racket sleeves for up to 6 rackets. Shoe compartment, multiple pockets, and thermal lining to protect strings.",
    tags: ["6 rackets", "thermal lining", "tournament"],
  },
  {
    id: "p-bag9226", name: "TEAM SERIES BAG", brand: "Yonex", category: "Kit Bags",
    price: 3990, compareAt: 4790,
    image: `${Y}/b/a/bag9226ex-522.jpg`,
    description: "Versatile team bag for the training grind. Holds up to 4 rackets, has separate shoe compartment, and padded shoulder straps for all-day comfort.",
    tags: ["4 rackets", "training", "comfortable"],
  },

  // ── Apparel ──
  {
    id: "p-tshirt-2009", name: "TOURNAMENT T-SHIRT EX", brand: "Yonex", category: "Apparel",
    price: 1990, compareAt: 2490, featured: true,
    image: `${Y}/a/t/at2009ex-001.jpg`,
    description: "Official tournament tee made with Dry-Fit fabric for rapid moisture management. Lightweight, stretchy weave gives total freedom of movement on court.",
    tags: ["dry-fit", "tournament", "unisex"],
  },
  {
    id: "p-polo-20192", name: "CLUB POLO EX", brand: "Yonex", category: "Apparel",
    price: 1690, compareAt: 1990,
    image: `${Y}/a/t/at20192ex-001.jpg`,
    description: "Smart club polo with moisture-wicking treatment and UV protection. Relaxed fit suitable for both court play and casual wear.",
    tags: ["polo", "UV protection", "moisture wicking"],
  },
  {
    id: "p-tshirt-2051", name: "PRACTICE T-SHIRT", brand: "Yonex", category: "Apparel",
    price: 1290, compareAt: 1590,
    image: `${Y}/a/t/at2051-001.jpg`,
    description: "Everyday training tee with breathable Dry-Fit fabric. Simple, comfortable and durable — ideal for daily practice sessions.",
    tags: ["training", "breathable", "value"],
  },

  // ── Socks ──
  {
    id: "p-socks-sk8", name: "SPORTS SOCKS 3D ERGO", brand: "Yonex", category: "Socks",
    price: 499, compareAt: 599,
    image: `${Y}/s/k/sk8ex-001.jpg`,
    description: "3D Ergo construction follows the natural curve of the foot for a perfect, blister-free fit. Extra cushioning at heel and toe for court-specific support.",
    tags: ["3D ergo", "anti-blister", "padded"],
  },

  // ── Accessories ──
  {
    id: "p-towel-mp20", name: "SPORT TOWEL", brand: "Yonex", category: "Accessories",
    price: 699, compareAt: 849,
    image: `${Y}/m/p/mp20-001_1.jpg`,
    description: "Quick-dry microfibre sport towel. Highly absorbent, lightweight and compact — packs down small for the kit bag and dries fast courtside.",
    tags: ["microfibre", "quick-dry", "compact"],
  },
];

const seedUsers: User[] = [
  { id: "u-admin", name: "Bazaar Admin", email: "avilit9@gmail.com", password: "admin", admin: true, joined: "Founder account" },
];

/* ─── Utilities ──────────────────────────────────────────────── */
const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const storage = {
  get<T>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
  },
  set(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ } },
};

function isYouTubeUrl(url: string) {
  return /youtu(be\.com|\.be)/i.test(url);
}
function youtubeEmbedUrl(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : null;
}

/* ─── Image fetch helpers ────────────────────────────────────── */
function buildImageCandidates(name: string, category: Category): { label: string; url: string }[] {
  const key = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const catWord = {
    "Rackets": "racket", "Shoes": "badminton+shoe", "Shuttlecocks": "shuttlecock",
    "Strings": "badminton+string", "Grips": "badminton+grip", "Kit Bags": "badminton+bag",
    "Apparel": "badminton+shirt", "Socks": "sport+sock", "Accessories": "badminton+accessory",
  }[category] ?? "badminton";
  const brand = key.split(" ")[0];
  return [1, 3, 7, 11, 17, 23, 31, 37].map((s, i) => ({
    label: `Option ${i + 1}`,
    url: `https://loremflickr.com/600/600/${catWord},${brand}?lock=${s}`,
  }));
}

/* ════════════════════════════════════════════════════════════════
   ROOT APP COMPONENT
══════════════════════════════════════════════════════════════════ */
function App() {
  const [products, setProducts] = useState<Product[]>(() => storage.get("bb-products-v3", initialProducts));
  const [users, setUsers] = useState<User[]>(() => {
    const saved = storage.get<User[]>("bb-users-v2", seedUsers);
    return saved.some((u) => u.id === "u-admin") ? saved : [seedUsers[0], ...saved];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.get<User | null>("bb-current-user", null));
  const [cart, setCart] = useState<CartLine[]>(() => storage.get("bb-cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() => storage.get("bb-wishlist", []));
  const [view, setView] = useState<View>("store");
  const [modal, setModal] = useState<Modal>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<"All" | Category>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [heroBackground, setHeroBackground] = useState(() => storage.get("bb-hero-bg", ""));
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => storage.set("bb-products-v3", products), [products]);
  useEffect(() => storage.set("bb-users-v2", users), [users]);
  useEffect(() => storage.set("bb-current-user", currentUser), [currentUser]);
  useEffect(() => storage.set("bb-cart", cart), [cart]);
  useEffect(() => storage.set("bb-wishlist", wishlist), [wishlist]);
  useEffect(() => storage.set("bb-hero-bg", heroBackground), [heroBackground]);

  const toast = (message: string, error = false) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, error }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  };

  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);
  const cartTotal = cart.reduce((s, l) => s + (products.find((p) => p.id === l.productId)?.price ?? 0) * l.quantity, 0);

  const filteredProducts = useMemo(() => products
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => `${p.name} ${p.brand} ${p.category} ${p.tags.join(" ")} ${p.badge ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
    [products, category, query, sort]);

  const openProduct = (p: Product) => { setSelectedProduct(p); setModal("product"); };
  const addToCart = (id: string, qty = 1) => {
    setCart((lines) => {
      const ex = lines.find((l) => l.productId === id);
      return ex ? lines.map((l) => l.productId === id ? { ...l, quantity: l.quantity + qty } : l) : [...lines, { productId: id, quantity: qty }];
    });
    toast("Added to your bag ✓");
  };
  const updateQty = (id: string, delta: number) => setCart((lines) => lines.map((l) => l.productId === id ? { ...l, quantity: Math.max(0, l.quantity + delta) } : l).filter((l) => l.quantity > 0));
  const toggleWishlist = (id: string) => setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const requireAuth = () => { if (!currentUser) { setAuthMode("login"); setAuthError(""); setModal("auth"); return false; } return true; };
  const signOut = () => { setCurrentUser(null); setView("store"); toast("Signed out."); };

  const onAuth = (email: string, password: string, name: string) => {
    if (authMode === "login") {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) { setAuthError("Incorrect email or password."); return; }
      setCurrentUser(user); setModal(null); setAuthError("");
      toast(`Welcome back, ${user.name.split(" ")[0]}!`);
    } else {
      if (!name.trim()) { setAuthError("Please enter your name."); return; }
      if (!email.includes("@")) { setAuthError("Please enter a valid email address."); return; }
      if (password.length < 4) { setAuthError("Password must be at least 4 characters."); return; }
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) { setAuthError("An account with this email already exists."); return; }
      const user: User = { id: `u-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, admin: false, joined: new Date().toLocaleDateString("en-IN") };
      setUsers((prev) => [...prev, user]); setCurrentUser(user); setModal(null); setAuthError("");
      toast(`Welcome, ${user.name.split(" ")[0]}!`);
    }
  };

  const updateUser = (updated: User) => {
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
  };

  const saveProduct = (p: Product) => {
    setProducts((prev) => prev.some((x) => x.id === p.id) ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p]);
    setEditingProduct(null);
    toast(products.some((x) => x.id === p.id) ? "Product updated." : "Product added to catalog.");
  };

  const deleteProduct = (id: string) => {
    if (window.confirm("Remove this product from the catalog?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast("Product removed.");
    }
  };

  return (
    <div className="app-shell">
      <TopNav currentUser={currentUser} cartCount={cartCount} query={query}
        setQuery={(q) => { setQuery(q); setView("store"); }} setModal={setModal}
        setView={setView} view={view} setCategory={setCategory}
        setAuthMode={setAuthMode} setAuthError={setAuthError} />
      <Ticker />

      {view === "store" && (
        <Storefront products={filteredProducts} allProducts={products} category={category}
          setCategory={setCategory} sort={sort} setSort={setSort} query={query}
          openProduct={openProduct} addToCart={addToCart} wishlist={wishlist}
          toggleWishlist={toggleWishlist} heroBackground={heroBackground} />
      )}
      {view === "account" && currentUser && (
        <Account user={currentUser} updateUser={updateUser} signOut={signOut} toast={toast} />
      )}
      {view === "account" && !currentUser && (
        <div className="gate-screen">
          <div className="gate-inner">
            <UserRound size={40} />
            <h2>Sign in to your account</h2>
            <p>Create an account or sign in to track your orders and manage preferences.</p>
            <button className="btn-primary" onClick={() => { setAuthMode("login"); setModal("auth"); }}>Sign In</button>
            <button className="btn-ghost" onClick={() => { setAuthMode("register"); setModal("auth"); }}>Create Account</button>
          </div>
        </div>
      )}
      {view === "admin" && currentUser?.admin && (
        <Admin products={products} users={users} setUsers={setUsers}
          heroBackground={heroBackground} setHeroBackground={setHeroBackground}
          toast={toast} modal={modal} setModal={setModal}
          editingProduct={editingProduct} setEditingProduct={setEditingProduct}
          saveProduct={saveProduct} deleteProduct={deleteProduct} />
      )}
      {view === "admin" && !currentUser?.admin && (
        <div className="gate-screen">
          <div className="gate-inner">
            <ShieldCheck size={40} /><h2>Admin access required</h2>
            <p>Sign in with an admin account to access the control panel.</p>
            <button className="btn-primary" onClick={() => setView("store")}>Back to Store</button>
          </div>
        </div>
      )}

      <SiteFooter setView={setView} setCategory={setCategory} />

      {modal === "product" && selectedProduct && (
        <ProductModal product={selectedProduct} close={() => setModal(null)} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
      )}
      {modal === "cart" && (
        <CartDrawer cart={cart} products={products} close={() => setModal(null)} updateQty={updateQty} openProduct={openProduct} total={cartTotal} requireAuth={requireAuth} setModal={setModal} toast={toast} />
      )}
      {modal === "auth" && (
        <AuthModal mode={authMode} setMode={(m) => { setAuthMode(m); setAuthError(""); }} close={() => setModal(null)} submit={onAuth} error={authError} />
      )}
      {modal === "checkout" && (
        <CheckoutModal close={() => setModal(null)} total={cartTotal} clearCart={() => setCart([])} toast={toast} />
      )}
      {modal === "add-user" && currentUser?.admin && (
        <AddUserModal close={() => setModal(null)} users={users} setUsers={setUsers} toast={toast} />
      )}
      {editingProduct && view === "admin" && (
        <ProductEditor product={editingProduct} close={() => setEditingProduct(null)} save={saveProduct} />
      )}

      {toasts.length > 0 && (
        <div className="toast-stack" aria-live="polite">
          {toasts.map((t) => <div className={`toast ${t.error ? "error" : ""}`} key={t.id}>{t.message}</div>)}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TOP NAV
══════════════════════════════════════════════════════════════════ */
function TopNav({ currentUser, cartCount, query, setQuery, setModal, setView, view, setCategory, setAuthMode, setAuthError }: {
  currentUser: User | null; cartCount: number; query: string; setQuery: (v: string) => void;
  setModal: (v: Modal) => void; setView: (v: View) => void; view: View;
  setCategory: (v: "All" | Category) => void; setAuthMode: (v: "login" | "register") => void;
  setAuthError: (v: string) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="site-header">
      <div className="header-top">
        <span>Free delivery across India on orders above ₹2,500</span>
        <div className="header-top-links">
          <button onClick={() => setView("account")}>My Account</button>
        </div>
      </div>
      <nav className="nav-main">
        <div className="nav-inner">
          <button className="brand-btn" onClick={() => { setView("store"); setCategory("All"); }} data-testid="button-home">
            <span className="brand-mark">B</span>
            <div className="brand-text">
              <span className="brand-name">Badminton Bazaar</span>
              <span className="brand-tagline">Play it sharp</span>
            </div>
          </button>

          <div className="nav-links">
            {(["Rackets", "Shoes", "Shuttlecocks", "Strings", "Grips", "Kit Bags", "Apparel"] as Category[]).map((cat) => (
              <button key={cat} className="nav-link" onClick={() => { setView("store"); setCategory(cat); }} data-testid={`button-nav-${cat.toLowerCase().replace(" ", "-")}`}>{cat}</button>
            ))}
            {currentUser?.admin && (
              <button className={`nav-link ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")} data-testid="button-open-admin">
                <LayoutDashboard size={14} style={{ verticalAlign: "middle", marginRight: 3 }} />Admin
              </button>
            )}
          </div>

          <div className="nav-actions">
            <div className="nav-search-wrap">
              <button className="icon-btn" onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => inputRef.current?.focus(), 50); }} title="Search">
                <Search size={20} />
              </button>
              {searchOpen && (
                <div className="nav-search-dropdown">
                  <Search size={16} />
                  <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rackets, shoes, brands…" data-testid="input-search-products" autoFocus />
                  <button onClick={() => { setSearchOpen(false); setQuery(""); }}><X size={15} /></button>
                </div>
              )}
            </div>
            <button className="icon-btn" onClick={() => { if (currentUser) setView("account"); else { setAuthMode("login"); setAuthError(""); setModal("auth"); } }} title={currentUser ? "Account" : "Sign in"} data-testid="button-open-account">
              <UserRound size={20} />
              {currentUser && <span className="nav-user-dot" />}
            </button>
            <button className="icon-btn cart-btn" onClick={() => setModal("cart")} title="Cart" data-testid="button-open-cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

/* ─── Ticker ─────────────────────────────────────────────────── */
function Ticker() {
  const items = Array(8).fill("100% ORIGINAL & VERIFIED PRODUCTS");
  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-track">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="ticker-item">{t} <span className="ticker-dot">✦</span></span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STOREFRONT
══════════════════════════════════════════════════════════════════ */
function Storefront({ products, allProducts, category, setCategory, sort, setSort, query, openProduct, addToCart, wishlist, toggleWishlist, heroBackground }: {
  products: Product[]; allProducts: Product[]; category: "All" | Category;
  setCategory: (v: "All" | Category) => void; sort: string; setSort: (v: string) => void;
  query: string; openProduct: (p: Product) => void; addToCart: (id: string) => void;
  wishlist: string[]; toggleWishlist: (id: string) => void; heroBackground: string;
}) {
  const featured = allProducts.filter((p) => p.featured).slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className="hero" style={heroBackground ? { backgroundImage: `url(${heroBackground})` } : undefined}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">THE NEW STANDARD</p>
          <h1 className="hero-title">UNLEASH<br /><em>ABSOLUTE POWER</em></h1>
          <p className="hero-sub">Competition-ready rackets, shoes, shuttles & more for India's finest courts.</p>
          <button className="btn-hero" onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })}>
            EXPLORE NOW <ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-racket-art" aria-hidden="true">
          <img src={`${Y}/a/x/ax100zz-366.jpg`} alt="" onError={(e) => { (e.target as HTMLImageElement).src = svgArt("racket", "#b9e532", "#fff"); }} />
        </div>
      </section>

      {/* Category quick-links */}
      <section className="category-scroller">
        <div className="category-scroll-inner">
          {ALL_CATEGORIES.map((cat) => (
            <button key={cat} className={`cat-chip ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)} data-testid={`button-category-${cat.toLowerCase().replace(" ", "-")}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {!query && (
        <section className="section-block">
          <div className="section-head">
            <div><p className="eyebrow">New Arrivals</p><h2 className="section-title">TOP PICKS</h2></div>
            <button className="btn-ghost-sm" onClick={() => setCategory("All")}>View all →</button>
          </div>
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} openProduct={openProduct} addToCart={addToCart} isWishlisted={wishlist.includes(p.id)} toggleWishlist={toggleWishlist} />)}
          </div>
        </section>
      )}

      {/* Full catalog */}
      <section className="section-block" id="products-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">{category === "All" ? "Full Catalog" : category}</p>
            <h2 className="section-title">{query ? `RESULTS FOR "${query.toUpperCase()}"` : category === "All" ? "ALL GEAR" : category.toUpperCase()}</h2>
          </div>
          <div className="filter-row">
            <div className="filter-pills">
              <button className={`pill ${category === "All" ? "active" : ""}`} onClick={() => setCategory("All")}>All</button>
              {ALL_CATEGORIES.map((c) => (
                <button key={c} className={`pill ${category === c ? "active" : ""}`} onClick={() => setCategory(c)} data-testid={`button-filter-${c.toLowerCase().replace(" ", "-")}`}>{c}</button>
              ))}
            </div>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" data-testid="select-sort-products">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
        </div>
        <div className="product-grid">
          {products.length === 0
            ? <div className="empty-state"><Search size={32} /><strong>No results</strong><span>Try a different search or filter.</span></div>
            : products.map((p) => <ProductCard key={p.id} product={p} openProduct={openProduct} addToCart={addToCart} isWishlisted={wishlist.includes(p.id)} toggleWishlist={toggleWishlist} />)}
        </div>
      </section>

      {!query && (
        <div className="trust-row">
          <div className="trust-item"><BadgeCheck size={22} /><div><strong>100% Genuine</strong><span>Only authentic products from trusted brands</span></div></div>
          <div className="trust-item"><Truck size={22} /><div><strong>Fast Dispatch</strong><span>Orders processed within 1–2 business days</span></div></div>
          <div className="trust-item"><ShieldCheck size={22} /><div><strong>Play-Tested</strong><span>Curated by players, for players</span></div></div>
          <div className="trust-item"><Sparkles size={22} /><div><strong>INR Pricing</strong><span>Competitive prices for Indian courts</span></div></div>
        </div>
      )}
    </main>
  );
}

/* ─── Product Card ───────────────────────────────────────────── */
function ProductCard({ product, openProduct, addToCart, isWishlisted, toggleWishlist }: {
  product: Product; openProduct: (p: Product) => void; addToCart: (id: string) => void;
  isWishlisted: boolean; toggleWishlist: (id: string) => void;
}) {
  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      <div className="product-img-wrap">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {product.showcase && <span className="showcase-indicator" title="Has showcase media"><Play size={10} /></span>}
        <button className={`wishlist-btn ${isWishlisted ? "active" : ""}`} onClick={() => toggleWishlist(product.id)} title="Wishlist" data-testid={`button-wishlist-${product.id}`}>
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <button className="img-btn" onClick={() => openProduct(product)} data-testid={`button-view-product-${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = svgArt("racket", "#59635a"); }} />
        </button>
      </div>
      <div className="product-body">
        <p className="product-meta-line">{product.category} · {product.brand}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-row">
          <span className="price" data-testid={`text-price-${product.id}`}>{money(product.price)}</span>
          {product.compareAt && <span className="price-old">{money(product.compareAt)}</span>}
        </div>
        <button className="btn-add-cart" onClick={() => addToCart(product.id)} data-testid={`button-add-cart-${product.id}`}>Add to Bag</button>
      </div>
    </article>
  );
}

/* ─── Product Modal ──────────────────────────────────────────── */
function ProductModal({ product, close, addToCart, wishlist, toggleWishlist }: {
  product: Product; close: () => void; addToCart: (id: string, qty?: number) => void;
  wishlist: string[]; toggleWishlist: (id: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [showShowcase, setShowShowcase] = useState(false);
  const embedUrl = product.showcase && isYouTubeUrl(product.showcase) ? youtubeEmbedUrl(product.showcase) : null;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <section className="modal modal-wide" role="dialog" aria-modal="true" data-testid="modal-product-detail">
        <button className="modal-close" onClick={close} data-testid="button-close-product"><X size={22} /></button>
        <div className="modal-product-layout">
          <div className="modal-product-img">
            {!showShowcase || !product.showcase ? (
              <img src={product.image} alt={product.name} onError={(e) => { (e.target as HTMLImageElement).src = svgArt("racket", "#59635a"); }} />
            ) : embedUrl ? (
              <iframe src={embedUrl} title="Product video" allowFullScreen className="showcase-iframe" />
            ) : (
              <img src={product.showcase} alt={`${product.name} showcase`} onError={(e) => { (e.target as HTMLImageElement).src = product.image; }} />
            )}
            {product.showcase && (
              <div className="showcase-toggle-row">
                <button className={`showcase-tab ${!showShowcase ? "active" : ""}`} onClick={() => setShowShowcase(false)}>Photo</button>
                <button className={`showcase-tab ${showShowcase ? "active" : ""}`} onClick={() => setShowShowcase(true)}>
                  {embedUrl ? <><Play size={12} /> Video</> : "Showcase"}
                </button>
              </div>
            )}
          </div>
          <div className="modal-product-info">
            <p className="product-meta-line">{product.category} · {product.brand}</p>
            <h2 className="modal-product-name">{product.name}</h2>
            <p className="modal-product-desc">{product.description}</p>
            {product.tags.length > 0 && (
              <div className="tag-row">{product.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            )}
            <div className="modal-price">
              {money(product.price)}
              {product.compareAt && <span className="price-old" style={{ fontSize: 16, marginLeft: 10 }}>{money(product.compareAt)}</span>}
            </div>
            <div className="qty-row">
              <div className="qty-ctrl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} data-testid="button-detail-decrease"><Minus size={15} /></button>
                <span data-testid="text-detail-quantity">{qty}</span>
                <button onClick={() => setQty(qty + 1)} data-testid="button-detail-increase"><Plus size={15} /></button>
              </div>
              <button className="btn-primary btn-full-row" onClick={() => { addToCart(product.id, qty); close(); }} data-testid="button-detail-add">
                Add {qty > 1 ? `${qty} ` : ""}to Bag
              </button>
              <button className={`btn-icon-outline ${wishlist.includes(product.id) ? "wishlisted" : ""}`} onClick={() => toggleWishlist(product.id)} data-testid="button-detail-wishlist" title="Wishlist">
                <Heart size={18} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="modal-ship-note"><Truck size={13} /> Free delivery on orders above ₹2,500</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Cart Drawer ────────────────────────────────────────────── */
function CartDrawer({ cart, products, close, updateQty, openProduct, total, requireAuth, setModal, toast }: {
  cart: CartLine[]; products: Product[]; close: () => void; updateQty: (id: string, n: number) => void;
  openProduct: (p: Product) => void; total: number; requireAuth: () => boolean;
  setModal: (v: Modal) => void; toast: (msg: string, err?: boolean) => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <aside className="drawer" aria-label="Cart" data-testid="drawer-cart">
        <div className="drawer-header">
          <h2>Your Bag <span className="cart-count-text">({cart.reduce((s, l) => s + l.quantity, 0)})</span></h2>
          <button className="modal-close" onClick={close} data-testid="button-close-cart"><X size={20} /></button>
        </div>
        <div className="drawer-body">
          {cart.length === 0
            ? <div className="empty-state" style={{ marginTop: 40 }}>
                <ShoppingBag size={32} /><strong>Your bag is empty</strong><span>Add gear to get started.</span>
                <button className="btn-primary" style={{ marginTop: 16 }} onClick={close} data-testid="button-continue-shopping">Continue Shopping</button>
              </div>
            : cart.map((line) => {
                const p = products.find((x) => x.id === line.productId);
                if (!p) return null;
                return (
                  <div className="cart-line" key={line.productId} data-testid={`row-cart-${line.productId}`}>
                    <button className="cart-img-btn" onClick={() => { close(); openProduct(p); }}>
                      <img src={p.image} alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = svgArt("racket", "#59635a"); }} />
                    </button>
                    <div className="cart-line-info">
                      <h4>{p.name}</h4>
                      <p>{p.brand} · {money(p.price)}</p>
                      <div className="qty-ctrl sm">
                        <button onClick={() => updateQty(p.id, -1)} data-testid={`button-cart-decrease-${p.id}`}><Minus size={12} /></button>
                        <span>{line.quantity}</span>
                        <button onClick={() => updateQty(p.id, 1)} data-testid={`button-cart-increase-${p.id}`}><Plus size={12} /></button>
                      </div>
                    </div>
                    <div className="cart-line-right">
                      <span>{money(p.price * line.quantity)}</span>
                      <button className="remove-btn" onClick={() => { updateQty(p.id, -line.quantity); toast("Removed from bag."); }} data-testid={`button-remove-cart-${p.id}`}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })
          }
        </div>
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="total-row"><span>Order Total</span><span data-testid="text-cart-total">{money(total)}</span></div>
            <button className="btn-primary btn-full" onClick={() => { if (requireAuth()) { close(); setModal("checkout"); } }} data-testid="button-checkout">
              <CreditCard size={16} /> Proceed to Checkout
            </button>
            <p className="demo-note">Secure checkout — your data is safe with us.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ─── Auth Modal ─────────────────────────────────────────────── */
function AuthModal({ mode, setMode, close, submit, error }: {
  mode: "login" | "register"; setMode: (m: "login" | "register") => void;
  close: () => void; submit: (email: string, password: string, name: string) => void; error: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <section className="modal" role="dialog" aria-modal="true" data-testid="modal-auth">
        <button className="modal-close" onClick={close} data-testid="button-close-auth"><X size={20} /></button>
        <div className="modal-auth-brand"><span className="brand-mark sm">B</span><span>Badminton Bazaar</span></div>
        <div className="modal-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} data-testid="button-auth-login-tab">Sign In</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} data-testid="button-auth-register-tab">Register</button>
        </div>
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submit(email, password, name); }}>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="auth-name">Full Name</label>
              <input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" data-testid="input-auth-name" />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email Address</label>
            <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required data-testid="input-auth-email" />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <div className="pw-wrap">
              <input id="auth-password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required data-testid="input-auth-password" />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          {error && <div className="form-error" data-testid="status-auth-error">{error}</div>}
          <button className="btn-primary btn-full" type="submit" data-testid="button-submit-auth">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
          {mode === "login" && (
            <p className="auth-switch-note">
              Don't have an account? <button type="button" className="link-btn" onClick={() => setMode("register")}>Register here</button>
            </p>
          )}
          {mode === "register" && (
            <p className="auth-switch-note">
              Already have an account? <button type="button" className="link-btn" onClick={() => setMode("login")}>Sign in</button>
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

/* ─── Checkout Modal ─────────────────────────────────────────── */
function CheckoutModal({ close, total, clearCart, toast }: {
  close: () => void; total: number; clearCart: () => void; toast: (msg: string) => void;
}) {
  const [done, setDone] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  if (done) return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" data-testid="modal-checkout-success">
        <div className="success-body">
          <div className="success-icon"><Check size={32} /></div>
          <h2>Order Placed!</h2>
          <p>Your order for <strong>{money(total)}</strong> has been confirmed. We'll be in touch soon.</p>
          <button className="btn-primary" onClick={close} data-testid="button-close-success">Back to Store</button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" data-testid="modal-checkout">
        <button className="modal-close" onClick={close} data-testid="button-close-checkout"><X size={20} /></button>
        <div className="modal-header-block"><h2>Checkout</h2></div>
        <div className="modal-form">
          <div className="field">
            <label htmlFor="checkout-address">Delivery Address</label>
            <textarea id="checkout-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat, street, city, PIN code" data-testid="input-checkout-address" />
          </div>
          <div className="field">
            <label htmlFor="checkout-phone">Phone Number</label>
            <input id="checkout-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" data-testid="input-checkout-phone" />
          </div>
          <div className="order-total-row"><span>Order Total</span><strong>{money(total)}</strong></div>
          <button className="btn-primary btn-full" onClick={() => { setDone(true); clearCart(); toast("Order placed successfully!"); }} data-testid="button-place-order">
            Place Order
          </button>
        </div>
      </section>
    </div>
  );
}

/* ─── Add User Modal ─────────────────────────────────────────── */
function AddUserModal({ close, users, setUsers, toast }: {
  close: () => void; users: User[]; setUsers: (v: User[]) => void; toast: (msg: string, err?: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast("Name is required.", true); return; }
    if (!email.includes("@")) { toast("Enter a valid email.", true); return; }
    if (password.length < 4) { toast("Password needs at least 4 characters.", true); return; }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) { toast("Email already in use.", true); return; }
    const user: User = { id: `u-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, admin: isAdmin, joined: new Date().toLocaleDateString("en-IN") };
    setUsers([...users, user]);
    toast(`User "${user.name}" added.`);
    close();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <section className="modal" role="dialog" aria-modal="true" data-testid="modal-add-user">
        <button className="modal-close" onClick={close}><X size={20} /></button>
        <div className="modal-header-block"><h2>Add New User</h2></div>
        <form className="modal-form" onSubmit={submit}>
          <div className="field"><label htmlFor="nu-name">Full Name</label><input id="nu-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="User's name" required /></div>
          <div className="field"><label htmlFor="nu-email">Email Address</label><input id="nu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required /></div>
          <div className="field"><label htmlFor="nu-password">Password</label><input id="nu-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 4 characters" required /></div>
          <div className="field-check">
            <input id="nu-admin" type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            <label htmlFor="nu-admin">Grant Admin Access</label>
          </div>
          <button className="btn-primary btn-full" type="submit">Add User</button>
        </form>
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ACCOUNT PAGE
══════════════════════════════════════════════════════════════════ */
function Account({ user, updateUser, signOut, toast }: {
  user: User; updateUser: (u: User) => void; signOut: () => void; toast: (msg: string, err?: boolean) => void;
}) {
  const [newEmail, setNewEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const saveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes("@")) { toast("Enter a valid email.", true); return; }
    updateUser({ ...user, email: newEmail.trim().toLowerCase() });
    toast("Email updated successfully.");
  };

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) { toast("Password must be at least 4 characters.", true); return; }
    if (newPassword !== confirmPw) { toast("Passwords do not match.", true); return; }
    updateUser({ ...user, password: newPassword });
    setNewPassword(""); setConfirmPw("");
    toast("Password updated successfully.");
  };

  return (
    <main className="account-page">
      <div className="account-container">
        <div className="account-header">
          <div className="account-avatar">{initials}</div>
          <div>
            <h1 data-testid="text-account-name">{user.name}</h1>
            <p data-testid="text-account-email">{user.email}</p>
            {user.admin && <span className="admin-pill">Admin</span>}
          </div>
          <button className="btn-ghost" onClick={signOut} style={{ marginLeft: "auto" }} data-testid="button-account-signout">Sign Out</button>
        </div>
        <div className="account-cards">
          <section className="account-card">
            <h2><Package size={18} /> Order History</h2>
            <p className="card-desc">No orders yet. Shop our catalog to get started.</p>
          </section>
          <section className="account-card">
            <h2>Change Email</h2>
            <form onSubmit={saveEmail}>
              <div className="field"><label htmlFor="acc-email">New Email Address</label><input id="acc-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} data-testid="input-account-email" /></div>
              <button className="btn-primary" type="submit" data-testid="button-save-email">Save Email</button>
            </form>
          </section>
          <section className="account-card">
            <h2>Change Password</h2>
            <form onSubmit={savePassword}>
              <div className="field">
                <label htmlFor="acc-pw">New Password</label>
                <div className="pw-wrap">
                  <input id="acc-pw" type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 4 characters" data-testid="input-account-password" />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>
              <div className="field"><label htmlFor="acc-pw-confirm">Confirm Password</label><input id="acc-pw-confirm" type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Re-enter new password" /></div>
              <button className="btn-primary" type="submit" data-testid="button-save-password">Save Password</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════════════════════════════ */
function Admin({ products, users, setUsers, heroBackground, setHeroBackground, toast, modal, setModal, editingProduct, setEditingProduct, saveProduct, deleteProduct }: {
  products: Product[]; users: User[]; setUsers: (v: User[]) => void;
  heroBackground: string; setHeroBackground: (v: string) => void;
  toast: (msg: string, err?: boolean) => void; modal: Modal; setModal: (v: Modal) => void;
  editingProduct: Product | null; setEditingProduct: (p: Product | null) => void;
  saveProduct: (p: Product) => void; deleteProduct: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"products" | "users" | "settings">("products");
  const [bgUrl, setBgUrl] = useState(heroBackground);
  // Non-admin users only (admin accounts hidden from public display)
  const regularUsers = users.filter((u) => !u.admin);
  const allDisplayUsers = users; // admin sees all

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div><p className="eyebrow">Control Panel</p><h1>Admin Dashboard</h1></div>
          <button className="btn-primary" onClick={() => setEditingProduct({ id: `p-${Date.now()}`, name: "", brand: "", category: "Rackets", price: 0, description: "", image: svgArt("racket", "#59635a"), tags: [], featured: false })} data-testid="button-add-product">
            <Plus size={16} /> Add Product
          </button>
        </div>
        <div className="stats-row">
          <div className="stat-card"><span>Products</span><strong data-testid="stat-product-count">{products.length}</strong></div>
          <div className="stat-card"><span>Registered Users</span><strong data-testid="stat-user-count">{regularUsers.length}</strong></div>
          <div className="stat-card"><span>Admin Accounts</span><strong data-testid="stat-admin-count">{users.filter((u) => u.admin).length}</strong></div>
        </div>

        <div className="admin-tabs">
          {(["products", "users", "settings"] as const).map((tab) => (
            <button key={tab} className={`admin-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <div className="admin-panel">
            <div className="panel-header"><h2>Product Catalog</h2><span className="panel-count">{products.length} items</span></div>
            <div className="admin-table-wrap">
              <table className="admin-table" data-testid="table-products">
                <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Compare At</th><th>Showcase</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} data-testid={`row-admin-product-${p.id}`}>
                      <td><div className="table-product"><img src={p.image} alt="" onError={(e) => { (e.target as HTMLImageElement).src = svgArt("racket", "#59635a"); }} /><strong>{p.name}</strong></div></td>
                      <td>{p.brand}</td>
                      <td><span className="cat-pill">{p.category}</span></td>
                      <td>{money(p.price)}</td>
                      <td>{p.compareAt ? money(p.compareAt) : "—"}</td>
                      <td>{p.showcase ? <span title={p.showcase}>{isYouTubeUrl(p.showcase) ? "▶ Video" : "🖼 Image"}</span> : "—"}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-table-action" onClick={() => setEditingProduct(p)} data-testid={`button-edit-product-${p.id}`} title="Edit"><Edit3 size={14} /></button>
                          <button className="btn-table-action danger" onClick={() => deleteProduct(p.id)} data-testid={`button-delete-product-${p.id}`} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="admin-panel">
            <div className="panel-header">
              <h2>User Management</h2>
              <button className="btn-primary" onClick={() => setModal("add-user")} data-testid="button-add-user"><UserPlus size={15} /> Add User</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table" data-testid="table-users">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {allDisplayUsers.map((u) => (
                    <tr key={u.id} data-testid={`row-admin-user-${u.id}`}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className={`role-pill ${u.admin ? "admin" : "user"}`}>{u.admin ? "Admin" : "User"}</span></td>
                      <td>{u.joined}</td>
                      <td>
                        <div className="action-btns">
                          {u.id !== "u-admin" && (
                            <>
                              <button className="btn-table-action" onClick={() => { setUsers(users.map((x) => x.id === u.id ? { ...x, admin: !x.admin } : x)); toast(u.admin ? "Admin revoked." : "Admin granted."); }} data-testid={`button-toggle-admin-${u.id}`} title={u.admin ? "Revoke admin" : "Make admin"}><ShieldCheck size={14} /></button>
                              <button className="btn-table-action danger" onClick={() => { if (window.confirm(`Delete "${u.name}"?`)) { setUsers(users.filter((x) => x.id !== u.id)); toast("User removed."); } }} data-testid={`button-delete-user-${u.id}`} title="Delete"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="admin-panel">
            <div className="panel-header"><h2>Store Settings</h2></div>
            <div className="settings-section">
              <h3>Hero Background Image</h3>
              <p className="settings-desc">Set a custom background image URL for the hero banner. Leave blank to use the default dark gradient.</p>
              <div className="field"><label htmlFor="hero-bg">Image URL</label><input id="hero-bg" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="https://example.com/banner.jpg" data-testid="input-hero-background" /></div>
              <div className="settings-actions">
                <button className="btn-primary" onClick={() => { setHeroBackground(bgUrl); toast("Hero background updated."); }}>Apply Background</button>
                {heroBackground && <button className="btn-ghost" onClick={() => { setHeroBackground(""); setBgUrl(""); toast("Background removed."); }}>Remove</button>}
              </div>
              {heroBackground && <div className="bg-preview"><img src={heroBackground} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ─── Product Editor Modal ───────────────────────────────────── */
function ProductEditor({ product, close, save }: {
  product: Product; close: () => void; save: (p: Product) => void;
}) {
  const [draft, setDraft] = useState<Product>({ ...product });
  const [tagsStr, setTagsStr] = useState(product.tags.join(", "));
  const [compareAtStr, setCompareAtStr] = useState(product.compareAt ? String(product.compareAt) : "");
  const [candidates, setCandidates] = useState<{ label: string; url: string }[]>([]);
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const fetchImages = () => {
    if (!draft.name.trim()) return;
    setLoadingImgs(true);
    const built = buildImageCandidates(draft.name, draft.category);
    setTimeout(() => { setCandidates(built); setLoadingImgs(false); }, 400);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.brand.trim() || draft.price <= 0) return;
    save({ ...draft, tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean), compareAt: compareAtStr ? Number(compareAtStr) : undefined });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <section className="modal modal-wide editor-modal" role="dialog" aria-modal="true" data-testid="modal-product-editor">
        <button className="modal-close" onClick={close} data-testid="button-close-editor"><X size={20} /></button>
        <div className="modal-header-block"><h2>{product.name ? "Edit Product" : "Add Product"}</h2></div>
        <div className="editor-layout">
          <form className="modal-form editor-form" onSubmit={onSubmit} id="product-form">
            <div className="field-row">
              <div className="field"><label htmlFor="pe-name">Product Name *</label><input id="pe-name" value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. ASTROX 100 ZZ" required data-testid="input-product-name" /></div>
              <div className="field"><label htmlFor="pe-brand">Brand *</label><input id="pe-brand" value={draft.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Yonex" required data-testid="input-product-brand" /></div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="pe-category">Category</label>
                <select id="pe-category" value={draft.category} onChange={(e) => set("category", e.target.value as Category)} data-testid="select-product-category">
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label htmlFor="pe-badge">Badge Label</label><input id="pe-badge" value={draft.badge ?? ""} onChange={(e) => set("badge", e.target.value || undefined)} placeholder="e.g. Best Seller, New" /></div>
            </div>
            <div className="field-row">
              <div className="field"><label htmlFor="pe-price">Price (₹) *</label><input id="pe-price" type="number" min="1" value={draft.price || ""} onChange={(e) => set("price", Number(e.target.value))} required data-testid="input-product-price" /></div>
              <div className="field"><label htmlFor="pe-compare">Compare-at Price (₹)</label><input id="pe-compare" type="number" min="1" value={compareAtStr} onChange={(e) => setCompareAtStr(e.target.value)} placeholder="Strikethrough price" /></div>
            </div>
            <div className="field"><label htmlFor="pe-desc">Description</label><textarea id="pe-desc" value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Short product description…" data-testid="input-product-description" /></div>
            <div className="field"><label htmlFor="pe-tags">Tags (comma separated)</label><input id="pe-tags" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="e.g. head heavy, 4U, stiff" data-testid="input-product-tags" /></div>
            <div className="field">
              <label htmlFor="pe-showcase"><Video size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Showcase URL (optional)</label>
              <input id="pe-showcase" value={draft.showcase ?? ""} onChange={(e) => set("showcase", e.target.value || undefined)} placeholder="YouTube URL or direct image URL" data-testid="input-product-showcase" />
              <span className="field-hint">Paste a YouTube link or an extra product image URL. Customers can switch between main photo and showcase.</span>
            </div>
            <div className="field-check">
              <input id="pe-featured" type="checkbox" checked={!!draft.featured} onChange={(e) => set("featured", e.target.checked)} />
              <label htmlFor="pe-featured">Mark as Featured (shown in New Arrivals)</label>
            </div>
          </form>

          <div className="image-picker-panel">
            <h3>Product Image</h3>
            <div className="current-img-wrap">
              <img src={draft.image} alt="Current" onError={(e) => { (e.target as HTMLImageElement).src = svgArt("racket", "#59635a"); }} />
            </div>
            <button type="button" className="btn-fetch-imgs" onClick={fetchImages} disabled={!draft.name.trim() || loadingImgs} data-testid="button-fetch-images">
              {loadingImgs ? <><Loader2 size={15} className="spin" /> Fetching…</> : <><RefreshCw size={15} /> Fetch Images</>}
            </button>
            <p className="img-hint">Enter the product name, then click Fetch Images to see options.</p>
            {candidates.length > 0 && (
              <div className="candidates-grid">
                {candidates.map((c, i) => (
                  <button type="button" key={i} className={`candidate-btn ${draft.image === c.url ? "selected" : ""}`} onClick={() => set("image", c.url)} data-testid={`button-image-candidate-${i}`}>
                    <img src={c.url} alt={c.label} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = svgArt("racket", "#59635a"); }} />
                    {draft.image === c.url && <span className="candidate-check"><Check size={14} /></span>}
                  </button>
                ))}
              </div>
            )}
            <div className="field" style={{ marginTop: 12 }}>
              <label htmlFor="pe-custom-url">Or paste image URL directly</label>
              <div className="custom-url-row">
                <input id="pe-custom-url" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://…" data-testid="input-product-image-url" />
                <button type="button" className="btn-ghost-sm" onClick={() => { if (customUrl) { set("image", customUrl); setCustomUrl(""); } }}>Use</button>
              </div>
            </div>
          </div>
        </div>
        <div className="editor-footer">
          <button type="button" className="btn-ghost" onClick={close}>Cancel</button>
          <button type="submit" form="product-form" className="btn-primary" data-testid="button-save-product">Save Product</button>
        </div>
      </section>
    </div>
  );
}

/* ─── Site Footer ────────────────────────────────────────────── */
function SiteFooter({ setView, setCategory }: { setView: (v: View) => void; setCategory: (c: "All" | Category) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark sm">B</span>
          <div><strong>Badminton Bazaar</strong><span>The focused gear counter for India's courts.</span></div>
        </div>
        <div className="footer-links">
          <div>
            <strong>Shop</strong>
            {["Rackets", "Shoes", "Shuttlecocks", "Strings", "Grips"].map((c) => (
              <button key={c} onClick={() => { setView("store"); setCategory(c as Category); }}>{c}</button>
            ))}
          </div>
          <div>
            <strong>More</strong>
            {["Kit Bags", "Apparel", "Socks", "Accessories"].map((c) => (
              <button key={c} onClick={() => { setView("store"); setCategory(c as Category); }}>{c}</button>
            ))}
          </div>
          <div>
            <strong>Account</strong>
            <button onClick={() => setView("account")}>My Account</button>
            <button onClick={() => setView("account")}>Order History</button>
          </div>
          <div>
            <strong>Info</strong>
            <span>INR Pricing · Genuine brands only</span>
            <span>Free delivery above ₹2,500</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Badminton Bazaar · All rights reserved</span>
        <span>Prices in INR · Gear curated for Indian courts</span>
      </div>
    </footer>
  );
}

export default App;
