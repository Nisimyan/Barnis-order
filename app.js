const WHATSAPP_NUMBER = "972542283054";

// קופונים (אפשר לשנות)
const COUPONS = {
  "WELCOME10": { type: "percent", value: 10 }, // 10% הנחה
  "BARNIS20":  { type: "fixed", value: 20 }    // 20₪ הנחה
};

// 👑 מוצר מומלץ (שימי כאן את ה-id של המוצר שאת רוצה להדגיש)
const FEATURED_ID = "serum_multivit";

// אם תוסיפי תמונות, שימי fileName כאן (למשל "serum.jpg") ותעלי את הקובץ לתיקייה
const PRODUCTS = [
  { id:"moisture_oily", name:"קרם לחות מאזן לעור שמן מעורב", price:150, desc:"לחות מאוזנת ללא כבדות, מתאים לעור שמן/מעורב.", image:null },
  { id:"moisture_dry",  name:"קרם לחות מפיג מתחים לעור יבש",  price:150, desc:"לחות עשירה ומרגיעה לעור יבש ומיובש.", image:null },
  { id:"serum_multivit",name:"סרום מולטי ויטמין",              price:180, desc:"סרום זוהר להזנה וחידוש מראה העור.", image:null },
  { id:"spf",           name:"מקדם הגנה",                      price:125, desc:"הגנה יומיומית חיונית לשמירה על העור.", image:null },
  { id:"eye_mask",      name:"מסכת עיניים אנטי אייג׳ינג",     price:180, desc:"מראה רענן סביב העיניים, מתאים לשגרה ביתית.", image:null },
  { id:"acid_cleanser", name:"סבון חומצות לעור שמן מעורב",     price:125, desc:"ניקוי עמוק ועדין לעור שמן/מעורב.", image:null },
  { id:"foam_cleanser", name:"סבון קצף לעור רגיל יבש",         price:110, desc:"ניקוי נעים שאינו מייבש, לעור רגיל/יבש.", image:null }
];

const $ = (id) => document.getElementById(id);

const state = {
  search: "",
  cart: {}, // { productId: qty }
  coupon: ""
};

function formatILS(n){
  const v = Math.max(0, Math.round(n));
  return "₪" + v.toLocaleString("he-IL");
}

function getFilteredProducts(){
  const q = state.search.trim().toLowerCase();
  if(!q) return PRODUCTS;
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.desc||"").toLowerCase().includes(q)
  );
}

function cartQty(id){ return state.cart[id] || 0; }

function setQty(id, qty){
  if(qty <= 0) delete state.cart[id];
  else state.cart[id] = qty;
  renderAll();
}

function subtotal(){
  let total = 0;
  for(const [id, qty] of Object.entries(state.cart)){
    const p = PRODUCTS.find(x => x.id === id);
    if(p) total += p.price * qty;
  }
  return total;
}

function calcDiscount(sub, couponCode){
  const code = (couponCode || "").trim().toUpperCase();
  if(!code) return 0;
  const c = COUPONS[code];
  if(!c) return 0;

  if(c.type === "percent"){
    return Math.round(sub * (c.value/100));
  }
  if(c.type === "fixed"){
    return Math.min(sub, c.value);
  }
  return 0;
}

function getTotals(){
  const sub = subtotal();
  const disc = calcDiscount(sub, state.coupon);
  const total = Math.max(0, sub - disc);
  return { sub, disc, total };
}

function renderFeatured(){
  const featured = PRODUCTS.find(p => p.id === FEATURED_ID);
  if(featured && $("featuredName")){
    $("featuredName").textContent = featured.name;
  }
}

function productIcon(p){
  if(p.image){
    return `<img src="${p.image}" alt="" class="pImgReal">`;
  }
  // אייקון אותיות: BN
  return `<div class="pImg">BN</div>`;
}

function renderProducts(){
  const box = $("products");
  box.innerHTML = "";
  const list = getFilteredProducts();

  list.forEach(p => {
    const qty = cartQty(p.id);

    const el = document.createElement("div");
    el.className = "p";
    el.innerHTML = `
      <div class="pTop">
        ${productIcon(p)}
        <div style="flex:1">
          <p class="pTitle">${p.name}${p.id === FEATURED_ID ? ' <span class="muted" style="font-weight:700;font-size:12px">• מומלץ</span>' : ''}</p>
          <p class="pDesc">${p.desc || ""}</p>
        </div>
      </div>

      <div class="pBottom">
        <div class="price">${formatILS(p.price)}</div>
        <div class="qty" aria-label="כמות">
          <button type="button" data-act="dec" data-id="${p.id}">−</button>
          <span>${qty}</span>
          <button type="button" data-act="inc" data-id="${p.id}">+</button>
        </div>
      </div>
    `;
    box.appendChild(el);
  });

  box.querySelectorAll("button[data-act]").forEach(btn=>{
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
  cartBox.innerHTML = "";

  const entries = Object.entries(state.cart);
  $("itemsBadge").textContent = `${entries.reduce((a,[,q])=>a+q,0)} פריטים`;

  if(entries.length === 0){
    cartBox.innerHTML = `<p class="muted" style="margin:0">הסל ריק — בחרי מוצרים מהרשימה 🙂</p>`;
  } else {
    entries.forEach(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      if(!p) return;
      const lineTotal = p.price * qty;

      const row = document.createElement("div");
      row.className = "cartItem";
      row.innerHTML = `
        <div>
          <div><strong>${p.name}</strong></div>
          <small>${formatILS(p.price)} × ${qty}</small>
        </div>
        <div style="text-align:left">
          <div><strong>${formatILS(lineTotal)}</strong></div>
          <div class="qty" style="justify-content:flex-end;margin-top:6px">
            <button type="button" data-act="dec" data-id="${id}">−</button>
            <span>${qty}</span>
            <button type="button" data-act="inc" data-id="${id}">+</button>
          </div>
        </div>
      `;
      cartBox.appendChild(row);
    });

    cartBox.querySelectorAll("button[data-act]").forEach(btn=>{
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const act = btn.getAttribute("data-act");
        const current = cartQty(id);
        if(act === "inc") setQty(id, current + 1);
        if(act === "dec") setQty(id, current - 1);
      });
    });
  }

  const { sub, disc, total } = getTotals();
  $("subtotal").textContent = formatILS(sub);
  $("discount").textContent = formatILS(disc);
  $("total").textContent = formatILS(total);
}

function buildWhatsAppMessage(){
  const name = $("customerName").value.trim();
  const phone = $("customerPhone").value.trim();
  const notes = $("notes").value.trim();
  const coupon = $("coupon").value.trim().toUpperCase();

  const { sub, disc, total } = getTotals();

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
  lines.push(`ביניים: ${formatILS(sub)}`);
  if(coupon){
    lines.push(`קופון: ${coupon}`);
    lines.push(`הנחה: ${formatILS(disc)}`);
  }
  lines.push(`סה״כ לתשלום: ${formatILS(total)}`);

  if(notes){
    lines.push("");
    lines.push(`הערות: ${notes}`);
  }

  lines.push("");
  lines.push("תודה! 😊");

  return lines.join("\n");
}

function setupSearch(){
  $("search").addEventListener("input", (e)=>{
    state.search = e.target.value || "";
    renderProducts();
  });
}

function setupCoupon(){
  const c = $("coupon");
  c.addEventListener("input", ()=>{
    state.coupon = c.value || "";
    renderCart();
  });
}

function setupSend(){
  $("sendWA").addEventListener("click", ()=>{
    const hasItems = Object.keys(state.cart).length > 0;
    if(!hasItems){
      alert("הסל ריק — הוסיפי לפחות מוצר אחד 🙂");
      return;
    }

    state.coupon = ($("coupon").value || "");
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    // פותח וואטסאפ ומציג תודה באתר
    window.open(url, "_blank");
    $("thanks").classList.remove("hidden");
  });
}

function renderAll(){
  renderFeatured();
  renderProducts();
  renderCart();
}

function init(){
  renderFeatured();
  setupSearch();
  setupCoupon();
  setupSend();
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
