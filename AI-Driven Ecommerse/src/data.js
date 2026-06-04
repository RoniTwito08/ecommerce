/* TERRA — catalog data + helpers (plain JS, attaches to window) */
(function () {
  // Warm placeholder palettes — each product gets a tone so the grid has rhythm.
  const TONES = {
    clay:   "linear-gradient(150deg, oklch(0.78 0.075 50), oklch(0.66 0.10 42))",
    sand:   "linear-gradient(150deg, oklch(0.90 0.04 80), oklch(0.82 0.055 72))",
    olive:  "linear-gradient(150deg, oklch(0.80 0.05 120), oklch(0.70 0.06 118))",
    stone:  "linear-gradient(150deg, oklch(0.88 0.012 70), oklch(0.78 0.014 68))",
    ink:    "linear-gradient(150deg, oklch(0.42 0.018 60), oklch(0.30 0.02 58))",
    rust:   "linear-gradient(150deg, oklch(0.66 0.11 40), oklch(0.54 0.115 36))",
    cream:  "linear-gradient(150deg, oklch(0.94 0.022 78), oklch(0.88 0.03 70))",
    sage:   "linear-gradient(150deg, oklch(0.84 0.035 145), oklch(0.75 0.045 142))",
    blush:  "linear-gradient(150deg, oklch(0.87 0.045 30), oklch(0.79 0.06 28))",
  };

  const CATEGORIES = [
    { id: "ceramics", name: "Ceramics", tag: "stoneware & porcelain", tone: "clay" },
    { id: "lighting", name: "Lighting", tag: "lamps & sconces", tone: "sand" },
    { id: "textiles", name: "Textiles", tag: "throws & linens", tone: "blush" },
    { id: "furniture", name: "Furniture", tag: "seating & tables", tone: "ink" },
    { id: "tableware", name: "Tableware", tag: "serve & dine", tone: "olive" },
    { id: "objects", name: "Objects", tag: "small wares", tone: "rust" },
  ];

  // helper to build a product
  let _id = 0;
  const P = (name, category, price, tone, shot, opts = {}) => ({
    id: "p" + (++_id),
    name, category, price,
    tone, shot,
    was: opts.was || null,
    rating: opts.rating || (4.4 + (_id % 6) * 0.1).toFixed(1) * 1,
    reviews: opts.reviews || (18 + _id * 7),
    badge: opts.badge || null,         // "new" | "bestseller" | null
    stock: opts.stock == null ? 24 : opts.stock,
    maker: opts.maker || "Terra Studio",
    material: opts.material || "—",
    desc: opts.desc || "A considered object made to live with, not just look at — finished by hand and built to age gracefully.",
  });

  const PRODUCTS = [
    P("Hutch Stoneware Vase", "ceramics", 88, "clay", "vase · studio shot", { badge: "bestseller", rating: 4.9, reviews: 214, material: "Reactive glaze stoneware", desc: "Thrown by hand and finished in a reactive clay glaze, so no two pieces share the same speckle. A generous mouth for branches or stems." }),
    P("Mesa Table Lamp", "lighting", 240, "sand", "table lamp · lifestyle", { badge: "new", was: 285, material: "Linen shade, oak base", desc: "A warm, diffuse glow from a hand-turned oak base and a natural linen shade. Dimmable, with a fabric cord and inline switch." }),
    P("Loop Wool Throw", "textiles", 165, "blush", "wool throw · folded", { rating: 4.8, reviews: 96, material: "100% lambswool", desc: "Woven in a small mill from lambswool with a looped texture that traps warmth. Generously sized for a sofa or the foot of a bed." }),
    P("Plinth Side Table", "furniture", 380, "ink", "side table · 3/4 view", { badge: "bestseller", material: "Solid ash, oil finish", desc: "A quiet column of solid ash with a softened edge. Doubles as a stool or a perch for a lamp and a stack of books." }),
    P("Coastal Dinner Set", "tableware", 130, "olive", "dinner set · overhead", { rating: 4.7, reviews: 142, material: "Glazed stoneware, 4pc", desc: "A four-piece setting with a soft matte exterior and glossy well. Stacks neatly and is dishwasher friendly." }),
    P("Ridge Bookend Pair", "objects", 64, "rust", "bookends · pair", { material: "Cast aluminium", desc: "Weighty cast bookends with a brushed finish that holds a shelf in order. Sold as a pair." }),
    P("Ora Pendant Light", "lighting", 320, "cream", "pendant · hung", { badge: "new", material: "Opal glass, brass", desc: "A hand-blown opal glass globe on a slim brass stem. Casts an even, soft light over a table." }),
    P("Field Linen Cushion", "textiles", 72, "sage", "cushion · styled", { rating: 4.6, reviews: 58, material: "Washed linen, feather fill", desc: "Stonewashed linen with a feather-down insert that plumps back up. An understated tone that works anywhere." }),
    P("Carve Serving Bowl", "tableware", 96, "clay", "bowl · overhead", { rating: 4.9, reviews: 173, material: "Turned beech", desc: "A wide, shallow bowl turned from a single block of beech and finished with food-safe oil. For fruit, salad, or keys by the door." }),
    P("Monolith Floor Lamp", "lighting", 460, "ink", "floor lamp · room", { badge: "bestseller", material: "Powder-coated steel", desc: "A sculptural arc in powder-coated steel that reaches over a reading chair. Weighted base, dimmable head." }),
    P("Drift Ceramic Mug", "ceramics", 34, "stone", "mug · in hand", { rating: 4.8, reviews: 311, stock: 4, material: "Speckled stoneware", desc: "An everyday mug with a comfortable handle and a speckled body. Microwave and dishwasher safe." }),
    P("Quarry Coffee Table", "furniture", 720, "stone", "coffee table · room", { was: 820, material: "Travertine, steel", desc: "A slab of honed travertine on a minimal steel frame. A grounding centrepiece with natural veining unique to each piece." }),
    P("Halo Wall Sconce", "lighting", 185, "sand", "sconce · wall", { material: "Brushed brass", desc: "A compact uplight in brushed brass that washes a wall in warm light. Hardwired or plug-in." }),
    P("Weave Storage Basket", "objects", 58, "cream", "basket · styled", { rating: 4.5, reviews: 47, material: "Seagrass", desc: "Hand-woven seagrass with sturdy handles. For throws, firewood, or laundry." }),
    P("Slate Dinner Plate", "tableware", 28, "ink", "plate · stacked", { rating: 4.7, reviews: 88, material: "Matte stoneware", desc: "A matte charcoal plate with a subtle rim. Sold individually so you can build the set you want." }),
    P("Mira Bud Vase Trio", "ceramics", 52, "blush", "bud vases · trio", { badge: "new", material: "Porcelain, 3pc", desc: "Three slender porcelain vases in graduating heights for single stems. Group them or scatter them." }),
    P("Anchor Throw Blanket", "textiles", 210, "rust", "throw · draped", { rating: 4.9, reviews: 64, material: "Alpaca blend", desc: "An indulgent alpaca-blend throw with a heavyweight drape and fringed edge. The one everyone reaches for." }),
    P("Pebble Candle Holder", "objects", 42, "olive", "holder · lit", { rating: 4.6, reviews: 39, stock: 0, material: "Soapstone", desc: "A smooth soapstone holder for tapers, cool to the touch and pleasingly heavy. Currently between batches." }),
  ];

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function catName(id) {
    const c = CATEGORIES.find((c) => c.id === id);
    return c ? c.name : id;
  }

  // Demo order history
  const ORDERS = [
    { id: "TR-48821", date: "May 28, 2026", status: "delivered", total: 328,
      items: [PRODUCTS[0], PRODUCTS[7], PRODUCTS[5]] },
    { id: "TR-48710", date: "May 14, 2026", status: "shipped", total: 460,
      items: [PRODUCTS[9]] },
    { id: "TR-48566", date: "Apr 30, 2026", status: "processing", total: 164,
      items: [PRODUCTS[10], PRODUCTS[14], PRODUCTS[15]] },
    { id: "TR-48201", date: "Apr 02, 2026", status: "delivered", total: 720,
      items: [PRODUCTS[11]] },
    { id: "TR-47988", date: "Mar 19, 2026", status: "cancelled", total: 58,
      items: [PRODUCTS[13]] },
  ];

  const STATUS = {
    delivered:  { label: "Delivered",  cls: "badge--ok" },
    shipped:    { label: "Shipped",    cls: "badge--accent" },
    processing: { label: "Processing", cls: "badge--warn" },
    cancelled:  { label: "Cancelled",  cls: "badge--danger" },
  };

  window.TERRA = {
    TONES, CATEGORIES, PRODUCTS, ORDERS, STATUS,
    money, catName,
    user: { first: "Elise", last: "Moreau", email: "elise.moreau@studio.com", since: "2024", city: "Lisbon, PT" },
  };
})();
