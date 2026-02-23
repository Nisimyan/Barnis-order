const WHATSAPP_NUMBER = "972542283054";

const FEATURED_ID = "serum_multivit";

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
  cart: {}
};

function formatILS(n){
  return "₪" + n.toLocaleString("he-IL");
}

function cartQty(id){
  return state.cart[id] || 0;
}

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

function renderProducts(){
  const box = document.getElementById("products");
  box.innerHTML = "";

  PRODUCTS.forEach(p => {
    const qty = cartQty(p.id);

    const el = document.createElement("div");
    el.className = "p";

    el.innerHTML = `
      <div class="pTop">
        <img src="${p.image}" class="pImgReal" alt="${p.name}">
        <div style="flex:1">
          <p class="pTitle">${p.name}${p.id === FEATURED_ID ? ' <span class="muted">• מומלץ</span>' : ''}</p>
          <p class="pDesc">${p.desc}</p>
        </div>
      </div>

      <div class="pBottom">
        <div class="price">${formatILS(p.price)}</div>
        <div class="qty">
          <button onclick="setQty('${p.id}', ${qty-1})">−</button>
          <span>${qty}</span>
          <button onclick="setQty('${p.id}', ${qty+1})">+</button>
        </div>
      </div>
    `;

    box.appendChild(el);
  });

  renderCart();
}

function renderCart(){
  const cartBox = document.getElementById("cart");
  cartBox.innerHTML = "";

  const entries = Object.entries(state.cart);

  if(entries.length === 0){
    cartBox.innerHTML = `<p class="muted">הסל ריק</p>`;
  }

  entries.forEach(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    const row = document.createElement("div");
    row.className = "cartItem";
    row.innerHTML = `
      <div>
        <strong>${p.name}</strong><br>
        <small>${formatILS(p.price)} × ${qty}</small>
      </div>
      <div><strong>${formatILS(p.price * qty)}</strong></div>
    `;
    cartBox.appendChild(row);
  });

  document.getElementById("total").textContent = formatILS(subtotal());
}

function sendWA(){
  if(Object.keys(state.cart).length === 0){
    alert("הסל ריק");
    return;
  }

  let message = "היי BarNis 👋%0Aאני רוצה לבצע הזמנה:%0A%0A";

  for(const [id, qty] of Object.entries(state.cart)){
    const p = PRODUCTS.find(x => x.id === id);
    message += `• ${p.name} × ${qty} (%E2%82%AA${p.price * qty})%0A`;
  }

  message += `%0Aסה״כ: %E2%82%AA${subtotal()}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}

function renderAll(){
  renderProducts();
}

document.addEventListener("DOMContentLoaded", renderAll);
