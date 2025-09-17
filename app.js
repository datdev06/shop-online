// ---- Data ----
const PRODUCTS = [
  {id:'pb-10k', name:'Pin sạc 10,000mAh PD18W', price:299000, cat:'powerbank', img:'https://images.unsplash.com/photo-1609592424804-7c4c0077fbee?q=80&w=1200&auto=format&fit=crop'},
  {id:'pb-20k', name:'Pin sạc 20,000mAh PD22.5W', price:449000, cat:'powerbank', img:'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop'},
  {id:'usb-c-1m', name:'Cáp USB‑C 1m 60W', price:69000, cat:'cable', img:'https://images.unsplash.com/photo-1564732005956-20420ebdab60?q=80&w=1200&auto=format&fit=crop'},
  {id:'usb-c-gan', name:'Sạc GaN 33W USB‑C', price:199000, cat:'cable', img:'https://images.unsplash.com/photo-1618424181497-157f25b6ddd1?q=80&w=1200&auto=format&fit=crop'},
  {id:'esp32', name:'Module ESP32 Wi‑Fi BLE', price:89000, cat:'module', img:'https://images.unsplash.com/photo-1586243287218-8b68a5893b67?q=80&w=1200&auto=format&fit=crop'},
  {id:'tp4056', name:'Mạch sạc TP4056 bảo vệ', price:25000, cat:'module', img:'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop'},
  {id:'case-pb', name:'Vỏ case pin sạc 2 cell 21700', price:59000, cat:'accessory', img:'https://images.unsplash.com/photo-1585386959984-a41552231656?q=80&w=1200&auto=format&fit=crop'},
  {id:'box-parts', name:'Hộp linh kiện 10 ngăn', price:39000, cat:'accessory', img:'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=1200&auto=format&fit=crop'}
];

const fmt = n => n.toLocaleString('vi-VN') + '₫';
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function getCart(){
  try { return JSON.parse(localStorage.getItem('cart_v1')||'{}'); } catch { return {}; }
}
function setCart(cart){
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const cart = getCart();
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  $$('#cart-count').forEach(el => el.textContent = count);
}

function mountFeatured(){
  const wrap = document.getElementById('featured-grid');
  if(!wrap) return;
  const featured = PRODUCTS.slice(0, 4);
  wrap.innerHTML = featured.map(Card).join('');
  bindCardButtons();
}

function mountCatalog(){
  const wrap = document.getElementById('catalog-grid');
  if(!wrap) return;
  const q = $('#q'), cat = $('#cat');
  function render(){
    const term = (q.value||'').toLowerCase();
    const cate = cat.value;
    const items = PRODUCTS.filter(p => {
      const okCat = !cate || p.cat === cate;
      const okTerm = !term || p.name.toLowerCase().includes(term);
      return okCat && okTerm;
    });
    wrap.innerHTML = items.map(Card).join('');
    bindCardButtons();
  }
  q && q.addEventListener('input', render);
  cat && cat.addEventListener('change', render);
  render();
}

function Card(p){
  return `
  <article class="card">
    <div class="thumb"><img src="${p.img}" alt="${p.name}"/></div>
    <div class="body">
      <div class="title">${p.name}</div>
      <div class="row">
        <div class="muted">${p.cat}</div>
        <div class="price">${fmt(p.price)}</div>
      </div>
      <button class="btn add" data-id="${p.id}">Thêm vào giỏ</button>
    </div>
  </article>`;
}
function bindCardButtons(){
  $$('.add').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const cart = getCart();
      cart[id] = (cart[id]||0) + 1;
      setCart(cart);
      btn.textContent = 'Đã thêm ✓';
      setTimeout(()=> btn.textContent='Thêm vào giỏ', 900);
    });
  });
}

function mountCart(){
  const tbody = document.getElementById('cart-rows');
  if(!tbody) return;
  const empty = document.getElementById('cart-empty');
  const table = document.getElementById('cart-table-wrap');
  const totalEl = document.getElementById('cart-total');
  const btnClear = document.getElementById('clear-cart');
  const btnCheckout = document.getElementById('checkout');

  function row(p, qty){
    const sub = p.price * qty;
    return `
    <div class="row" data-id="${p.id}">
      <div class="prod">
        <div class="title">${p.name}</div>
        <div class="muted">${fmt(p.price)}</div>
      </div>
      <div class="right">${fmt(p.price)}</div>
      <div class="center">
        <div class="qty">
          <button class="minus" aria-label="Giảm">−</button>
          <input class="q" type="number" min="1" value="${qty}"/>
          <button class="plus" aria-label="Tăng">+</button>
        </div>
      </div>
      <div class="right sub">${fmt(sub)}</div>
      <div class="right"><button class="btn-ghost remove">✕</button></div>
    </div>`;
  }

  function sync(){
    const cart = getCart();
    const ids = Object.keys(cart);
    if(ids.length === 0){
      empty.classList.remove('hidden');
      table.classList.add('hidden');
      totalEl.textContent = '0₫';
      return;
    }
    empty.classList.add('hidden');
    table.classList.remove('hidden');
    let total = 0;
    tbody.innerHTML = ids.map(id => {
      const p = PRODUCTS.find(x => x.id === id);
      const qty = cart[id];
      total += p.price * qty;
      return row(p, qty);
    }).join('');
    totalEl.textContent = fmt(total);
    bindRows();
  }

  function bindRows(){
    $$('#cart-rows .row').forEach(r => {
      const id = r.dataset.id;
      const q = r.querySelector('.q');
      r.querySelector('.minus').addEventListener('click', () => { q.stepDown(); q.dispatchEvent(new Event('change')); });
      r.querySelector('.plus').addEventListener('click', () => { q.stepUp(); q.dispatchEvent(new Event('change')); });
      r.querySelector('.remove').addEventListener('click', () => {
        const cart = getCart();
        delete cart[id];
        setCart(cart);
        sync();
      });
      q.addEventListener('change', () => {
        let v = Math.max(1, parseInt(q.value || '1', 10));
        const cart = getCart();
        cart[id] = v;
        setCart(cart);
        sync();
      });
    });
  }

  btnClear.addEventListener('click', () => { setCart({}); sync(); });
  btnCheckout.addEventListener('click', () => {
    alert('Đặt hàng tĩnh demo: Chụp ảnh giỏ hàng và liên hệ Zalo/DM để xác nhận.');
  });
  sync();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  mountFeatured();
  mountCatalog();
  mountCart();
});
