/* ================ Ajustes rápidos ================== */
// Cambiá por tu número de WhatsApp en formato internacional sin signos:
const WHATSAPP_NUMBER = "54911xxxxxxxx"; // ej: 54911 12345678

// Moneda y formato
const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

/* ================ Catálogo (demo) ================== */
const products = [
  {
    id: "air-legend",
    name: "Air Legend 1 Retro",
    brand: "Nike",
    category: "Urbano",
    price: 149999,
    sizes: [38,39,40,41,42,43,44],
    img: "nike.jfif"
  },
  {
    id: "ultra-boost",
    name: "Ultra Boost 22",
    brand: "Adidas",
    category: "Running",
    price: 164999,
    sizes: [39,40,41,42,43,44],
    img: "adidas1.jfif"
  },
  {
    id: "old-skool",
    name: "Fila",
    brand: "Fila",
    category: "Skate",
    price: 89999,
    sizes: [38,39,40,41,42,43],
    img: "fila.jfif"
  },
  {
    id: "rs-x",
    name: "Lotto",
    brand: "Lotto",
    category: "Urbano",
    price: 119999,
    sizes: [39,40,41,42],
    img: "lotto.jfif"
  },
  {
    id: "nb-574",
    name: "Converse",
    brand: "Converse",
    category: "Lifestyle",
    price: 134999,
    sizes: [38,39,40,41,42,43,44],
    img: "converse.jfif"
  },
  {
    id: "forum-low",
    name: "Forum Low",
    brand: "Adidas",
    category: "Urbano",
    price: 109999,
    sizes: [38,39,40,41,42,43,44],
    img: "adidas2.jfif"
  }
];

/* ================ Estado ================== */
const state = {
  cart: JSON.parse(localStorage.getItem("cart") || "[]"),
  filters: { search: "", category: "all", brand: "all", size: "any", sort: "relevance" },
};

/* ================ Helpers ================== */
const $ = (q) => document.querySelector(q);
const grid = $("#grid");
const brandChips = $("#brandChips");
const categorySelect = $("#categorySelect");
const sizeSelect = $("#sizeSelect");
const sortSelect = $("#sortSelect");
const searchInput = $("#searchInput");
const cartBtn = $("#cartBtn");
const cartDrawer = $("#cartDrawer");
const drawerBackdrop = $("#drawerBackdrop");
const closeDrawer = $("#closeDrawer");
const cartItems = $("#cartItems");
const subtotalEl = $("#subtotal");
const totalEl = $("#total");
const discountEl = $("#discount");
const shippingSelect = $("#shippingSelect");
const payWhatsapp = $("#payWhatsapp");
const payCard = $("#payCard");
const cartCount = $("#cartCount");
const cardModal = $("#cardModal");
const closeCard = $("#closeCard");
const cardForm = $("#cardForm");

$("#year").textContent = new Date().getFullYear();

/* ================ Inicialización UI ================== */
function initFilters() {
  // categorías
  const categories = ["all", ...new Set(products.map(p => p.category))];
  categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c === "all" ? "Todas las categorías" : c}</option>`).join("");

  // marcas
  const brands = ["all", ...new Set(products.map(p => p.brand))];
  brandChips.innerHTML = brands.map(b => `<button class="chip ${b==="all"?"chip--active":""}" data-brand="${b}">${b==="all"?"Todas":b}</button>`).join("");
}

function renderProducts() {
  const { search, category, brand, size, sort } = state.filters;
  let list = products.filter(p => {
    const t = (p.name + " " + p.brand).toLowerCase();
    const okSearch = t.includes(search.toLowerCase());
    const okCategory = category === "all" || p.category === category;
    const okBrand = brand === "all" || p.brand === brand;
    const okSize = size === "any" || p.sizes.includes(Number(size));
    return okSearch && okCategory && okBrand && okSize;
  });

  if (sort === "priceAsc") list.sort((a,b)=>a.price-b.price);
  if (sort === "priceDesc") list.sort((a,b)=>b.price-a.price);
  if (sort === "nameAsc") list.sort((a,b)=>a.name.localeCompare(b.name));

  grid.innerHTML = list.map(renderCard).join("");
}
function renderCard(p) {
  const sizes = p.sizes.map(s => `<button class="size" data-size="${s}" data-id="${p.id}">${s}</button>`).join("");
  return `
  <article class="card">
    <div class="card__img" style="background-image:url('${p.img}');"></div>
    <div class="card__body">
      <h3 class="card__title">${p.name}</h3>
      <div class="card__meta">
        <span>${p.brand} · ${p.category}</span>
        <span class="price">${currency.format(p.price)}</span>
      </div>
      <div class="sizes" data-id="${p.id}">
        ${sizes}
      </div>
      <div class="card__footer">
        <div class="qty">
          <label class="muted" for="qty-${p.id}">Cant.</label>
          <input id="qty-${p.id}" type="number" min="1" value="1" />
        </div>
        <button class="btn btn--primary" data-add="${p.id}">Agregar</button>
      </div>
    </div>
  </article>`;
}

/* ================ Carrito ================== */
function saveCart(){ localStorage.setItem("cart", JSON.stringify(state.cart)); }
function recalc() {
  const subtotal = state.cart.reduce((acc,i)=>acc + (i.price * i.qty),0);
  const shipping = shippingSelect.value === "express" ? 6500 : shippingSelect.value === "standard" ? 4000 : 0;
  const discount = subtotal >= 300000 ? Math.round(subtotal * 0.05) : 0; // 5% por compras grandes
  const total = subtotal + shipping - discount;

  subtotalEl.textContent = currency.format(subtotal);
  discountEl.textContent = "-" + currency.format(discount);
  totalEl.textContent = currency.format(total);
  cartCount.textContent = state.cart.reduce((a,i)=>a+i.qty,0);
}
function renderCart() {
  if (state.cart.length === 0) {
    cartItems.innerHTML = `<p class="hint">Tu carrito está vacío.</p>`;
    recalc();
    return;
  }
  cartItems.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" />
      <div>
        <h4>${item.name}</h4>
        <div class="muted">Talle ${item.size} · ${currency.format(item.price)}</div>
        <div class="qty" style="margin-top:6px">
          <button class="btn btn--ghost" data-dec="${item.id}|${item.size}">−</button>
          <span>${item.qty}</span>
          <button class="btn btn--ghost" data-inc="${item.id}|${item.size}">+</button>
        </div>
      </div>
      <button class="btn btn--danger" data-del="${item.id}|${item.size}">Eliminar</button>
    </div>
  `).join("");
  recalc();
}

function addToCart(id, size, qty=1){
  const p = products.find(x => x.id === id);
  if (!p || !size) return alert("Elegí un talle antes de agregar 😉");
  const key = `${id}|${size}`;
  const found = state.cart.find(i => (i.id+"|"+i.size)===key);
  if (found) found.qty += qty;
  else state.cart.push({ id, name:p.name, price:p.price, img:p.img, size, qty });
  saveCart(); renderCart();
}

/* ================ WhatsApp Checkout ================== */
function buildWhatsappMessage(){
  const items = state.cart.map(i => `• ${i.name} (Talle ${i.size}) x${i.qty} — ${currency.format(i.price*i.qty)}`).join("%0A");
  const subtotal = state.cart.reduce((acc,i)=>acc+i.price*i.qty,0);
  const shippingLabel = shippingSelect.value === "express" ? "Express" : shippingSelect.value === "standard" ? "Estándar" : "Retiro en local";
  const shippingCost = shippingSelect.value === "express" ? 6500 : shippingSelect.value === "standard" ? 4000 : 0;
  const discount = subtotal >= 300000 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + shippingCost - discount;

  const text =
    `Hola! Quiero hacer este pedido:%0A%0A${items}%0A%0A` +
    `Subtotal: ${currency.format(subtotal)}%0A` +
    `Envío: ${shippingLabel} (${currency.format(shippingCost)})%0A` +
    `Descuento: -${currency.format(discount)}%0A` +
    `Total: ${currency.format(total)}%0A%0A` +
    `Datos:%0ANombre:%0ADirección:%0ALocalidad:%0AMétodo de pago: Tarjeta/Transfer/Contraentrega`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/* ================ Tarjeta (Demo) ================== */
/*
  👉 Para cobro real:
  - Mercado Pago (Argentina): usar Checkout Pro.
    Necesitás crear una "preference" en tu backend y devolver preferenceId.
    Client-side: mp.checkout({ preference: { id: 'PREF_ID' }, theme: {...} });
    Docs: https://www.mercadopago.com.ar/developers/es (requiere backend).

  - Stripe Checkout: redirección segura a stripe.com con tu sessionId (también requiere backend).

  Este modal es sólo demostrativo para flujo/UX.
*/
function validateCard(number){
  // Luhn simple
  const digits = (number.replace(/\s+/g,"")).split("").reverse().map(Number);
  const sum = digits.reduce((acc,d,i)=> acc + (i%2 ? ((d*=2)>9?d-9:d) : d), 0);
  return sum % 10 === 0;
}

/* ================ Eventos ================== */
document.addEventListener("click", (e)=>{
  const b = e.target;

  // seleccionar talle
  if (b.classList.contains("size")) {
    const id = b.dataset.id;
    b.parentElement.querySelectorAll(".size").forEach(x=>x.classList.remove("size--active"));
    b.classList.add("size--active");
    b.parentElement.dataset.size = b.dataset.size;
  }

  // agregar al carrito
  if (b.dataset.add){
    const id = b.dataset.add;
    const wrap = b.closest(".card__body").querySelector(".sizes");
    const size = wrap.dataset.size;
    const qty = Math.max(1, parseInt(document.getElementById(`qty-${id}`).value || "1", 10));
    addToCart(id, size, qty);
    openDrawer();
  }

  // drawer
  if (b === cartBtn){ openDrawer(); }
  if (b === closeDrawer || b === $("#drawerBackdrop")){ closeDrawerFn(); }

  // cart actions
  if (b.dataset.inc){ const [id,size] = b.dataset.inc.split("|"); const item = state.cart.find(i=>i.id===id && i.size==size); if(item){ item.qty++; saveCart(); renderCart(); } }
  if (b.dataset.dec){ const [id,size] = b.dataset.dec.split("|"); const item = state.cart.find(i=>i.id===id && i.size==size); if(item){ item.qty = Math.max(1, item.qty-1); saveCart(); renderCart(); } }
  if (b.dataset.del){ const [id,size] = b.dataset.del.split("|"); state.cart = state.cart.filter(i=>!(i.id===id && i.size==size)); saveCart(); renderCart(); }

  // pago
  if (b === payWhatsapp){
    if (state.cart.length === 0) return alert("Tu carrito está vacío.");
    window.open(buildWhatsappMessage(), "_blank");
  }
  if (b === payCard){
    if (state.cart.length === 0) return alert("Tu carrito está vacío.");
    openCard();
  }

  // modal tarjeta
  if (b === closeCard || b === $(".modal__backdrop")) closeCardFn();
});

function openDrawer(){ cartDrawer.setAttribute("aria-hidden","false"); renderCart(); }
function closeDrawerFn(){ cartDrawer.setAttribute("aria-hidden","true"); }
drawerBackdrop.addEventListener("click", closeDrawerFn);

shippingSelect.addEventListener("change", recalc);

searchInput.addEventListener("input", (e)=>{ state.filters.search = e.target.value; renderProducts(); });
categorySelect.addEventListener("change", (e)=>{ state.filters.category = e.target.value; renderProducts(); });
sizeSelect.addEventListener("change", (e)=>{ state.filters.size = e.target.value; renderProducts(); });
sortSelect.addEventListener("change", (e)=>{ state.filters.sort = e.target.value; renderProducts(); });
brandChips.addEventListener("click", (e)=>{
  const btn = e.target.closest(".chip"); if(!btn) return;
  brandChips.querySelectorAll(".chip").forEach(c=>c.classList.remove("chip--active"));
  btn.classList.add("chip--active");
  state.filters.brand = btn.dataset.brand;
  renderProducts();
});

// modal tarjeta
function openCard(){ cardModal.setAttribute("aria-hidden","false"); }
function closeCardFn(){ cardModal.setAttribute("aria-hidden","true"); }

cardForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(cardForm).entries());
  if (!validateCard(data.cardNumber)) return alert("Número de tarjeta inválido (Luhn).");

  // Simulación de pago OK
  alert("¡Pago aprobado! 🎉\nGracias por tu compra.");
  state.cart = [];
  saveCart();
  renderCart();
  closeCardFn();
  closeDrawerFn();
});

/* ================ Start ================== */
initFilters();
renderProducts();
renderCart();

document.addEventListener("change", (e)=>{
  // formateo live de número de tarjeta (XXXX XXXX XXXX XXXX)
  if (e.target.name === "cardNumber") {
    e.target.value = e.target.value.replace(/\D/g,"").slice(0,19).replace(/(\d{4})(?=\d)/g,"$1 ").trim();
  }
});
