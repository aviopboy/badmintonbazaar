import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Edit3,
  Heart,
  ImagePlus,
  LayoutDashboard,
  Minus,
  Package,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import "./index.css";

type Category = "Rackets" | "Shoes";
type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  compareAt?: number;
  description: string;
  image: string;
  tags: string[];
  featured?: boolean;
};
type CartLine = { productId: string; quantity: number };
type User = { id: string; name: string; email: string; password: string; admin: boolean; joined: string };
type Toast = { id: number; message: string; error?: boolean };
type View = "store" | "account" | "admin";
type Modal = "auth" | "product" | "cart" | "editor" | "checkout" | null;

const svgArt = (kind: "racket" | "shoe", color: string, accent = "#b9e532", angle = 0) => {
  const body = kind === "racket"
    ? `<g transform="rotate(${angle} 220 220)"><ellipse cx="220" cy="111" rx="82" ry="104" fill="${color}" stroke="#242720" stroke-width="7"/><ellipse cx="220" cy="111" rx="64" ry="83" fill="none" stroke="${accent}" stroke-width="3"/><path d="M173 37L267 185M267 37L173 185M149 111h142M220 9v204" stroke="#242720" stroke-width="2" opacity=".55"/><path d="M206 202h28l18 184-30 10-30-10z" fill="${accent}" stroke="#242720" stroke-width="7"/><path d="M190 374l45 14-10 35-48-15z" fill="#242720"/></g>`
    : `<g transform="rotate(${angle} 220 240)"><path d="M100 302c38-52 67-104 74-175l8-79c31-18 81-15 109 9l-7 83c-4 47 28 73 72 106 15 12 16 31-2 42-51 31-148 29-230 26-25-1-37-1-24-12z" fill="${color}" stroke="#242720" stroke-width="7"/><path d="M185 81c29 25 61 35 99 31M177 125c32 26 67 35 104 32M168 168c27 23 61 32 103 30" stroke="${accent}" stroke-width="10" fill="none"/><path d="M96 302c73 15 137 8 230-14 33 11 44 27 27 43-57 50-192 30-272 18-21-4-9-28 15-47z" fill="#242720"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 440"><rect width="440" height="440" fill="#ebe7dd"/><circle cx="366" cy="72" r="54" fill="${accent}" opacity=".22"/><circle cx="67" cy="361" r="92" fill="#d8d2c5" opacity=".7"/><path d="M25 405h390" stroke="#c8c2b6" stroke-width="2"/>${body}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const imageCandidates: Record<string, { label: string; image: string }[]> = {
  "astrox 100 zz": [
    { label: "Black / lime hero", image: svgArt("racket", "#242720", "#b9e532", -9) },
    { label: "Night edition", image: svgArt("racket", "#343b4b", "#f3a13b", 7) },
  ],
  "nanoflare 1000 z": [
    { label: "Electric coral", image: svgArt("racket", "#d46e50", "#242720", -11) },
    { label: "Court blue", image: svgArt("racket", "#536e92", "#b9e532", 5) },
  ],
  "axforce canon": [{ label: "Carbon red", image: svgArt("racket", "#963e3b", "#f1d5ae", -7) }],
  "axforce 100": [{ label: "Graphite gold", image: svgArt("racket", "#454b49", "#d9a441", -12) }],
  "yonex power cushion 65 z3": [
    { label: "White / lime court", image: svgArt("shoe", "#f3f0e6", "#b9e532", -4) },
    { label: "Deep black court", image: svgArt("shoe", "#2d312c", "#d7e8c1", 4) },
  ],
  "yonex aerus z2": [{ label: "Aerus blue", image: svgArt("shoe", "#6189a0", "#f1d5ae", -3) }],
  "li-ning ranger lite": [{ label: "Ranger orange", image: svgArt("shoe", "#b65a39", "#d7e8c1", 5) }],
  "victor a970": [{ label: "A970 white", image: svgArt("shoe", "#e4e1d7", "#c25e47", -4) }],
};

const initialProducts: Product[] = [
  { id: "p-astrox-100-zz", name: "ASTROX 100 ZZ", brand: "Yonex", category: "Rackets", price: 16990, compareAt: 18990, description: "A head-heavy attack specialist for players who want a hard first hit and no hesitation at the back court.", image: imageCandidates["astrox 100 zz"][0].image, tags: ["head heavy", "4U", "stiff"], featured: true },
  { id: "p-nanoflare-1000-z", name: "NANOFLARE 1000 Z", brand: "Yonex", category: "Rackets", price: 15490, compareAt: 17490, description: "Fast through the air with a sharp, lively response. Built for counter-punchers who take the shuttle early.", image: imageCandidates["nanoflare 1000 z"][0].image, tags: ["even balance", "4U", "speed"], featured: true },
  { id: "p-axforce-canon", name: "AXFORCE CANON", brand: "Li-Ning", category: "Rackets", price: 12490, compareAt: 13990, description: "Explosive swing speed with a reassuringly solid frame. A doubles weapon with serious bite.", image: imageCandidates["axforce canon"][0].image, tags: ["head heavy", "4U", "power"] },
  { id: "p-axforce-100", name: "AXFORCE 100", brand: "Li-Ning", category: "Rackets", price: 10990, description: "A direct, stable competition racket that keeps your options open from serve to smash.", image: imageCandidates["axforce 100"][0].image, tags: ["balanced", "3U", "control"] },
  { id: "p-yonex-65z3", name: "POWER CUSHION 65 Z3", brand: "Yonex", category: "Shoes", price: 9990, compareAt: 11490, description: "Low-to-the-court confidence, locked-in lateral support and the cushion to stay sharp late in a three-game battle.", image: imageCandidates["yonex power cushion 65 z3"][0].image, tags: ["stability", "all court"], featured: true },
  { id: "p-aerus-z2", name: "AERUS Z2", brand: "Yonex", category: "Shoes", price: 8490, description: "Feather-light footwork for players who live on the front foot. Airy, quick and ready for long sessions.", image: imageCandidates["yonex aerus z2"][0].image, tags: ["lightweight", "speed"] },
  { id: "p-ranger-lite", name: "RANGER LITE", brand: "Li-Ning", category: "Shoes", price: 4990, compareAt: 5990, description: "Court-ready grip and a forgiving fit at an honest price. The easy choice for regular club nights.", image: imageCandidates["li-ning ranger lite"][0].image, tags: ["value", "all court"] },
  { id: "p-victor-a970", name: "A970", brand: "Victor", category: "Shoes", price: 7290, description: "A snug, stable performance shoe with the confidence to let you chase every loose return.", image: imageCandidates["victor a970"][0].image, tags: ["stability", "grip"] },
];
const seedUsers: User[] = [{ id: "u-admin", name: "Bazaar Admin", email: "avilit9@gmail.com", password: "admin", admin: true, joined: "Demo account" }];

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const storage = {
  get<T>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
  },
  set(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); },
};

function App() {
  const [products, setProducts] = useState<Product[]>(() => storage.get("bb-products", initialProducts));
  const [users, setUsers] = useState<User[]>(() => storage.get("bb-users", seedUsers));
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
  const [background, setBackground] = useState(() => storage.get("bb-background", "paper"));
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");

  useEffect(() => storage.set("bb-products", products), [products]);
  useEffect(() => storage.set("bb-users", users), [users]);
  useEffect(() => storage.set("bb-current-user", currentUser), [currentUser]);
  useEffect(() => storage.set("bb-cart", cart), [cart]);
  useEffect(() => storage.set("bb-wishlist", wishlist), [wishlist]);
  useEffect(() => storage.set("bb-background", background), [background]);

  const toast = (message: string, error = false) => {
    const id = Date.now();
    setToasts((items) => [...items, { id, message, error }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3300);
  };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (products.find((p) => p.id === item.productId)?.price ?? 0) * item.quantity, 0);
  const filteredProducts = useMemo(() => products
    .filter((product) => category === "All" || product.category === category)
    .filter((product) => `${product.name} ${product.brand} ${product.category} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : Number(Boolean(b.featured)) - Number(Boolean(a.featured))), [products, category, query, sort]);

  const openProduct = (product: Product) => { setSelectedProduct(product); setModal("product"); };
  const addToCart = (id: string, quantity = 1) => {
    setCart((lines) => {
      const existing = lines.find((line) => line.productId === id);
      return existing ? lines.map((line) => line.productId === id ? { ...line, quantity: line.quantity + quantity } : line) : [...lines, { productId: id, quantity }];
    });
    toast("Added to your bag.");
  };
  const updateQuantity = (id: string, amount: number) => setCart((lines) => lines.map((line) => line.productId === id ? { ...line, quantity: Math.max(0, line.quantity + amount) } : line).filter((line) => line.quantity > 0));
  const toggleWishlist = (id: string) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const requireAuth = () => { if (!currentUser) { setAuthMode("login"); setAuthError("Sign in to complete your demo checkout."); setModal("auth"); return false; } return true; };
  const signOut = () => { setCurrentUser(null); setView("store"); toast("Signed out of this demo device."); };

  const onAuth = (email: string, password: string, name: string) => {
    if (authMode === "login") {
      const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
      if (!user) { setAuthError("Those demo credentials do not match. Try avilit9@gmail.com / admin."); return; }
      setCurrentUser(user); setModal(null); setAuthError(""); toast(`Welcome back, ${user.name.split(" ")[0]}.`);
    } else {
      if (!name.trim() || !email.includes("@") || password.length < 4) { setAuthError("Add your name, a valid email and a 4+ character password."); return; }
      if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) { setAuthError("That email is already registered on this demo device."); return; }
      const user: User = { id: `u-${Date.now()}`, name: name.trim(), email: email.trim(), password, admin: false, joined: new Date().toLocaleDateString("en-IN") };
      setUsers((items) => [...items, user]); setCurrentUser(user); setModal(null); setAuthError(""); toast("Account created. Your bag is waiting.");
    }
  };

  return (
    <div className={`app-shell bg-${background}`} style={background.startsWith("url:") ? { backgroundImage: `url(${background.slice(4)})`, backgroundSize: "cover", backgroundAttachment: "fixed" } : undefined}>
      <TopNav currentUser={currentUser} cartCount={cartCount} query={query} setQuery={setQuery} setModal={setModal} setView={setView} view={view} signOut={signOut} />
      {view === "store" && <Storefront products={filteredProducts} category={category} setCategory={setCategory} sort={sort} setSort={setSort} query={query} openProduct={openProduct} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
      {view === "account" && currentUser && <Account user={currentUser} setUser={(user) => { setCurrentUser(user); setUsers((items) => items.map((item) => item.id === user.id ? user : item)); }} signOut={signOut} toast={toast} />}
      {view === "admin" && currentUser?.admin && <Admin products={products} setProducts={setProducts} users={users} setUsers={setUsers} background={background} setBackground={setBackground} toast={toast} />}
      {view === "admin" && !currentUser?.admin && <AccessDenied onBack={() => setView("store")} />}
      <SiteFooter />
      {modal === "product" && selectedProduct && <ProductModal product={selectedProduct} close={() => setModal(null)} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
      {modal === "cart" && <CartDrawer cart={cart} products={products} close={() => setModal(null)} updateQuantity={updateQuantity} openProduct={openProduct} total={cartTotal} requireAuth={requireAuth} setModal={setModal} toast={toast} />}
      {modal === "auth" && <AuthModal mode={authMode} setMode={(mode) => { setAuthMode(mode); setAuthError(""); }} close={() => setModal(null)} submit={onAuth} error={authError} />}
      {modal === "checkout" && <CheckoutModal close={() => setModal(null)} total={cartTotal} clearCart={() => setCart([])} toast={toast} />}
      {toasts.length > 0 && <div className="toast-stack" aria-live="polite">{toasts.map((item) => <div className={`toast ${item.error ? "error" : ""}`} key={item.id} data-testid={`toast-${item.id}`}>{item.message}</div>)}</div>}
    </div>
  );
}

function TopNav({ currentUser, cartCount, query, setQuery, setModal, setView, view, signOut }: { currentUser: User | null; cartCount: number; query: string; setQuery: (v: string) => void; setModal: (v: Modal) => void; setView: (v: View) => void; view: View; signOut: () => void }) {
  return <header>
    <div className="top-strip">Free delivery across India on orders over ₹2,500 · Demo storefront, local data only</div>
    <nav className="nav-shell">
      <div className="nav-row">
        <button className="brand" onClick={() => setView("store")} data-testid="button-home">
          <span className="brand-mark">B</span><span className="brand-copy"><span className="brand-name">Badminton Bazaar</span><span className="brand-sub">Play it sharp</span></span>
        </button>
        <div className="nav-search"><Search size={17} /><input value={query} onChange={(e) => { setQuery(e.target.value); setView("store"); }} placeholder="Search rackets, shoes, brands..." data-testid="input-search-products" /></div>
        <div className="nav-actions">
          {currentUser?.admin && <button className={`nav-link-button ${view === "admin" ? "selected" : ""}`} onClick={() => setView("admin")} title="Admin dashboard" data-testid="button-open-admin"><LayoutDashboard size={18} /><span className="nav-label">Admin</span></button>}
          <button className="nav-link-button" onClick={() => currentUser ? setView("account") : setModal("auth")} title={currentUser ? "Account settings" : "Sign in"} data-testid="button-open-account"><CircleUserRound size={19} /><span className="nav-label">{currentUser ? "Account" : "Sign in"}</span></button>
          {currentUser && <button className="nav-link-button" onClick={signOut} title="Sign out" data-testid="button-sign-out"><ArrowRight size={18} /><span className="nav-label">Sign out</span></button>}
          <button className="icon-button" onClick={() => setModal("cart")} title="Open bag" data-testid="button-open-cart"><ShoppingBag size={20} /><span className="cart-count">{cartCount}</span></button>
        </div>
      </div>
    </nav>
  </header>;
}

function Storefront({ products, category, setCategory, sort, setSort, query, openProduct, addToCart, wishlist, toggleWishlist }: { products: Product[]; category: "All" | Category; setCategory: (v: "All" | Category) => void; sort: string; setSort: (v: string) => void; query: string; openProduct: (p: Product) => void; addToCart: (id: string) => void; wishlist: string[]; toggleWishlist: (id: string) => void }) {
  return <main className="page-main">
    <section className="hero">
      <div className="hero-content"><div className="eyebrow">The competition counter</div><h1>Gear up.<br /><em>Go hard.</em></h1><p className="hero-copy">Competition-ready rackets and shoes, selected for Indian courts. No marketplace maze. Just the gear that earns its place in your kit bag.</p></div>
      <div className="hero-art"><img className="hero-racket" src={svgArt("racket", "#59635a", "#b9e532", -13)} alt="Stylised badminton racket" /><span className="hero-sticker">Built for the<br />next rally</span></div>
    </section>
    <section className="section-kicker"><div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Curated equipment</div><h2 className="section-title">Find your edge</h2></div><span className="section-note" data-testid="text-product-count">{products.length} {products.length === 1 ? "piece" : "pieces"} in the counter</span></section>
    <section className="filter-bar">
      <div className="filter-pills">{(["All", "Rackets", "Shoes"] as const).map((item) => <button key={item} className={`filter-pill ${category === item ? "active" : ""}`} onClick={() => setCategory(item)} data-testid={`button-filter-${item.toLowerCase()}`}>{item}</button>)}</div>
      <select className="select-control sort-control" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" data-testid="select-sort-products"><option value="featured">Sort: Featured</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option><option value="name">Name: A to Z</option></select>
    </section>
    <div className="product-grid">
      {products.length === 0 ? <div className="empty-state"><Search size={32} /><strong>No gear found</strong><span>Try a different search or clear the filter. The counter is small by design.</span></div> : products.map((product) => <ProductCard key={product.id} product={product} openProduct={openProduct} addToCart={addToCart} isWishlisted={wishlist.includes(product.id)} toggleWishlist={toggleWishlist} />)}
    </div>
    {!query && <div className="trust-row">
      <div className="trust-item"><BadgeCheck size={21} /><div><strong>Genuine gear</strong><span>Only trusted brands and competition lines.</span></div></div>
      <div className="trust-item"><Truck size={21} /><div><strong>Quick dispatch</strong><span>We get your kit moving from our counter.</span></div></div>
      <div className="trust-item"><ShieldCheck size={21} /><div><strong>Play-tested picks</strong><span>Less noise. Better choices for your game.</span></div></div>
      <div className="trust-item"><Sparkles size={21} /><div><strong>Local demo</strong><span>Your bag and account stay on this device.</span></div></div>
    </div>}
  </main>;
}

function ProductCard({ product, openProduct, addToCart, isWishlisted, toggleWishlist }: { product: Product; openProduct: (p: Product) => void; addToCart: (id: string) => void; isWishlisted: boolean; toggleWishlist: (id: string) => void }) {
  return <article className="product-card" data-testid={`card-product-${product.id}`}>
    <div className="product-image-wrap"><button className={`wishlist-button ${isWishlisted ? "active" : ""}`} onClick={() => toggleWishlist(product.id)} title="Toggle wishlist" data-testid={`button-wishlist-${product.id}`}><Heart size={17} fill={isWishlisted ? "currentColor" : "none"} /></button><button className="product-image-button" style={{ border: 0, padding: 0, width: "100%", height: "100%", background: "transparent" }} onClick={() => openProduct(product)} data-testid={`button-view-product-${product.id}`}><img className="product-image" src={product.image} alt={product.name} /></button></div>
    <div className="product-info"><div className="product-category">{product.category} · {product.brand}</div><h3 className="product-name">{product.name}</h3><div className="product-meta"><span className="price" data-testid={`text-price-${product.id}`}>{money(product.price)} {product.compareAt && <span className="price-old">{money(product.compareAt)}</span>}</span></div><button className="buy-button" onClick={() => addToCart(product.id)} data-testid={`button-add-cart-${product.id}`}>Add to bag <Plus size={14} style={{ verticalAlign: "middle" }} /></button></div>
  </article>;
}

function ProductModal({ product, close, addToCart, wishlist, toggleWishlist }: { product: Product; close: () => void; addToCart: (id: string, quantity?: number) => void; wishlist: string[]; toggleWishlist: (id: string) => void }) {
  const [quantity, setQuantity] = useState(1);
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><section className="modal wide" role="dialog" aria-modal="true" aria-label={`${product.name} detail`} data-testid="modal-product-detail">
    <div className="modal-header"><span className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>The details</span><button className="close-button" onClick={close} data-testid="button-close-product"><X size={20} /></button></div>
    <div className="modal-body product-modal-layout"><img className="detail-image" src={product.image} alt={product.name} /><div className="detail-copy"><div className="product-category">{product.category} · {product.brand}</div><h3>{product.name}</h3><p>{product.description}</p><div className="detail-price">{money(product.price)} {product.compareAt && <span className="price-old">{money(product.compareAt)}</span>}</div><div className="action-row"><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} data-testid="button-detail-decrease"><Minus size={15} /></button><span data-testid="text-detail-quantity">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} data-testid="button-detail-increase"><Plus size={15} /></button></div><button className="primary-action" onClick={() => { addToCart(product.id, quantity); close(); }} data-testid="button-detail-add">Add {quantity > 1 ? `${quantity} to bag` : "to bag"}</button><button className="secondary-action" onClick={() => toggleWishlist(product.id)} data-testid="button-detail-wishlist"><Heart size={15} fill={wishlist.includes(product.id) ? "currentColor" : "none"} /></button></div><div className="notice" style={{ marginTop: 20 }}><Truck size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> Dispatches in 1–2 working days. Demo checkout, no payment collected.</div></div></div>
  </section></div>;
}

function CartDrawer({ cart, products, close, updateQuantity, openProduct, total, requireAuth, setModal, toast }: { cart: CartLine[]; products: Product[]; close: () => void; updateQuantity: (id: string, n: number) => void; openProduct: (p: Product) => void; total: number; requireAuth: () => boolean; setModal: (v: Modal) => void; toast: (message: string, error?: boolean) => void }) {
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><aside className="drawer" aria-label="Shopping bag" data-testid="drawer-cart"><div className="modal-header"><div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Your kit bag</div><h2>Cart <span style={{ color: "rgb(var(--muted))", fontSize: 18 }}>({cart.reduce((s, i) => s + i.quantity, 0)})</span></h2></div><button className="close-button" onClick={close} data-testid="button-close-cart"><X size={20} /></button></div><div className="drawer-body">{cart.length === 0 ? <div className="empty-state" style={{ marginTop: 30 }}><ShoppingBag size={30} /><strong>Bag is light</strong><span>Add a racket or shoe and your next session starts here.</span><button className="dark-action" style={{ marginTop: 18 }} onClick={close} data-testid="button-continue-shopping">Keep shopping</button></div> : cart.map((line) => { const product = products.find((p) => p.id === line.productId); if (!product) return null; return <div className="cart-line" key={line.productId} data-testid={`row-cart-${line.productId}`}><button onClick={() => { close(); openProduct(product); }} style={{ border: 0, padding: 0, background: "transparent" }} data-testid={`button-cart-image-${line.productId}`}><img src={product.image} alt={product.name} /></button><div><h4>{product.name}</h4><p>{product.brand} · {money(product.price)}</p><div className="quantity-control"><button onClick={() => updateQuantity(product.id, -1)} data-testid={`button-cart-decrease-${product.id}`}><Minus size={13} /></button><span>{line.quantity}</span><button onClick={() => updateQuantity(product.id, 1)} data-testid={`button-cart-increase-${product.id}`}><Plus size={13} /></button></div></div><div className="cart-line-price">{money(product.price * line.quantity)}<button onClick={() => { updateQuantity(product.id, -line.quantity); toast("Removed from your bag."); }} className="close-button" title="Remove item" data-testid={`button-remove-cart-${product.id}`}><Trash2 size={14} /></button></div></div>; })}</div>{cart.length > 0 && <div className="drawer-footer"><div className="total-line"><span>Total</span><span data-testid="text-cart-total">{money(total)}</span></div><button className="primary-action full-button" onClick={() => { if (requireAuth()) { close(); setModal("checkout"); } }} data-testid="button-checkout"><CreditCard size={15} style={{ verticalAlign: "middle", marginRight: 6 }} /> Continue to demo checkout</button><div className="demo-note">No payment is processed. Checkout confirms a pretend order on this browser only.</div></div>}</aside></div>;
}

function AuthModal({ mode, setMode, close, submit, error }: { mode: "login" | "register"; setMode: (mode: "login" | "register") => void; close: () => void; submit: (email: string, password: string, name: string) => void; error: string }) {
  const [email, setEmail] = useState(mode === "login" ? "" : "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><section className="modal" role="dialog" aria-modal="true" data-testid="modal-auth"><div className="modal-header"><div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Your Bazaar account</div><h2>{mode === "login" ? "Welcome back" : "Join the counter"}</h2></div><button className="close-button" onClick={close} data-testid="button-close-auth"><X size={20} /></button></div><div className="modal-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} data-testid="button-auth-login-tab">Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} data-testid="button-auth-register-tab">Register</button></div><form className="modal-body" onSubmit={(e) => { e.preventDefault(); submit(email, password, name); }}>{mode === "register" && <div className="field"><label htmlFor="auth-name">Name</label><input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" data-testid="input-auth-name" /></div>}<div className="field"><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required data-testid="input-auth-email" /></div><div className="field"><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 4 characters" required data-testid="input-auth-password" /></div>{error && <div className="notice error" data-testid="status-auth-error">{error}</div>}<button className="dark-action full-button" type="submit" data-testid="button-submit-auth">{mode === "login" ? "Sign in to Bazaar" : "Create local account"}</button><div className="demo-note"><strong>Demo admin:</strong> use <b>avilit9@gmail.com</b> with password <b>admin</b>. This local credential is intentionally not production-secure.</div></form></section></div>;
}

function CheckoutModal({ close, total, clearCart, toast }: { close: () => void; total: number; clearCart: () => void; toast: (message: string) => void }) {
  const [done, setDone] = useState(false);
  if (done) return <div className="modal-backdrop"><section className="modal" role="dialog" data-testid="modal-checkout-success"><div className="modal-body" style={{ textAlign: "center", padding: 45 }}><div className="avatar" style={{ margin: "0 auto 16px", background: "rgb(var(--lime))", color: "rgb(var(--ink))" }}><Check /></div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Order staged</div><h2 className="section-title" style={{ margin: "12px 0" }}>Ready to rally</h2><p style={{ color: "rgb(var(--muted))", fontSize: 13, lineHeight: 1.6 }}>Your demo order for {money(total)} has been noted locally. No money moved, no courier called.</p><button className="dark-action" onClick={close} data-testid="button-close-success">Back to the counter</button></div></section></div>;
  return <div className="modal-backdrop"><section className="modal" role="dialog" data-testid="modal-checkout"><div className="modal-header"><div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Demo checkout</div><h2>Confirm your kit</h2></div><button className="close-button" onClick={close} data-testid="button-close-checkout"><X size={20} /></button></div><div className="modal-body"><div className="notice">This is a self-contained browser demo. Add a pretend delivery address below and we will stage the order without collecting payment.</div><div className="field"><label htmlFor="checkout-address">Delivery address</label><textarea id="checkout-address" placeholder="Flat, street, city, PIN" data-testid="input-checkout-address" /></div><div className="field"><label htmlFor="checkout-phone">Phone</label><input id="checkout-phone" placeholder="+91 98..." data-testid="input-checkout-phone" /></div><div className="total-line"><span>Order total</span><span>{money(total)}</span></div><button className="primary-action full-button" onClick={() => { setDone(true); clearCart(); toast("Demo order staged successfully."); }} data-testid="button-place-order">Place demo order</button></div></section></div>;
}

function Account({ user, setUser, signOut, toast }: { user: User; setUser: (user: User) => void; signOut: () => void; toast: (message: string, error?: boolean) => void }) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <main className="page-main"><div className="account-layout"><div className="dashboard-head"><div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Local profile</div><h1>Account settings</h1><p>Your account lives on this browser. Change details any time.</p></div><button className="secondary-action" onClick={signOut} data-testid="button-account-signout">Sign out</button></div><section className="account-card"><div className="account-identity"><div className="avatar">{initials}</div><div><strong data-testid="text-account-name">{user.name}</strong><span data-testid="text-account-email">{user.email}</span></div></div><h2>Change email</h2><form onSubmit={(e) => { e.preventDefault(); if (!email.includes("@")) { toast("Enter a valid email.", true); return; } setUser({ ...user, email }); toast("Email updated on this device."); }}><div className="field"><label htmlFor="account-email">New email</label><input id="account-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-account-email" /></div><button className="dark-action" type="submit" data-testid="button-save-email">Save email</button></form></section><section className="account-card"><h2>Change password</h2><form onSubmit={(e) => { e.preventDefault(); if (password.length < 4) { toast("Password needs at least 4 characters.", true); return; } setUser({ ...user, password }); setPassword(""); toast("Password updated on this device."); }}><div className="field"><label htmlFor="account-password">New password</label><input id="account-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 4 characters" data-testid="input-account-password" /></div><button className="dark-action" type="submit" data-testid="button-save-password">Save password</button></form></section></div></main>;
}

function Admin({ products, setProducts, users, setUsers, background, setBackground, toast }: { products: Product[]; setProducts: (v: Product[]) => void; users: User[]; setUsers: (v: User[]) => void; background: string; setBackground: (v: string) => void; toast: (message: string, error?: boolean) => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageSearch, setImageSearch] = useState("");
  const [candidateChoice, setCandidateChoice] = useState("");
  const candidates = useMemo(() => Object.entries(imageCandidates).flatMap(([key, values]) => values.map((item) => ({ ...item, key }))).filter((item) => `${item.key} ${item.label}`.includes(imageSearch.toLowerCase())), [imageSearch]);
  const saveProduct = (product: Product) => { setProducts(products.some((item) => item.id === product.id) ? products.map((item) => item.id === product.id ? product : item) : [...products, product]); setEditing(null); toast(products.some((item) => item.id === product.id) ? "Product updated." : "Product added to the counter."); };
  const deleteProduct = (id: string) => { if (window.confirm("Delete this product from the local catalog?")) { setProducts(products.filter((p) => p.id !== id)); toast("Product removed."); } };
  return <main className="page-main"><div className="dashboard"><div className="dashboard-head"><div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Control room · demo only</div><h1>Run the counter</h1><p>Products, people and the look of your local Bazaar.</p></div><button className="primary-action" onClick={() => setEditing({ id: `p-${Date.now()}`, name: "", brand: "", category: "Rackets", price: 0, description: "", image: svgArt("racket", "#59635a"), tags: [] })} data-testid="button-add-product"><Plus size={15} style={{ verticalAlign: "middle" }} /> Add product</button></div>
    <div className="stat-grid"><div className="stat"><span>Products</span><strong data-testid="stat-product-count">{products.length}</strong></div><div className="stat"><span>Local users</span><strong data-testid="stat-user-count">{users.length}</strong></div><div className="stat"><span>Admins</span><strong data-testid="stat-admin-count">{users.filter((u) => u.admin).length}</strong></div></div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-head"><h2>Product roster</h2><span className="section-note">Edit prices or remove a line</span></div><div className="panel-content table-scroll"><table className="data-table"><thead><tr><th>Product</th><th>Price</th><th>Category</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id} data-testid={`row-admin-product-${product.id}`}><td><div className="table-product"><img src={product.image} alt="" /><div><strong>{product.name}</strong><span>{product.brand}</span></div></div></td><td>{money(product.price)}</td><td>{product.category}</td><td><button className="small-button" onClick={() => setEditing(product)} data-testid={`button-edit-product-${product.id}`}><Edit3 size={13} /></button><button className="small-button danger" onClick={() => deleteProduct(product.id)} data-testid={`button-delete-product-${product.id}`}><Trash2 size={13} /></button></td></tr>)}</tbody></table></div></section>
      <div><section className="panel"><div className="panel-head"><h2>People</h2><Users size={18} /></div><div className="panel-content table-scroll"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Access</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} data-testid={`row-admin-user-${user.id}`}><td><strong>{user.name}</strong><br /><span style={{ color: "rgb(var(--muted))", fontSize: 10 }}>{user.email}</span></td><td><span className={`role-pill ${user.admin ? "" : "user"}`}>{user.admin ? "Admin" : "Player"}</span></td><td>{user.id !== "u-admin" && <button className="small-button" onClick={() => { setUsers(users.map((item) => item.id === user.id ? { ...item, admin: !item.admin } : item)); toast(user.admin ? "Admin access revoked." : "Admin access granted."); }} data-testid={`button-toggle-admin-${user.id}`}>{user.admin ? "Revoke" : "Grant"}</button>}</td></tr>)}</tbody></table></div></section>
      <section className="panel dashboard-section"><div className="panel-head"><h2>Backdrop</h2><SlidersHorizontal size={17} /></div><div className="panel-content"><div className="preset-list">{[{ id: "paper", name: "Warm paper", desc: "Original Bazaar surface", swatch: "linear-gradient(135deg,#f6f3eb,#dcd6c9)" }, { id: "court", name: "Court lines", desc: "A little more movement", swatch: "repeating-linear-gradient(135deg,#dce6c4 0 8px,#eef0db 8px 16px)" }, { id: "coal", name: "Charcoal wash", desc: "For late-night drops", swatch: "linear-gradient(135deg,#30362d,#68705b)" }].map((preset) => <button className={`preset ${background === preset.id ? "active" : ""}`} key={preset.id} onClick={() => setBackground(preset.id)} data-testid={`button-background-${preset.id}`}><span className="preset-swatch" style={{ background: preset.swatch }} /><span><strong>{preset.name}</strong><span>{preset.desc}</span></span>{background === preset.id && <Check size={15} style={{ marginLeft: "auto" }} />}</button>)}</div><div className="field" style={{ marginTop: 14, marginBottom: 0 }}><label htmlFor="custom-background">Custom image URL</label><input id="custom-background" placeholder="https://..." onBlur={(e) => { if (e.target.value) setBackground(`url:${e.target.value}`); }} data-testid="input-custom-background" /></div><p className="demo-note">Preset treatments are local. A custom URL is displayed as a CSS background on this device.</p></div></section></div></div>
    </div>
    <section className="panel dashboard-section"><div className="panel-head"><div><h2>Image picker</h2><span className="section-note">Search the curated local candidate map</span></div><ImagePlus size={19} /></div><div className="panel-content"><div className="field" style={{ marginBottom: 0 }}><label htmlFor="image-search">Product image search</label><input id="image-search" value={imageSearch} onChange={(e) => setImageSearch(e.target.value)} placeholder="Try astrox, aerus, racket, shoe..." data-testid="input-admin-image-search" /></div><div className="image-picker"><div className="candidate-grid">{candidates.length === 0 ? <div className="empty-state" style={{ padding: 28 }}><Search size={22} /><strong>No candidates</strong><span>Try a brand, model or category from the local map.</span></div> : candidates.map((candidate) => <button className={`candidate ${candidateChoice === candidate.image ? "selected" : ""}`} key={`${candidate.key}-${candidate.label}`} onClick={() => { setCandidateChoice(candidate.image); toast(`Selected ${candidate.label}. Use it while editing a product.`); }} data-testid={`button-image-candidate-${candidate.key}`}><img src={candidate.image} alt={candidate.label} /><span>{candidate.key} · {candidate.label}</span></button>)}</div></div></div></section>
    {editing && <ProductEditor product={editing} selectedImage={candidateChoice} close={() => setEditing(null)} save={saveProduct} />}
  </main>;
}

function ProductEditor({ product, selectedImage, close, save }: { product: Product; selectedImage: string; close: () => void; save: (p: Product) => void }) {
  const [draft, setDraft] = useState(product);
  const set = (key: keyof Product, value: string | number) => setDraft({ ...draft, [key]: value });
  return <div className="modal-backdrop"><section className="modal" role="dialog" data-testid="modal-product-editor"><div className="modal-header"><div><div className="eyebrow" style={{ color: "rgb(var(--lime-deep))" }}>Catalog editor</div><h2>{product.name ? "Edit product" : "New product"}</h2></div><button className="close-button" onClick={close} data-testid="button-close-editor"><X size={20} /></button></div><form className="modal-body" onSubmit={(e) => { e.preventDefault(); if (!draft.name || !draft.brand || draft.price <= 0) return; save({ ...draft, image: selectedImage || draft.image, tags: typeof draft.tags === "string" ? (draft.tags as unknown as string).split(",").map((tag) => tag.trim()).filter(Boolean) : draft.tags }); }}><div className="field-inline"><div className="field"><label htmlFor="product-name">Name</label><input id="product-name" value={draft.name} onChange={(e) => set("name", e.target.value)} required data-testid="input-product-name" /></div><div className="field"><label htmlFor="product-brand">Brand</label><input id="product-brand" value={draft.brand} onChange={(e) => set("brand", e.target.value)} required data-testid="input-product-brand" /></div></div><div className="field-inline"><div className="field"><label htmlFor="product-category">Category</label><select id="product-category" value={draft.category} onChange={(e) => set("category", e.target.value)} data-testid="select-product-category"><option>Rackets</option><option>Shoes</option></select></div><div className="field"><label htmlFor="product-price">Price INR</label><input id="product-price" type="number" min="1" value={draft.price} onChange={(e) => set("price", Number(e.target.value))} required data-testid="input-product-price" /></div></div><div className="field"><label htmlFor="product-description">Description</label><textarea id="product-description" value={draft.description} onChange={(e) => set("description", e.target.value)} data-testid="input-product-description" /></div><div className="field"><label htmlFor="product-tags">Tags · comma separated</label><input id="product-tags" value={draft.tags.join(", ")} onChange={(e) => set("tags", e.target.value)} data-testid="input-product-tags" /></div><div className="notice">Tip: search the image picker first, then click a candidate to make it the product cover.</div><button className="dark-action full-button" type="submit" data-testid="button-save-product">Save product</button></form></section></div>;
}

function AccessDenied({ onBack }: { onBack: () => void }) {
  return <main className="page-main"><div className="empty-state" style={{ marginTop: 70 }}><ShieldCheck size={34} /><strong>Admin access only</strong><span>Sign in with the seeded demo admin to open the control room.</span><button className="dark-action" style={{ marginTop: 18 }} onClick={onBack} data-testid="button-back-store">Back to store</button></div></main>;
}

function SiteFooter() {
  return <footer className="footer"><div className="footer-inner"><div><b>Badminton Bazaar</b><div style={{ marginTop: 7 }}>The focused gear counter for Indian badminton.</div></div><div style={{ textAlign: "right" }}>A self-contained demo · No external commerce provider<br />Prices shown in INR · Built for the next rally</div></div></footer>;
}

export default App;