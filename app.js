const WHATSAPP_NUMBER = "972542283054";

const PRODUCTS = [
  { id:"moisture_oily", name:"קרם לחות מאזן לעור שמן מעורב", price:150, desc:"לחות מאוזנת ללא כבדות, מתאים לעור שמן/מעורב.", image:"moisture_oily.jpg" },
  { id:"moisture_dry",  name:"קרם לחות מפיג מתחים לעור יבש",  price:150, desc:"לחות עשירה ומרגיעה לעור יבש ומיובש.", image:"moisture_dry.jpg" },
  { id:"serum_multivit",name:"סרום מולטי ויטמין",              price:180, desc:"סרום זוהר להזנה וחידוש מראה העור.", image:"serum_multivit.jpg" },
  { id:"spf",           name:"מקדם הגנה",                      price:125, desc:"הגנה יומיומית חיונית לשמירה על העור.", image:"spf.jpg" },
  { id:"eye_mask",      name:"מסכת עיניים אנטי אייג׳ינג",     price:180, desc:"מראה רענן סביב העיניים.", image:"eye_mask.jpg" },
  { id:"acid_cleanser", name:"סבון חומצות לעור שמן מעורב",     price:125, desc:"ניקוי עמוק ועדין לעור שמן/מעורב.", image:"acid_cleanser.jpg" },
  { id:"foam_cleanser", name:"סבון קצף לעור רגיל יבש",         price:110, desc:"ניקוי נעים שאינו מייבש.", image:"foam_cleanser.jpg" }
];

const $ = (id) => document.getElementById(id);

const state = {
  search: "",
  cart: {} // { productId: qty }
};

function formatILS(n){
  return "₪" + n.toLocaleString("he-IL");
}

function getFilteredProducts(){
  const q = (state.search || "").trim().toLowerCase();
  if(!q) return PRODUCTS;
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.desc || "").toLowerCase().includes(q)
  );
}

function cartQty(id){
  return state.cart[id] || 0;
}

function setQty(id, qty){
  if(qty <= 0) delete state.cart[id];
  else state.cart[id] = qty;
  renderProducts();
  renderCart();
}

function subtotal(){
  let total = 0;
  for(const [id, qty] of Object.entries(state.cart)){
    const p = PRODUCTS.find(x => x.id === id);
    if(p) total += p.price * qty;
  }
  return total;
}

function renderProducts(){
  const box = $("products");
  if(!box) return;

  box.innerHTML = "";
  const list = getFilteredProducts();

  list.forEach(p => {
    const qty = cartQty(p.id);

    const el = document.createElement("div");
    el.className = "p";
    el.innerHTML = `
      <img src="${p.image}" class="pImgReal" alt="${p.name}" onerror="this.style.display='none'">
      <div class="pLeft">
        <p class="pTitle">${p.name}</p>
        <p class="pDesc">${p.desc || ""}</p>
      </div>
      <div class="price">${formatILS(p.price)}</div>
      <div class="qty">
        <button type="button" data-act="dec" data-id="${p.id}">−</button>
        <span>${qty}</span>
        <button type="button" data-act="inc" data-id="${p.id}">+</button>
      </div>
    `;
    box.appendChild(el);
  });

  box.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const act = btn.getAttribute("data-act");
      const current = cartQty(id);
      if(act === "inc") setQty(id, current + 1);
      if(act === "dec") setQty(id, current - 1);
    });
  });
}

function renderCart(){
  const cartBox = $("cart");
  const totalEl = $("total");
  if(!cartBox || !totalEl) return;

  cartBox.innerHTML = "";
  const entries = Object.entries(state.cart);

  if(entries.length === 0){
    cartBox.innerHTML = `<p class="fineprint" style="margin:0">הסל ריק</p>`;
    totalEl.textContent = formatILS(0);
    return;
  }

  entries.forEach(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if(!p) return;

    const row = document.createElement("div");
    row.className = "cartItem";
    row.innerHTML = `
      <div>
        <strong>${p.name}</strong><br>
        <small>${formatILS(p.price)} × ${qty}</small>
      </div>
      <div style="text-align:left">
        <strong>${formatILS(p.price * qty)}</strong>
      </div>
    `;
    cartBox.appendChild(row);
  });

  totalEl.textContent = formatILS(subtotal());
}

function buildWhatsAppMessage(){
  const name = ($("customerName")?.value || "").trim();
  const phone = ($("customerPhone")?.value || "").trim();
  const notes = ($("notes")?.value || "").trim();

  const lines = [];
  lines.push("היי BarNis 👋");
  lines.push("אני רוצה לבצע הזמנה (איסוף מהקליניקה – מודיעין):");
  lines.push("");

  if(name) lines.push(`שם: ${name}`);
  if(phone) lines.push(`טלפון: ${phone}`);

  lines.push("");
  lines.push("מוצרים:");
  for(const [id, qty] of Object.entries(state.cart)){
    const p = PRODUCTS.find(x => x.id === id);
    if(!p) continue;
    lines.push(`• ${p.name} × ${qty} (${formatILS(p.price * qty)})`);
  }

  lines.push("");
  lines.push(`סה״כ: ${formatILS(subtotal())}`);

  if(notes){
    lines.push("");
    lines.push(`הערות: ${notes}`);
  }

  lines.push("");
  lines.push("תודה! 😊");

  return lines.join("\n");
}

function setupSearch(){
  const s = $("search");
  if(!s) return;
  s.addEventListener("input", (e) => {
    state.search = e.target.value || "";
    renderProducts();
  });
}

function setupSend(){
  const btn = $("sendWA");
  if(!btn) return;

  btn.addEventListener("click", () => {
    if(Object.keys(state.cart).length === 0){
      alert("הסל ריק — הוסיפי לפחות מוצר אחד 🙂");
      return;
    }
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupSend();
  renderProducts();
  renderCart();
});
