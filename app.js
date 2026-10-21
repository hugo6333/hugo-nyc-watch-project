// ---- Watch Collection app ----
// Everything persists to localStorage under this key. No backend required.
const STORAGE_KEY = "watchCollection.v1";
const THEME_KEY = "watchCollection.theme";

/** @typedef {{id:string, brand:string, model:string, ref:string, year:string, box:string, papers:string, condition:string, price:string, saleStatus:string, notes:string, images:string[], dateAdded:number}} Watch */

const EBAY_USERNAME = "huch_3217";
const EBAY_URL = `https://www.ebay.com/usr/${EBAY_USERNAME}`;
const EMAIL_ADDRESS = "hugochen@stern.nyu.edu";
const INSTAGRAM_HANDLE = "hugochen63";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
const FAVORITES_KEY = "watchCollection.favorites";
const CART_KEY = "watchCollection.cart";
const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // "New Arrival" badge window

// ---- Editable site copy ----
// Every string here can be changed by the owner from the site itself (⋮ menu ->
// "Edit Site Text") with zero coding — no HTML/formatting allowed on purpose, so it's
// impossible to break the layout by editing text. Overrides live in localStorage under
// CONTENT_KEY; these are just the fallback/default values.
const CONTENT_KEY = "watchCollection.content";
const DEFAULT_CONTENT = {
  siteTitle: "Hugo's NYC Watch Project",
  shippingLabel: "Free Shipping",
  paymentMethods: "Cash in person · Venmo · Zelle · PayPal (Friends & Family)",
  footerText: "© 2026 Hugo Chen. All rights reserved. Listings subject to prior sale. Prices in USD.",
  meetupNote: "📍 NYC meetups available & encouraged",
  shippingNote: "🚚 Free shipping",
  aboutBody:
    "Hi, I'm Hugo 👋 — I split my time between Taiwan and the US, and I'm currently a student at NYU Stern.\n\n" +
    "I've been deeply into watches for years — researching movements, references, and market values obsessively before every purchase (and every sale). Watches here aren't flipped sight-unseen; I do my homework on each piece.\n\n" +
    "Authenticity guaranteed on everything listed — every watch is personally inspected and verified by me before it goes up.\n\n" +
    "Free shipping on all sales, and NYC meetups are always welcome if you'd rather see a piece in person.\n\n" +
    "Questions on anything here? Reach out any time:",
  coffeeBody:
    "If you're in NYC, let's grab a coffee — my treat — and talk watches. Whether you're curious about a piece, want a second opinion, or just love the hobby, I'm always happy to meet up.\n\n" +
    "Reach out and we'll find a time:",
  sellBody:
    "Thinking about selling? Send a few photos (dial, case-back, and box/papers if you have them) over email or Instagram DM, and I'll get back to you with a fair, no-obligation price estimate — usually within a day.\n\n" +
    "Since I'm based in NYC, a face-to-face meetup is easy and convenient — you can hand it over in person and get paid on the spot, no shipping risk on your end.\n\n" +
    "Send photos here:",
  tradeInIntro:
    "Looking to trade toward something in the collection (or just want a cash offer)? Attach a few photos and details and I'll follow up with a trade-in offer.",
  sourceIntro:
    "Looking for something specific? Tell me what you want and I'll keep an eye out — this goes straight to my inbox.",
  faqRaw:
    "Q: How do I know a watch is authentic?\n" +
    "A: Every watch is personally inspected and verified by me before it's listed — see the About Me section for my background. I also have an active trading history on eBay if you'd like to see my track record.\n\n" +
    "Q: What condition are the watches in?\n" +
    "A: Each listing shows a condition rating (Mint / Excellent / Good / Fair) plus notes on wear, service history, and anything else worth knowing.\n\n" +
    "Q: Do you ship, or can we meet in person?\n" +
    "A: Both. Free shipping is included on every sale, and since I'm based in NYC, in-person meetups are easy and encouraged if you'd rather inspect the watch and pay on the spot.\n\n" +
    "Q: What payment methods do you accept?\n" +
    "A: Venmo, Zelle, PayPal (Friends & Family), or cash for in-person meetups.\n\n" +
    "Q: Do you buy watches or help me find one?\n" +
    "A: Yes to both — see \"Sell Your Watch\" if you're looking to sell, or \"Source a Watch\" if you're hunting for something specific.",
};

// Owner-only gate for Add/Edit/Delete/Import. This is CLIENT-SIDE ONLY — anyone who reads
// the page source can see this passcode, so it deters casual visitors but is not real
// security. Change it before you publish this site.
const OWNER_PASSCODE = "hugo63chen";
const OWNER_KEY = "watchCollection.isOwner";

/** @type {Watch[]} */
let watches = loadWatches();
let currentImages = []; // array of base64 strings staged in the modal
let cardGalleryIndex = {}; // in-memory only: { [watchId]: activeImageIndex }
let isOwner = localStorage.getItem(OWNER_KEY) === "true";
let favorites = loadFavorites(); // Set of watch ids, this-browser-only
let cart = loadCart(); // Set of watch ids, this-browser-only
let showFavoritesOnly = false;
let viewGalleryIndex = 0; // active photo index inside the open View Watch modal
let currentOfferWatchId = null; // which watch the open Make an Offer modal targets
let content = loadContent();

// ---- Elements ----
const grid = document.getElementById("grid");
const emptyState = document.getElementById("emptyState");
const statsEl = document.getElementById("stats");

const addBtn = document.getElementById("addBtn");
const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const importLabel = document.getElementById("importLabel");
const themeBtn = document.getElementById("themeBtn");
const ownerToggleBtn = document.getElementById("ownerToggleBtn");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterBox = document.getElementById("filterBox");
const filterPapers = document.getElementById("filterPapers");
const filterCondition = document.getElementById("filterCondition");
const filterSaleStatus = document.getElementById("filterSaleStatus");
const filterPriceRange = document.getElementById("filterPriceRange");
const favoritesToggleBtn = document.getElementById("favoritesToggleBtn");
const soldArchiveBtn = document.getElementById("soldArchiveBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const watchForm = document.getElementById("watchForm");
const watchIdInput = document.getElementById("watchId");
const brandInput = document.getElementById("brandInput");
const modelInput = document.getElementById("modelInput");
const refInput = document.getElementById("refInput");
const yearInput = document.getElementById("yearInput");
const boxSelect = document.getElementById("boxSelect");
const papersSelect = document.getElementById("papersSelect");
const conditionSelect = document.getElementById("conditionSelect");
const priceInput = document.getElementById("priceInput");
const saleStatusSelect = document.getElementById("saleStatusSelect");
const notesInput = document.getElementById("notesInput");
const imageInput = document.getElementById("imageInput");
const imageGalleryEdit = document.getElementById("imageGalleryEdit");
const deleteBtn = document.getElementById("deleteBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const aboutBtn = document.getElementById("aboutBtn");
const aboutModalOverlay = document.getElementById("aboutModalOverlay");
const closeAboutBtn = document.getElementById("closeAboutBtn");

const coffeeBtn = document.getElementById("coffeeBtn");
const coffeeModalOverlay = document.getElementById("coffeeModalOverlay");
const closeCoffeeBtn = document.getElementById("closeCoffeeBtn");

const sellBtn = document.getElementById("sellBtn");
const sellModalOverlay = document.getElementById("sellModalOverlay");
const closeSellBtn = document.getElementById("closeSellBtn");

const sourceBtn = document.getElementById("sourceBtn");
const sourceModalOverlay = document.getElementById("sourceModalOverlay");
const closeSourceBtn = document.getElementById("closeSourceBtn");
const sourceCancelBtn = document.getElementById("sourceCancelBtn");
const sourceForm = document.getElementById("sourceForm");
const sourceSubmitBtn = document.getElementById("sourceSubmitBtn");
const sourceFormStatus = document.getElementById("sourceFormStatus");
const SOURCE_REQUEST_EMAIL = "hugochen63@gmail.com";

const faqBtn = document.getElementById("faqBtn");
const faqModalOverlay = document.getElementById("faqModalOverlay");
const closeFaqBtn = document.getElementById("closeFaqBtn");

const viewModalOverlay = document.getElementById("viewModalOverlay");
const viewModalTitle = document.getElementById("viewModalTitle");
const closeViewBtn = document.getElementById("closeViewBtn");
const viewGallery = document.getElementById("viewGallery");
const viewBrand = document.getElementById("viewBrand");
const viewModel = document.getElementById("viewModel");
const viewMeta = document.getElementById("viewMeta");
const viewPrice = document.getElementById("viewPrice");
const viewBadges = document.getElementById("viewBadges");
const viewNotes = document.getElementById("viewNotes");
const viewFavoriteBtn = document.getElementById("viewFavoriteBtn");
const viewShareBtn = document.getElementById("viewShareBtn");
const viewCartBtn = document.getElementById("viewCartBtn");
const viewOfferBtn = document.getElementById("viewOfferBtn");
const viewShareStatus = document.getElementById("viewShareStatus");

const offerModalOverlay = document.getElementById("offerModalOverlay");
const closeOfferBtn = document.getElementById("closeOfferBtn");
const offerCancelBtn = document.getElementById("offerCancelBtn");
const offerForm = document.getElementById("offerForm");
const offerWatchLabel = document.getElementById("offerWatchLabel");
const offerAmountInput = document.getElementById("offerAmountInput");
const offerEmailInput = document.getElementById("offerEmailInput");
const offerMessageInput = document.getElementById("offerMessageInput");
const offerSubmitBtn = document.getElementById("offerSubmitBtn");
const offerFormStatus = document.getElementById("offerFormStatus");

const tradeInBtn = document.getElementById("tradeInBtn");
const tradeInModalOverlay = document.getElementById("tradeInModalOverlay");
const closeTradeInBtn = document.getElementById("closeTradeInBtn");
const tradeInCancelBtn = document.getElementById("tradeInCancelBtn");
const tradeInForm = document.getElementById("tradeInForm");
const tradeInNextInput = document.getElementById("tradeInNextInput");
const tradeInBanner = document.getElementById("tradeInBanner");
const dismissTradeInBanner = document.getElementById("dismissTradeInBanner");

const cartBtn = document.getElementById("cartBtn");
const cartModalOverlay = document.getElementById("cartModalOverlay");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartForm = document.getElementById("cartForm");
const cartEmailInput = document.getElementById("cartEmailInput");
const cartPaymentSelect = document.getElementById("cartPaymentSelect");
const cartMessageInput = document.getElementById("cartMessageInput");
const cartClearBtn = document.getElementById("cartClearBtn");
const cartSubmitBtn = document.getElementById("cartSubmitBtn");
const cartFormStatus = document.getElementById("cartFormStatus");

// Elements whose text comes from `content` (see Editable site copy above)
const siteTitleH1 = document.getElementById("siteTitleH1");
const shippingLabelText = document.getElementById("shippingLabelText");
const paymentMethodsText = document.getElementById("paymentMethodsText");
const footerTextEl = document.getElementById("footerText");
const aboutBodyContent = document.getElementById("aboutBodyContent");
const coffeeBodyContent = document.getElementById("coffeeBodyContent");
const sellBodyContent = document.getElementById("sellBodyContent");
const tradeInIntroText = document.getElementById("tradeInIntroText");
const sourceIntroText = document.getElementById("sourceIntroText");
const faqContent = document.getElementById("faqContent");
const viewMeetupNote = document.getElementById("viewMeetupNote");
const viewShippingNote = document.getElementById("viewShippingNote");

// Edit Site Text modal (owner-only)
const editTextBtn = document.getElementById("editTextBtn");
const textEditModalOverlay = document.getElementById("textEditModalOverlay");
const closeTextEditBtn = document.getElementById("closeTextEditBtn");
const cancelTextEditBtn = document.getElementById("cancelTextEditBtn");
const saveTextBtn = document.getElementById("saveTextBtn");
const resetTextBtn = document.getElementById("resetTextBtn");
const textEditStatus = document.getElementById("textEditStatus");
const CONTENT_FIELD_IDS = {
  siteTitle: "ctSiteTitle",
  shippingLabel: "ctShippingLabel",
  paymentMethods: "ctPaymentMethods",
  footerText: "ctFooterText",
  meetupNote: "ctMeetupNote",
  shippingNote: "ctShippingNote",
  aboutBody: "ctAboutBody",
  coffeeBody: "ctCoffeeBody",
  sellBody: "ctSellBody",
  tradeInIntro: "ctTradeInIntro",
  sourceIntro: "ctSourceIntro",
  faqRaw: "ctFaqRaw",
};

// ---- Storage ----
function loadWatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Migrate old "Unknown" box/papers values (option removed) down to "No",
    // and migrate the old single `image` field into the `images` array.
    let migrated = false;
    for (const w of parsed) {
      if (w.box === "Unknown") { w.box = "No"; migrated = true; }
      if (w.papers === "Unknown") { w.papers = "No"; migrated = true; }
      if (!Array.isArray(w.images)) {
        w.images = w.image ? [w.image] : [];
        migrated = true;
      }
      if ("image" in w) { delete w.image; migrated = true; }
      if (!w.condition) { w.condition = "Excellent"; migrated = true; }
    }
    if (migrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (e) {
    console.error("Failed to load watches", e);
    return [];
  }
}

function saveWatches() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watches));
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    return new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

function toggleFavorite(id) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  saveFavorites();
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    return new Set();
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify([...cart]));
}

function toggleCart(id) {
  if (cart.has(id)) cart.delete(id);
  else cart.add(id);
  saveCart();
}

// ---- Editable site copy ----
function loadContent() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    return { ...DEFAULT_CONTENT, ...(raw ? JSON.parse(raw) : {}) };
  } catch (e) {
    return { ...DEFAULT_CONTENT };
  }
}

function saveContent() {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
}

// Renders plain text as paragraphs (blank line = new paragraph). Uses textContent only —
// no HTML is ever interpreted, so there's no way for typed text to break the layout.
function renderParagraphs(container, text) {
  container.innerHTML = "";
  const paragraphs = String(text || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    const el = document.createElement("p");
    el.textContent = p;
    container.appendChild(el);
  }
}

// Parses the "Q: ...\nA: ...\n\nQ: ...\nA: ..." format into <details> blocks.
function renderFaq(container, raw) {
  container.innerHTML = "";
  const blocks = String(raw || "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  blocks.forEach((block, i) => {
    const qMatch = block.match(/^Q:\s*([\s\S]*?)\nA:\s*([\s\S]*)$/i);
    if (!qMatch) return; // silently skip malformed blocks rather than breaking the page
    const [, question, answer] = qMatch;
    const details = document.createElement("details");
    if (i === 0) details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = question.trim();
    const p = document.createElement("p");
    p.textContent = answer.trim();
    details.appendChild(summary);
    details.appendChild(p);
    container.appendChild(details);
  });
}

// Pushes `content` into every part of the page that displays it.
function applyContent() {
  document.title = content.siteTitle;
  siteTitleH1.textContent = content.siteTitle;
  shippingLabelText.textContent = content.shippingLabel;
  paymentMethodsText.textContent = content.paymentMethods;
  footerTextEl.textContent = content.footerText;
  renderParagraphs(aboutBodyContent, content.aboutBody);
  renderParagraphs(coffeeBodyContent, content.coffeeBody);
  renderParagraphs(sellBodyContent, content.sellBody);
  tradeInIntroText.textContent = content.tradeInIntro;
  sourceIntroText.textContent = content.sourceIntro;
  renderFaq(faqContent, content.faqRaw);
  viewMeetupNote.textContent = content.meetupNote;
  viewShippingNote.textContent = content.shippingNote;
}

// ---- Theme ----
// Cream is the default look regardless of the visitor's OS/browser dark-mode setting.
// Dark mode is opt-in only, via the Toggle Theme button, and is remembered per device.
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  document.documentElement.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
}

// ---- Rendering ----
function badgeClass(status) {
  if (status === "Yes") return "badge-yes";
  if (status === "No") return "badge-no";
  return "badge-unknown";
}

function saleFlagClass(status) {
  if (status === "For Sale") return "for-sale";
  if (status === "Pending") return "pending";
  if (status === "Sold") return "sold";
  return "";
}

function formatPrice(price) {
  const n = Number(price);
  if (!price || Number.isNaN(n)) return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function buildCardImageGallery(w) {
  const images = Array.isArray(w.images) ? w.images : [];
  const imgWrap = document.createElement("div");
  imgWrap.className = "card-image";

  if (images.length === 0) {
    imgWrap.textContent = "No image";
    return imgWrap;
  }

  if (!(w.id in cardGalleryIndex)) cardGalleryIndex[w.id] = 0;

  const img = document.createElement("img");
  img.alt = `${w.brand} ${w.model}`;
  imgWrap.appendChild(img);

  let counter;
  function show() {
    const idx = cardGalleryIndex[w.id] % images.length;
    img.src = images[idx];
    if (counter) counter.textContent = `${idx + 1}/${images.length}`;
  }

  if (images.length > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "img-nav img-nav-prev";
    prevBtn.textContent = "‹";
    prevBtn.setAttribute("aria-label", "Previous photo");
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cardGalleryIndex[w.id] = (cardGalleryIndex[w.id] - 1 + images.length) % images.length;
      show();
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "img-nav img-nav-next";
    nextBtn.textContent = "›";
    nextBtn.setAttribute("aria-label", "Next photo");
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cardGalleryIndex[w.id] = (cardGalleryIndex[w.id] + 1) % images.length;
      show();
    });

    counter = document.createElement("span");
    counter.className = "img-counter";

    imgWrap.appendChild(prevBtn);
    imgWrap.appendChild(nextBtn);
    imgWrap.appendChild(counter);
  }

  show();
  return imgWrap;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const boxF = filterBox.value;
  const papersF = filterPapers.value;
  const conditionF = filterCondition.value;
  const [sortKey, sortDir] = sortSelect.value.split("-");

  const saleF = filterSaleStatus.value;
  const priceRangeF = filterPriceRange.value;
  let priceMin = null, priceMax = null;
  if (priceRangeF) {
    const [minStr, maxStr] = priceRangeF.split("-");
    priceMin = Number(minStr);
    priceMax = maxStr === "" ? Infinity : Number(maxStr);
  }

  // Sold watches stay out of the main catalog by default (like WatchBox/Bob's Watches) —
  // they only appear once you explicitly filter to "Sold" via the archive shortcut below.
  const showingSoldArchive = saleF === "Sold";

  let list = watches.filter((w) => {
    if (boxF && w.box !== boxF) return false;
    if (papersF && w.papers !== papersF) return false;
    if (conditionF && w.condition !== conditionF) return false;
    if (saleF && (w.saleStatus || "Not for Sale") !== saleF) return false;
    if (!saleF && (w.saleStatus || "Not for Sale") === "Sold") return false;
    if (priceRangeF) {
      const p = Number(w.price) || 0;
      if (p < priceMin || p >= priceMax) return false;
    }
    if (showFavoritesOnly && !favorites.has(w.id)) return false;
    if (query) {
      const hay = `${w.brand} ${w.model} ${w.ref} ${w.year}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  list = list.slice().sort((a, b) => {
    let av, bv;
    if (sortKey === "name") {
      av = `${a.brand} ${a.model}`.toLowerCase();
      bv = `${b.brand} ${b.model}`.toLowerCase();
    } else if (sortKey === "year") {
      av = Number(a.year) || 0;
      bv = Number(b.year) || 0;
    } else if (sortKey === "price") {
      av = Number(a.price) || 0;
      bv = Number(b.price) || 0;
    } else {
      av = a.dateAdded;
      bv = b.dateAdded;
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  grid.innerHTML = "";
  emptyState.classList.toggle("hidden", watches.length !== 0);

  if (watches.length !== 0 && list.length === 0) {
    const msg = showingSoldArchive ? "No sold watches match your filters." : "No watches match your filters.";
    grid.innerHTML = `<p style="grid-column:1/-1;color:var(--text-muted);text-align:center;margin-top:20px;">${msg}</p>`;
  }

  // Recently Sold archive shortcut, shown only when relevant.
  const soldCount = watches.filter((w) => (w.saleStatus || "Not for Sale") === "Sold").length;
  if (showingSoldArchive) {
    soldArchiveBtn.textContent = "← Back to Available Watches";
    soldArchiveBtn.classList.remove("hidden");
  } else if (soldCount > 0) {
    soldArchiveBtn.textContent = `🏆 View Recently Sold (${soldCount})`;
    soldArchiveBtn.classList.remove("hidden");
  } else {
    soldArchiveBtn.classList.add("hidden");
  }

  for (const w of list) {
    const saleStatus = w.saleStatus || "Not for Sale";
    const isSold = saleStatus === "Sold";
    const isNew = Date.now() - (w.dateAdded || 0) < NEW_WINDOW_MS;

    const card = document.createElement("div");
    card.className = "card is-clickable" + (isSold ? " is-sold" : "");
    card.addEventListener("click", () => {
      if (isOwner) openEditModal(w.id);
      else openViewModal(w.id);
    });

    const imgWrap = buildCardImageGallery(w);
    if (isSold) {
      const stamp = document.createElement("span");
      stamp.className = "sold-watermark";
      stamp.textContent = "SOLD";
      imgWrap.appendChild(stamp);
    } else if (saleStatus !== "Not for Sale") {
      const flag = document.createElement("span");
      flag.className = `sale-flag ${saleFlagClass(saleStatus)}`;
      flag.textContent = saleStatus;
      imgWrap.appendChild(flag);
    }
    if (isNew && !isSold) {
      const ribbon = document.createElement("span");
      ribbon.className = "new-ribbon";
      ribbon.textContent = "New";
      imgWrap.appendChild(ribbon);
    }

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "favorite-btn" + (favorites.has(w.id) ? " is-favorite" : "");
    favBtn.setAttribute("aria-label", favorites.has(w.id) ? "Remove from favorites" : "Save to favorites");
    favBtn.textContent = favorites.has(w.id) ? "❤️" : "🤍";
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(w.id);
      render();
    });
    imgWrap.appendChild(favBtn);

    const priceStr = formatPrice(w.price);

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `
      <div class="card-brand">${escapeHtml(w.brand || "")}</div>
      <div class="card-model">${escapeHtml(w.model || "")}</div>
      <div class="card-meta">${[w.ref, w.year].filter(Boolean).map(escapeHtml).join(" · ") || "&nbsp;"}</div>
      <div class="price-row">
        ${priceStr ? `<div class="card-price">${priceStr}</div>` : "<span></span>"}
        <div class="contact-inline">
          <a href="mailto:${EMAIL_ADDRESS}" class="contact-chip" title="Email">✉️</a>
          <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener" class="contact-chip" title="Instagram @${INSTAGRAM_HANDLE}">📷</a>
          <a href="${EBAY_URL}" target="_blank" rel="noopener" class="contact-chip" title="eBay: ${EBAY_USERNAME}">🛒</a>
        </div>
      </div>
      <div class="badges">
        <span class="badge badge-condition">${escapeHtml(w.condition || "Excellent")}</span>
        <span class="badge ${badgeClass(w.box)}">Box: ${w.box}</span>
        <span class="badge ${badgeClass(w.papers)}">Papers: ${w.papers}</span>
      </div>
      <div class="meetup-note">${escapeHtml(content.meetupNote)}</div>
      <div class="shipping-note">${escapeHtml(content.shippingNote)}</div>
    `;

    // Contact chips should open mail/Instagram/eBay, not trigger the card's click-through.
    body.querySelectorAll(".contact-chip").forEach((el) => {
      el.addEventListener("click", (e) => e.stopPropagation());
    });

    card.appendChild(imgWrap);
    card.appendChild(body);
    grid.appendChild(card);
  }

  renderStats();
}

function renderStats() {
  const total = watches.length;
  const fullSet = watches.filter((w) => w.box === "Yes" && w.papers === "Yes").length;
  const forSale = watches.filter((w) => w.saleStatus === "For Sale").length;
  const favCount = favorites.size;
  statsEl.innerHTML = total
    ? `<span><strong>${total}</strong> watch${total === 1 ? "" : "es"}</span><span><strong>${fullSet}</strong> full set (box + papers)</span><span><strong>${forSale}</strong> for sale</span>` +
      (favCount ? `<span><strong>${favCount}</strong> favorited</span>` : "")
    : "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ---- Modal ----
function openAddModal() {
  watchForm.reset();
  watchIdInput.value = "";
  currentImages = [];
  renderImageGalleryEdit();
  modalTitle.textContent = "Add Watch";
  deleteBtn.classList.add("hidden");
  boxSelect.value = "No";
  papersSelect.value = "No";
  conditionSelect.value = "Excellent";
  saleStatusSelect.value = "Not for Sale";
  modalOverlay.classList.remove("hidden");
  brandInput.focus();
}

function openEditModal(id) {
  const w = watches.find((x) => x.id === id);
  if (!w) return;
  watchIdInput.value = w.id;
  brandInput.value = w.brand;
  modelInput.value = w.model;
  refInput.value = w.ref || "";
  yearInput.value = w.year || "";
  boxSelect.value = w.box;
  papersSelect.value = w.papers;
  conditionSelect.value = w.condition || "Excellent";
  priceInput.value = w.price || "";
  saleStatusSelect.value = w.saleStatus || "Not for Sale";
  notesInput.value = w.notes || "";
  currentImages = Array.isArray(w.images) ? w.images.slice() : [];
  renderImageGalleryEdit();
  modalTitle.textContent = "Edit Watch";
  deleteBtn.classList.remove("hidden");
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  modalOverlay.classList.add("hidden");
}

function renderImageGalleryEdit() {
  imageGalleryEdit.innerHTML = "";
  if (currentImages.length === 0) {
    const ph = document.createElement("div");
    ph.className = "image-placeholder";
    ph.textContent = "No photos yet";
    imageGalleryEdit.appendChild(ph);
    return;
  }
  currentImages.forEach((src, i) => {
    const thumb = document.createElement("div");
    thumb.className = "thumb" + (i === 0 ? " thumb-cover" : "");

    const img = document.createElement("img");
    img.src = src;
    img.title = i === 0 ? "Cover photo" : "Click to make this the cover photo";
    img.addEventListener("click", () => {
      if (i === 0) return;
      const [moved] = currentImages.splice(i, 1);
      currentImages.unshift(moved);
      renderImageGalleryEdit();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "thumb-remove";
    removeBtn.setAttribute("aria-label", "Remove photo");
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentImages.splice(i, 1);
      renderImageGalleryEdit();
    });

    thumb.appendChild(img);
    thumb.appendChild(removeBtn);
    if (i === 0) {
      const badge = document.createElement("span");
      badge.className = "thumb-cover-badge";
      badge.textContent = "Cover";
      thumb.appendChild(badge);
    }
    imageGalleryEdit.appendChild(thumb);
  });
}

// ---- Simple info modals (About Me / Coffee on Me / Sell Your Watch) ----
function wireSimpleModal(openBtn, overlay, closeBtn) {
  openBtn.addEventListener("click", () => overlay.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });
}
wireSimpleModal(aboutBtn, aboutModalOverlay, closeAboutBtn);
wireSimpleModal(coffeeBtn, coffeeModalOverlay, closeCoffeeBtn);
wireSimpleModal(sellBtn, sellModalOverlay, closeSellBtn);
wireSimpleModal(sourceBtn, sourceModalOverlay, closeSourceBtn);
wireSimpleModal(faqBtn, faqModalOverlay, closeFaqBtn);
sourceCancelBtn.addEventListener("click", () => sourceModalOverlay.classList.add("hidden"));
const simpleOverlays = [aboutModalOverlay, coffeeModalOverlay, sellModalOverlay, sourceModalOverlay, faqModalOverlay, viewModalOverlay, offerModalOverlay, cartModalOverlay, tradeInModalOverlay, textEditModalOverlay];

// ---- Edit Site Text modal (owner-only) ----
function openTextEditModal() {
  if (!isOwner) return;
  for (const [key, id] of Object.entries(CONTENT_FIELD_IDS)) {
    document.getElementById(id).value = content[key];
  }
  textEditStatus.classList.add("hidden");
  menuDropdown.classList.add("hidden");
  textEditModalOverlay.classList.remove("hidden");
}

function setTextEditStatus(message, kind) {
  textEditStatus.textContent = message;
  textEditStatus.className = "form-status" + (kind ? ` form-status-${kind}` : "");
  textEditStatus.classList.toggle("hidden", !message);
}

editTextBtn.addEventListener("click", openTextEditModal);
closeTextEditBtn.addEventListener("click", () => textEditModalOverlay.classList.add("hidden"));
cancelTextEditBtn.addEventListener("click", () => textEditModalOverlay.classList.add("hidden"));
textEditModalOverlay.addEventListener("click", (e) => {
  if (e.target === textEditModalOverlay) textEditModalOverlay.classList.add("hidden");
});

saveTextBtn.addEventListener("click", () => {
  if (!isOwner) return;
  for (const [key, id] of Object.entries(CONTENT_FIELD_IDS)) {
    content[key] = document.getElementById(id).value;
  }
  saveContent();
  applyContent();
  render();
  setTextEditStatus("✅ Saved — updated on this browser now.", "success");
});

resetTextBtn.addEventListener("click", () => {
  if (!isOwner) return;
  if (!confirm("Reset ALL site text back to the original defaults? This can't be undone.")) return;
  localStorage.removeItem(CONTENT_KEY);
  content = { ...DEFAULT_CONTENT };
  applyContent();
  render();
  for (const [key, id] of Object.entries(CONTENT_FIELD_IDS)) {
    document.getElementById(id).value = content[key];
  }
  setTextEditStatus("↩️ Reset to default text.", "success");
});

// ---- View Watch modal (guest-facing read-only detail view; shareable via #watch=<id>) ----
function buildWatchShareUrl(id) {
  return `${location.origin}${location.pathname}#watch=${encodeURIComponent(id)}`;
}

function openViewModal(id) {
  const w = watches.find((x) => x.id === id);
  if (!w) return;
  viewGalleryIndex = 0;
  viewModalTitle.textContent = `${w.brand} ${w.model}`.trim() || "Watch";
  viewBrand.textContent = w.brand || "";
  viewModel.textContent = w.model || "";
  viewMeta.textContent = [w.ref, w.year].filter(Boolean).join(" · ");
  const priceStr = formatPrice(w.price);
  viewPrice.textContent = priceStr;
  viewPrice.classList.toggle("hidden", !priceStr);
  viewNotes.textContent = w.notes || "";
  viewNotes.classList.toggle("hidden", !w.notes);

  const saleStatus = w.saleStatus || "Not for Sale";
  viewBadges.innerHTML = `
    <span class="badge badge-condition">${escapeHtml(w.condition || "Excellent")}</span>
    <span class="badge ${badgeClass(w.box)}">Box: ${w.box}</span>
    <span class="badge ${badgeClass(w.papers)}">Papers: ${w.papers}</span>
    ${saleStatus !== "Not for Sale" ? `<span class="badge ${saleStatus === "Sold" ? "badge-no" : saleStatus === "Pending" ? "badge-unknown" : "badge-yes"}">${saleStatus}</span>` : ""}
  `;

  renderViewGallery(w);
  updateViewFavoriteBtn(w.id);
  updateViewCartBtn(w.id);
  setViewShareStatus("");
  viewOfferBtn.dataset.watchId = w.id;
  viewCartBtn.dataset.watchId = w.id;
  const purchasable = saleStatus === "For Sale";
  viewOfferBtn.classList.toggle("hidden", !purchasable);
  viewCartBtn.classList.toggle("hidden", !purchasable);

  history.replaceState(null, "", buildWatchShareUrl(w.id));
  viewModalOverlay.classList.remove("hidden");
}

function renderViewGallery(w) {
  const images = Array.isArray(w.images) ? w.images : [];
  viewGallery.innerHTML = "";
  if (images.length === 0) {
    viewGallery.textContent = "No image";
    return;
  }
  const img = document.createElement("img");
  img.alt = `${w.brand} ${w.model}`;
  viewGallery.appendChild(img);

  function show() { img.src = images[viewGalleryIndex % images.length]; }

  if (images.length > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "img-nav img-nav-prev";
    prevBtn.textContent = "‹";
    prevBtn.setAttribute("aria-label", "Previous photo");
    prevBtn.addEventListener("click", () => {
      viewGalleryIndex = (viewGalleryIndex - 1 + images.length) % images.length;
      show();
      counter.textContent = `${(viewGalleryIndex % images.length) + 1}/${images.length}`;
    });
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "img-nav img-nav-next";
    nextBtn.textContent = "›";
    nextBtn.setAttribute("aria-label", "Next photo");
    nextBtn.addEventListener("click", () => {
      viewGalleryIndex = (viewGalleryIndex + 1) % images.length;
      show();
      counter.textContent = `${(viewGalleryIndex % images.length) + 1}/${images.length}`;
    });
    const counter = document.createElement("span");
    counter.className = "img-counter";
    counter.textContent = `${viewGalleryIndex + 1}/${images.length}`;
    viewGallery.appendChild(prevBtn);
    viewGallery.appendChild(nextBtn);
    viewGallery.appendChild(counter);
  }
  show();
}

function updateViewFavoriteBtn(id) {
  const isFav = favorites.has(id);
  viewFavoriteBtn.textContent = isFav ? "❤️ Saved to Favorites" : "🤍 Save to Favorites";
  viewFavoriteBtn.classList.toggle("is-active", isFav);
}

function updateViewCartBtn(id) {
  const inCart = cart.has(id);
  viewCartBtn.textContent = inCart ? "🛒 In Cart" : "🛒 Add to Cart";
  viewCartBtn.classList.toggle("is-active", inCart);
}

function setViewShareStatus(message, kind) {
  viewShareStatus.textContent = message;
  viewShareStatus.className = "form-status" + (kind ? ` form-status-${kind}` : "");
  viewShareStatus.classList.toggle("hidden", !message);
}

closeViewBtn.addEventListener("click", () => viewModalOverlay.classList.add("hidden"));
viewModalOverlay.addEventListener("click", (e) => {
  if (e.target === viewModalOverlay) viewModalOverlay.classList.add("hidden");
});

viewFavoriteBtn.addEventListener("click", () => {
  const id = viewOfferBtn.dataset.watchId;
  toggleFavorite(id);
  updateViewFavoriteBtn(id);
  render();
});

viewCartBtn.addEventListener("click", () => {
  const id = viewCartBtn.dataset.watchId;
  toggleCart(id);
  updateViewCartBtn(id);
  updateCartUI();
});

viewShareBtn.addEventListener("click", async () => {
  const id = viewOfferBtn.dataset.watchId;
  const url = buildWatchShareUrl(id);
  try {
    await navigator.clipboard.writeText(url);
    setViewShareStatus("🔗 Link copied to clipboard!", "success");
  } catch (err) {
    setViewShareStatus(`Copy this link: ${url}`, null);
  }
});

viewOfferBtn.addEventListener("click", () => {
  const id = viewOfferBtn.dataset.watchId;
  viewModalOverlay.classList.add("hidden");
  openOfferModal(id);
});

// ---- Make an Offer modal: sends straight to email via FormSubmit ----
function openOfferModal(watchId) {
  const w = watches.find((x) => x.id === watchId);
  if (!w) return;
  currentOfferWatchId = watchId;
  offerForm.reset();
  setOfferFormStatus("", null);
  offerWatchLabel.textContent = `For: ${w.brand} ${w.model}${w.ref ? " (" + w.ref + ")" : ""}${formatPrice(w.price) ? " — asking " + formatPrice(w.price) : ""}`;
  offerModalOverlay.classList.remove("hidden");
}

function setOfferFormStatus(message, kind) {
  offerFormStatus.textContent = message;
  offerFormStatus.className = "form-status" + (kind ? ` form-status-${kind}` : "");
  offerFormStatus.classList.toggle("hidden", !message);
}

closeOfferBtn.addEventListener("click", () => offerModalOverlay.classList.add("hidden"));
offerCancelBtn.addEventListener("click", () => offerModalOverlay.classList.add("hidden"));
offerModalOverlay.addEventListener("click", (e) => {
  if (e.target === offerModalOverlay) offerModalOverlay.classList.add("hidden");
});

offerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const w = watches.find((x) => x.id === currentOfferWatchId);
  const payload = {
    "Watch": w ? `${w.brand} ${w.model}${w.ref ? " (" + w.ref + ")" : ""}` : "Unknown watch",
    "Listing link": w ? buildWatchShareUrl(w.id) : "",
    "Offer amount (USD)": offerAmountInput.value.trim(),
    "Reply-to email": offerEmailInput.value.trim(),
    "Message": offerMessageInput.value.trim(),
    "_subject": "New Watch Offer",
    "_captcha": "false",
    "_template": "table",
  };

  offerSubmitBtn.disabled = true;
  offerSubmitBtn.textContent = "Sending…";
  setOfferFormStatus("", null);

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${SOURCE_REQUEST_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed");
    setOfferFormStatus("✅ Offer sent! I'll get back to you at the email you provided.", "success");
    offerForm.reset();
    setTimeout(() => offerModalOverlay.classList.add("hidden"), 2000);
  } catch (err) {
    setOfferFormStatus(`⚠️ Couldn't send automatically. Please email me directly at ${SOURCE_REQUEST_EMAIL}.`, "error");
  } finally {
    offerSubmitBtn.disabled = false;
    offerSubmitBtn.textContent = "Send Offer";
  }
});

// ---- Cart: a "request to purchase" builder, not a real checkout (no backend/payments) ----
function updateCartUI() {
  const n = cart.size;
  cartBtn.innerHTML = n ? `🛒 Cart <span class="cart-badge">${n}</span>` : "🛒 Cart";
}

function openCartModal() {
  cartItemsEl.innerHTML = "";
  const items = watches.filter((w) => cart.has(w.id));
  let total = 0;

  if (items.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty. Open a watch and hit "Add to Cart" to start a purchase request.</p>`;
  } else {
    for (const w of items) {
      const price = Number(w.price) || 0;
      total += price;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <div class="cart-item-name">${escapeHtml(w.brand)} ${escapeHtml(w.model)}</div>
          <div class="cart-item-meta">${[w.ref, w.year].filter(Boolean).map(escapeHtml).join(" · ")}</div>
        </div>
        <div class="cart-item-price">${formatPrice(w.price) || "—"}</div>
        <button type="button" class="cart-item-remove" data-id="${w.id}" aria-label="Remove from cart">✕</button>
      `;
      row.querySelector(".cart-item-remove").addEventListener("click", () => {
        toggleCart(w.id);
        updateCartUI();
        openCartModal();
      });
      cartItemsEl.appendChild(row);
    }
  }

  cartTotalEl.textContent = items.length ? `Total: ${total.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} (final price confirmed with me directly)` : "";
  cartForm.classList.toggle("hidden", items.length === 0);
  setCartFormStatus("", null);
  cartModalOverlay.classList.remove("hidden");
}

function setCartFormStatus(message, kind) {
  cartFormStatus.textContent = message;
  cartFormStatus.className = "form-status" + (kind ? ` form-status-${kind}` : "");
  cartFormStatus.classList.toggle("hidden", !message);
}

cartBtn.addEventListener("click", openCartModal);
closeCartBtn.addEventListener("click", () => cartModalOverlay.classList.add("hidden"));
cartModalOverlay.addEventListener("click", (e) => {
  if (e.target === cartModalOverlay) cartModalOverlay.classList.add("hidden");
});
cartClearBtn.addEventListener("click", () => {
  cart.clear();
  saveCart();
  updateCartUI();
  openCartModal();
});

cartForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const items = watches.filter((w) => cart.has(w.id));
  if (items.length === 0) return;
  const listText = items
    .map((w) => `${w.brand} ${w.model}${w.ref ? " (" + w.ref + ")" : ""} — ${formatPrice(w.price) || "price TBD"} — ${buildWatchShareUrl(w.id)}`)
    .join("\n");
  const total = items.reduce((sum, w) => sum + (Number(w.price) || 0), 0);

  const payload = {
    "Items": listText,
    "Total (USD)": total,
    "Preferred payment": cartPaymentSelect.value,
    "Reply-to email": cartEmailInput.value.trim(),
    "Message": cartMessageInput.value.trim(),
    "_subject": "New Purchase Request",
    "_captcha": "false",
    "_template": "table",
  };

  cartSubmitBtn.disabled = true;
  cartSubmitBtn.textContent = "Sending…";
  setCartFormStatus("", null);

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${SOURCE_REQUEST_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed");
    setCartFormStatus("✅ Request sent! I'll follow up at the email you provided to arrange payment & pickup/shipping.", "success");
    cart.clear();
    saveCart();
    updateCartUI();
    cartForm.reset();
    setTimeout(() => cartModalOverlay.classList.add("hidden"), 2500);
  } catch (err) {
    setCartFormStatus(`⚠️ Couldn't send automatically. Please email me directly at ${SOURCE_REQUEST_EMAIL}.`, "error");
  } finally {
    cartSubmitBtn.disabled = false;
    cartSubmitBtn.textContent = "Request to Purchase";
  }
});

// ---- Trade In: real photo attachments need a native multipart form submit (not AJAX), so
// this one actually navigates to FormSubmit and back via the hidden _next field. ----
tradeInBtn.addEventListener("click", () => {
  const url = new URL(location.href);
  url.hash = "";
  url.searchParams.set("tradein", "sent");
  tradeInNextInput.value = url.toString();
  tradeInModalOverlay.classList.remove("hidden");
});
closeTradeInBtn.addEventListener("click", () => tradeInModalOverlay.classList.add("hidden"));
tradeInCancelBtn.addEventListener("click", () => tradeInModalOverlay.classList.add("hidden"));
tradeInModalOverlay.addEventListener("click", (e) => {
  if (e.target === tradeInModalOverlay) tradeInModalOverlay.classList.add("hidden");
});

dismissTradeInBanner.addEventListener("click", () => tradeInBanner.classList.add("hidden"));

(function checkTradeInBannerFromUrl() {
  const params = new URLSearchParams(location.search);
  if (params.get("tradein") === "sent") {
    tradeInBanner.classList.remove("hidden");
    params.delete("tradein");
    const cleanUrl = location.pathname + (params.toString() ? "?" + params.toString() : "") + location.hash;
    history.replaceState(null, "", cleanUrl);
  }
})();

// ---- Source a Watch form: sends straight to email via FormSubmit (no backend needed) ----
function setSourceFormStatus(message, kind) {
  sourceFormStatus.textContent = message;
  sourceFormStatus.className = "form-status" + (kind ? ` form-status-${kind}` : "");
  if (!message) sourceFormStatus.classList.add("hidden");
}

sourceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    "Model / Brand": document.getElementById("sourceModelInput").value.trim(),
    "Box preference": document.getElementById("sourceBoxSelect").value,
    "Papers preference": document.getElementById("sourcePapersSelect").value,
    "Price range": document.getElementById("sourcePriceSelect").value,
    "Reply-to email": document.getElementById("sourceEmailInput").value.trim(),
    "Additional details": document.getElementById("sourceDetailsInput").value.trim(),
    "_subject": "New Watch Sourcing Request",
    "_captcha": "false",
    "_template": "table",
  };

  sourceSubmitBtn.disabled = true;
  sourceSubmitBtn.textContent = "Sending…";
  setSourceFormStatus("", null);

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${SOURCE_REQUEST_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed");
    setSourceFormStatus("✅ Sent! I'll get back to you at the email you provided.", "success");
    sourceForm.reset();
    setTimeout(() => sourceModalOverlay.classList.add("hidden"), 2000);
  } catch (err) {
    setSourceFormStatus(
      `⚠️ Couldn't send automatically. Please email me directly at ${SOURCE_REQUEST_EMAIL}.`,
      "error"
    );
  } finally {
    sourceSubmitBtn.disabled = false;
    sourceSubmitBtn.textContent = "Send Request";
  }
});

// ---- Events ----
addBtn.addEventListener("click", () => {
  if (!isOwner) return;
  openAddModal();
});
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!modalOverlay.classList.contains("hidden")) closeModal();
  for (const overlay of simpleOverlays) {
    if (!overlay.classList.contains("hidden")) overlay.classList.add("hidden");
  }
});

imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files || []);
  if (!files.length) return;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = () => {
      currentImages.push(reader.result);
      renderImageGalleryEdit();
    };
    reader.readAsDataURL(file);
  }
  imageInput.value = "";
});

watchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isOwner) return;
  const id = watchIdInput.value;
  const data = {
    brand: brandInput.value.trim(),
    model: modelInput.value.trim(),
    ref: refInput.value.trim(),
    year: yearInput.value.trim(),
    box: boxSelect.value,
    papers: papersSelect.value,
    condition: conditionSelect.value,
    price: priceInput.value.trim(),
    saleStatus: saleStatusSelect.value,
    notes: notesInput.value.trim(),
    images: currentImages.slice(),
  };

  if (id) {
    const w = watches.find((x) => x.id === id);
    Object.assign(w, data);
  } else {
    watches.push({ id: crypto.randomUUID(), dateAdded: Date.now(), ...data });
  }
  saveWatches();
  closeModal();
  render();
});

deleteBtn.addEventListener("click", () => {
  if (!isOwner) return;
  const id = watchIdInput.value;
  if (!id) return;
  if (!confirm("Delete this watch from your collection?")) return;
  watches = watches.filter((w) => w.id !== id);
  saveWatches();
  closeModal();
  render();
});

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);
filterBox.addEventListener("change", render);
filterPapers.addEventListener("change", render);
filterSaleStatus.addEventListener("change", render);
filterPriceRange.addEventListener("change", render);
filterCondition.addEventListener("change", render);

favoritesToggleBtn.addEventListener("click", () => {
  showFavoritesOnly = !showFavoritesOnly;
  favoritesToggleBtn.textContent = showFavoritesOnly ? "❤️ Favorites" : "🤍 Favorites";
  favoritesToggleBtn.classList.toggle("is-active", showFavoritesOnly);
  render();
});

soldArchiveBtn.addEventListener("click", () => {
  filterSaleStatus.value = filterSaleStatus.value === "Sold" ? "" : "Sold";
  render();
});

menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown.classList.toggle("hidden");
});
document.addEventListener("click", () => menuDropdown.classList.add("hidden"));

themeBtn.addEventListener("click", toggleTheme);

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(watches, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `watch-collection-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", () => {
  if (!isOwner) return;
  const file = importInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Invalid file");
      const merge = confirm(
        `Import ${imported.length} watch(es)?\n\nOK = merge with existing collection\nCancel = replace existing collection entirely`
      );
      if (merge) {
        const existingIds = new Set(watches.map((w) => w.id));
        for (const w of imported) {
          if (!w.id || existingIds.has(w.id)) w.id = crypto.randomUUID();
          if (!w.dateAdded) w.dateAdded = Date.now();
          watches.push(w);
        }
      } else {
        watches = imported;
      }
      saveWatches();
      render();
    } catch (err) {
      alert("Could not import file: " + err.message);
    }
    importInput.value = "";
  };
  reader.readAsText(file);
});

// ---- Owner mode (client-side gate for Add/Edit/Delete/Import — see OWNER_PASSCODE above) ----
function updateOwnerUI() {
  addBtn.classList.toggle("hidden", !isOwner);
  importLabel.classList.toggle("hidden", !isOwner);
  editTextBtn.classList.toggle("hidden", !isOwner);
  ownerToggleBtn.textContent = isOwner ? "🔓 Log Out (Owner)" : "🔐 Owner Login";
  render();
}

ownerToggleBtn.addEventListener("click", () => {
  menuDropdown.classList.add("hidden");
  if (isOwner) {
    isOwner = false;
    localStorage.removeItem(OWNER_KEY);
    updateOwnerUI();
    return;
  }
  const input = prompt("Enter owner passphrase:");
  if (input === null) return;
  if (input === OWNER_PASSCODE) {
    isOwner = true;
    localStorage.setItem(OWNER_KEY, "true");
    updateOwnerUI();
    alert("Owner mode enabled. Add/Edit/Delete/Import are now visible on this device.");
  } else {
    alert("Incorrect passphrase.");
  }
});

// ---- Init ----
initTheme();
applyContent();
updateOwnerUI();
updateCartUI();

// Shareable listing links: #watch=<id> opens straight to that watch's detail view.
(function openSharedWatchFromUrl() {
  const match = location.hash.match(/^#watch=(.+)$/);
  if (!match) return;
  const id = decodeURIComponent(match[1]);
  if (watches.some((w) => w.id === id)) openViewModal(id);
})();

// Mobile: the filter dropdowns collapse behind a "Filters" button (CSS hides the button on desktop).
(() => {
  const btn = document.getElementById("filtersToggleBtn");
  const group = document.getElementById("filterGroup");
  if (!btn || !group) return;
  btn.addEventListener("click", () => {
    const open = group.classList.toggle("is-open");
    btn.classList.toggle("is-active", open);
    btn.setAttribute("aria-expanded", String(open));
  });
})();
