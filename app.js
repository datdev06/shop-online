// ====== Cấu hình ======
const STORE_KEY = "cart_items_v2";
const CURRENCY = "đ";

// Demo sản phẩm
const PRODUCTS = [
  { id: "machdien-001", title: "Mạch điện", price: 100000, image: "https://via.placeholder.com/640x400?text=Mach+dien", category: "Đồ Điện" },
  { id: "pin-du-phong-400", title: "Pin dự phòng 20.000mAh", price: 400000, image: "https://via.placeholder.com/640x400?text=Pin+du+phong+20k+mAh", category: "Pin" },
  { id: "pin-aa", title: "Pin AA 2 viên", price: 20000, image: "https://via.placeholder.com/640x400?text=Pin+AA", category: "Pin" },
  { id: "pin-du-phong-200", title: "Pin dự phòng 10.000mAh", price: 200000, image: "https://via.placeholder.com/640x400?text=Pin+du+phong+10k+mAh", category: "Pin" },
  { id: "arduino", title: "Mạch Arduino", price: 150000, image: "https://via.placeholder.com/640x400?text=Arduino", category: "⚡ Mạch điện" },
  { id: "raspberry", title: "Mạch Raspberry Pi", price: 300000, image: "https://via.placeholder.com/640x400?text=Raspberry+Pi", category: "⚡ Mạch điện" },
];

// ====== Helpers ======
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmt = (n) => (n || 0).toLocaleString("vi-VN") + CURRENCY;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCart(items) { localStorage.setItem(STORE_KEY, JSON.stringify(items)); }
function findProduct(id) { return PRODUCTS.find(p => p.id === id); }

// ====== Cart logic ======
function addToCart(productId, qty = 1) {
  const items = loadCart();
  const idx = items.findIndex(it => it.id === productId);
  if (idx >= 0) items[idx].qty += qty;
  else {
    const p = findProduct(productId);
    if (!p) return;
    items.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty });
  }
  saveCart(items);
  toast("Đã thêm vào giỏ hàng");
  renderCartCount();
}

function updateQty(productId, qty) {
  const items = loadCart();
  const idx = items.findIndex(it => it.id === productId);
  if (idx >= 0) {
    const val = Math.max(1, Number(qty) || 1);
    items[idx].qty = val;
    saveCart(items);
    renderCart();
    renderCartCount();
  }
}

function removeItem(productId) {
  let items = loadCart();
  items = items.filter(it => it.id !== productId);
  saveCart(items);
  renderCart();
  renderCartCount();
}

function cartTotal() {
  return loadCart().reduce((sum, it) => sum + it.price * it.qty, 0);
}

// ====== UI: Catalog ======
function renderCatalog() {
  const root = document.querySelector("[data-catalog]");
  if (!root) return;

  // Group by category
  const byCat = {};
  for (const p of PRODUCTS) (byCat[p.category] ||= []).push(p);

  root.innerHTML = Object.entries(byCat).map(([cat, list]) => `
    <section class="section">
      <h2 class="section-title">${cat}</h2>
      <div class="grid">
        ${list.map(p => `
          <article class="card">
            <img src="${p.image}" alt="${p.title}">
            <div class="content">
              <h3>${p.title}</h3>
              <div class="price">${fmt(p.price)}</div>
              <button class="btn" data-add="${p.id}">Mua hàng</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");

  root.addEventListener("click", (e) => {
    const id = e.target?.dataset?.add;
    if (id) addToCart(id, 1);
  });
}

// ====== UI: Cart ======
function renderCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (!el) return;
  const count = loadCart().reduce((n, it) => n + it.qty, 0);
  el.textContent = count > 0 ? `(${count})` : "";
}

function renderCart() {
  const tbody = document.querySelector("[data-cart-body]");
  const totalEl = document.querySelector("[data-cart-total]");
  const emptyEl = document.querySelector("[data-cart-empty]");
  if (!tbody || !totalEl || !emptyEl) return;

  const items = loadCart();
  emptyEl.hidden = items.length !== 0;

  tbody.innerHTML = items.map(it => `
    <tr>
      <td>
        <div style="display:flex; gap:10px; align-items:center">
          <img src="${it.image}" alt="${it.title}" style="width:56px;height:40px;object-fit:cover;border-radius:6px">
          <div>
            <div>${it.title}</div>
            <div class="mono" style="font-size:12px;color:var(--muted)">${it.id}</div>
          </div>
        </div>
      </td>
      <td>${fmt(it.price)}</td>
      <td>
        <div class="qty">
          <input type="number" min="1" value="${it.qty}" data-qty="${it.id}" aria-label="Số lượng ${it.title}">
        </div>
      </td>
      <td>${fmt(it.price * it.qty)}</td>
      <td><button class="btn secondary" data-remove="${it.id}">Xóa</button></td>
    </tr>
  `).join("");

  totalEl.textContent = fmt(cartTotal());

  tbody.addEventListener("change", (e) => {
    const id = e.target?.dataset?.qty;
    if (id) updateQty(id, e.target.value);
  });
  tbody.addEventListener("click", (e) => {
    const id = e.target?.dataset?.remove;
    if (id) removeItem(id);
  });
}

// ====== Form xử lý ======
function handleOrderSubmit(e) {
  e.preventDefault();
  const items = loadCart();
  if (!items.length) return toast("Giỏ hàng đang trống.");

  const name = document.querySelector("#name")?.value?.trim();
  const address = document.querySelector("#address")?.value?.trim();
  const phone = document.querySelector("#phone")?.value?.trim();

  let valid = true;
  const setErr = (sel, msg) => { const el = document.querySelector(sel); if (el) el.textContent = msg || ""; };

  // Validate
  if (!name) { setErr('[data-err-name]', 'Vui lòng nhập họ tên.'); valid = false; } else setErr('[data-err-name]');
  if (!address) { setErr('[data-err-address]', 'Vui lòng nhập địa chỉ.'); valid = false; } else setErr('[data-err-address]');
  const phoneOk = /^0\d{9,10}$/.test(phone || ""); // 10–11 số Việt Nam
  if (!phoneOk) { setErr('[data-err-phone]', 'Số điện thoại không hợp lệ.'); valid = false; } else setErr('[data-err-phone]');

  if (!valid) { toast("Vui lòng kiểm tra thông tin"); return; }

  const summary = items.map(it => `${it.title} x${it.qty} = ${fmt(it.price * it.qty)}`).join("\n");
  alert(`Đặt hàng thành công!\n\nKhách: ${name}\nSĐT: ${phone}\nĐ/c: ${address}\n\nĐơn hàng:\n${summary}\n\nTổng: ${fmt(cartTotal())}`);

  saveCart([]);
  renderCart();
  renderCartCount();
  e.target.reset();
}

// ====== Tiny toast ======
let toastTimer;
function toast(msg = "Xong") {
  let bar = document.getElementById("_toast");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "_toast";
    Object.assign(bar.style, {
      position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)",
      background: "#111", color: "#fff", padding: "10px 14px", borderRadius: "10px",
      boxShadow: "0 8px 24px rgba(0,0,0,.2)", zIndex: 9999
    });
    document.body.appendChild(bar);
  }
  bar.textContent = msg;
  bar.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { bar.style.opacity = "0"; }, 1500);
}

// ====== Init ======
document.addEventListener("DOMContentLoaded", () => {
  renderCartCount();
  if (document.querySelector("[data-catalog]")) renderCatalog();
  if (document.querySelector("[data-cart]")) {
    renderCart();
    const form = document.getElementById("order-form");
    if (form) form.addEventListener("submit", handleOrderSubmit);
  }
});
