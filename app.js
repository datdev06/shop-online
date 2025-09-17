/* ===== DỮ LIỆU SẢN PHẨM: chỉnh tên/giá/ảnh theo ý bạn ===== */
const PRODUCTS = [
  { id:'sp-01', name:'Mạch điện cơ bản', price:100000,
    img:'images/mach1.jpg', desc:'Mạch điện nhỏ gọn, dễ sử dụng.' },
  { id:'sp-02', name:'Pin dự phòng 20.000mAh', price:400000,
    img:'images/pin20k.jpg', desc:'Pin dung lượng cao, sạc nhanh.' },
  { id:'sp-03', name:'Pin dự phòng 10.000mAh', price:200000,
    img:'images/pin10k.jpg', desc:'Pin gọn nhẹ, tiện mang theo.' },
  { id:'sp-04', name:'Mạch Arduino', price:150000,
    img:'images/arduino.jpg', desc:'Phù hợp học tập và DIY.' },
  { id:'sp-05', name:'Mạch Raspberry Pi', price:300000,
    img:'images/pi.jpg', desc:'Mini computer nhiều ứng dụng.' },
  { id:'sp-06', name:'Pin AA (2 viên)', price:20000,
    img:'images/pinaa.jpg', desc:'Pin AA phổ thông.' }
];

/* ===== Helpers ===== */
const fmtVND = n => n.toLocaleString('vi-VN') + '₫';
const $ = s => document.querySelector(s);

function getCart(){ try{ return JSON.parse(localStorage.getItem('cart')||'[]'); }catch{ return []; } }
function setCart(v){ localStorage.setItem('cart', JSON.stringify(v)); updateNavCartQty(); }
function updateNavCartQty(){ const q=getCart().reduce((s,i)=>s+i.qty,0); const el=$('#navCartQty'); if(el) el.textContent=q; }

/* ===== Catalog ===== */
function card(p){
  return `
  <div class="card prod">
    <img src="${p.img}" alt="${p.name}">
    <h3>${p.name}</h3>
    <div class="price"><strong>${fmtVND(p.price)}</strong></div>
    <p class="muted">${p.desc||''}</p>
    <button class="btn primary" onclick="addToCart('${p.id}')">Mua hàng</button>
  </div>`;
}
function initCatalog(){
  updateNavCartQty();
  const grid = $('#grid'), search = $('#search');
  const apply = ()=>{
    const q=(search.value||'').toLowerCase().trim();
    const list = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q)
    );
    grid.innerHTML = list.map(card).join('');
  };
  search.addEventListener('input', apply);
  apply();
}

/* ===== Cart ===== */
function addToCart(id){
  const cart=getCart(); const i=cart.findIndex(x=>x.id===id);
  if(i>=0) cart[i].qty++; else cart.push({id,qty:1});
  setCart(cart); alert('Đã thêm vào giỏ!');
}
function renderCart(){
  updateNavCartQty();
  const view=$('#cartView'); if(!view) return;
  const cart=getCart().map(it=>({ ...it, ...PRODUCTS.find(p=>p.id===it.id) }));
  if(cart.length===0){
    view.innerHTML=`<p class="muted">Giỏ trống. <a href="catalog.html">Mua thêm</a>.</p>`;
    $('#subTotal').textContent='0₫'; $('#grandTotal').textContent='0₫';
    $('#btnCheckout').onclick=()=>alert('Giỏ trống.');
    return;
  }
  view.innerHTML = cart.map(item=>`
    <div class="row">
      <div style="display:flex;gap:10px;align-items:center;max-width:70%">
        <img src="${item.img}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid var(--bd)">
        <div>
          <strong>${item.name}</strong>
          <div class="qty">
            <button class="btn" onclick="decQty('${item.id}')">-</button>
            <strong>${item.qty}</strong>
            <button class="btn" onclick="incQty('${item.id}')">+</button>
            <button class="btn danger" onclick="removeItem('${item.id}')">Xóa</button>
          </div>
        </div>
      </div>
      <div><strong>${fmtVND(item.price*item.qty)}</strong></div>
    </div>
  `).join('');
  const sub = cart.reduce((s,it)=>s+it.price*it.qty,0);
  $('#subTotal').textContent=fmtVND(sub);
  $('#grandTotal').textContent=fmtVND(sub);
  $('#btnCheckout').onclick=()=>{
    const order={items:cart.map(({id,qty})=>({id,qty})), amount:sub, createdAt:new Date().toISOString()};
    alert('Đơn hàng demo:\n'+JSON.stringify(order,null,2));
  };
}
function incQty(id){ const c=getCart(); const it=c.find(x=>x.id===id); if(it){it.qty++; setCart(c); renderCart();} }
function decQty(id){ const c=getCart(); const it=c.find(x=>x.id===id); if(it){it.qty=Math.max(1,it.qty-1); setCart(c); renderCart();} }
function removeItem(id){ const c=getCart().filter(x=>x.id!==id); setCart(c); renderCart(); }

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', ()=>{ updateNavCartQty(); });
