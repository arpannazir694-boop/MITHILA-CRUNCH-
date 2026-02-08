let productsData = [];
let cartCount = 0;
// ===== CONFIG =====
const SLIDE_API = "https://script.google.com/macros/s/AKfycbzaEUxnSibtnnCQIfywK3CpW_XpMfij2qDb8KtMIIs-9zLDgzB0kcSkvKbKmVWfQ0T0yQ/exec";

// ===== MENU CONTROL =====
function openMenu() {
  document.getElementById("sideMenu").style.left = "0";
}

function closeMenu() {
  document.getElementById("sideMenu").style.left = "-260px";
}

// ===== SLIDER LOGIC =====
let currentSlide = 0;
let slidesData = [];

// Fetch slides from Google Sheet
fetch(SLIDE_API)
  .then(res => res.json())
  .then(data => {
    slidesData = data;
    renderSlides();
    startAutoSlide();
  })
  .catch(() => {
    console.log("Failed to load slides");
  });

// Render slides & dots
function renderSlides() {
  const slides = document.getElementById("slides");
  const dots = document.getElementById("dots");

  slides.innerHTML = "";
  dots.innerHTML = "";

  slidesData.forEach((slide, index) => {
    // Slide
    const slideDiv = document.createElement("div");
    slideDiv.className = "slide";
    slideDiv.style.backgroundImage = `url('${slide.image}')`;

    slideDiv.innerHTML = `
      <div class="slide-content">
        <h2>${slide.title}</h2>
        <p>${slide.text}</p>
      </div>
    `;

    slides.appendChild(slideDiv);

    // Dot
    const dot = document.createElement("span");
    dot.className = "dot" + (index === 0 ? " active" : "");
    dots.appendChild(dot);
  });
}

// Auto slide
function startAutoSlide() {
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slidesData.length;

    document.getElementById("slides").style.transform =
      `translateX(-${currentSlide * 100}%)`;

    document.querySelectorAll(".dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }, 4000);
}
function logout() {
  localStorage.removeItem("userName"); // শুধু user remove
  window.location.href = "home.html";  // 🔥 home page এ ফেরত
}

// LOAD PRODUCTS FROM GOOGLE SHEET
fetch(SLIDE_API + "?page=products")
  .then(res => res.json())
  .then(data => {
    productsData = data; // 🔥 STORE PRODUCTS

    const grid = document.getElementById("productsGrid");
    grid.innerHTML = "";

    data.forEach((p, index) => {
      grid.innerHTML += `
        <div class="product-card">
          <img src="${p.image}" alt="${p.name}">

          <div class="product-info">
            <h3>${p.name}</h3>

            <div class="price">₹${p.price}</div>
            <div class="final">₹${p.final_price}</div>
            ${
              p.discount > 0
                ? `<div class="discount">${p.discount}% OFF</div>`
                : ""
            }

            <div class="qty-box">
              <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
              <span class="qty-value" id="qty-${index}">0</span>
              <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>

            <div class="product-actions">
              <button class="add-cart" onclick="addToCartClick(${index})">
  Add to Cart
</button>

              <button class="buy-now" onclick="buyNow(${index})">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      `;
    });
  });

function addToCart(name, price, index) {
  const qty = document.getElementById(`qty-${index}`).innerText;
  alert(`${name} added to cart (Qty: ${qty})`);
}

function buyNow(index) {
  // ❌ login না থাকলে → login page
  if (!isLoggedIn()) {
    window.location.href = "index.html"; // login page
    return;
  }

  // ✅ login থাকলে normal flow
  const qtyEl = document.getElementById(`qty-${index}`);
  let qty = parseInt(qtyEl.innerText);

  if (qty === 0) {
    qty = 1;
    qtyEl.innerText = qty;
    addOrUpdateItem(productsData[index], 1);
  }

  openCart();
}



function changeQty(index, change) {
  const qtyEl = document.getElementById(`qty-${index}`);
  let qty = parseInt(qtyEl.innerText);
  const p = productsData[index];

  if (change === 1) {
    qty += 1;
    addOrUpdateItem(p, 1);
  } else {
    if (qty > 0) {
      qty -= 1;
      addOrUpdateItem(p, -1);
    }
  }

  qtyEl.innerText = qty;
}




let cart = [];

function openCart() {
  document.getElementById("cartPanel").classList.add("active");
  document.getElementById("cartOverlay").style.display = "block";
}

function closeCart() {
  document.getElementById("cartPanel").classList.remove("active");
  document.getElementById("cartOverlay").style.display = "none";
}

function addItem(index) {
  const p = productsData[index];

  const existing = cart.find(i => i.name === p.name);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      name: p.name,
      price: p.price,
      discount: p.discount,
      final: p.final_price,
      qty: 1
    });
  }

  updateCartUI();
}



function updateCartUI() {
  const items = document.getElementById("cartItems");
  items.innerHTML = "";

  let subtotal = 0;
  let discountTotal = 0;

  // EMPTY CART
  if (cart.length === 0) {
    document.getElementById("cartSubtotal").innerText = "₹0";
    document.getElementById("cartDiscount").innerText = "₹0";
    document.getElementById("cartGST").innerText = "₹0";
    document.getElementById("cartTotal").innerText = "₹0";

    // 🔥 BADGE UPDATE (EMPTY)
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
      cartCountEl.innerText = "0";
      cartCountEl.style.display = "none";
    }
    return;
  }

  // ITEMS
  cart.forEach(item => {
    const itemSubtotal = item.final * item.qty;
    const itemDiscount = (item.price - item.final) * item.qty;

    subtotal += itemSubtotal;
    discountTotal += itemDiscount;

    items.innerHTML += `
  <div class="cart-item">
    <div class="cart-item-row">
      <h4>${item.name}</h4>

      <div class="cart-qty">
        <button onclick="cartQtyChange('${item.name}', -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="cartQtyChange('${item.name}', 1)">+</button>
      </div>
    </div>

    <p>₹${item.final} × ${item.qty} = ₹${item.final * item.qty}</p>
  </div>
`;

  });

  // TOTALS
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  document.getElementById("cartSubtotal").innerText = `₹${subtotal.toFixed(2)}`;
  document.getElementById("cartDiscount").innerText = `₹${discountTotal.toFixed(2)}`;
  document.getElementById("cartGST").innerText = `₹${gst.toFixed(2)}`;
  document.getElementById("cartTotal").innerText = `₹${total.toFixed(2)}`;

  // 🔥 BADGE UPDATE (LIVE COUNT)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.innerText = cartCount;
    cartCountEl.style.display = cartCount > 0 ? "block" : "none";
  }
}

function addOrUpdateItem(p, deltaQty) {
  const item = cart.find(i => i.name === p.name);

  if (item) {
    item.qty += deltaQty;

    if (item.qty <= 0) {
      cart = cart.filter(i => i.name !== p.name);
    }
  } else {
    if (deltaQty > 0) {
      cart.push({
        name: p.name,
        price: p.price,
        discount: p.discount,
        final: p.final_price,
        qty: deltaQty
      });
    }
  }

  updateCartUI();
}
function addToCartClick(index) {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  const qtyEl = document.getElementById(`qty-${index}`);
  let qty = parseInt(qtyEl.innerText);

  if (qty === 0) {
    qty = 1;
    qtyEl.innerText = qty;
    addOrUpdateItem(productsData[index], 1);
  }

  openCart();
}

function cartQtyChange(productName, change) {
  const item = cart.find(i => i.name === productName);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== productName);
  }

  // 🔄 Sync product card qty also
  productsData.forEach((p, index) => {
    if (p.name === productName) {
      const qtyEl = document.getElementById(`qty-${index}`);
      if (qtyEl) {
        qtyEl.innerText = item ? item.qty : 0;
      }
    }
  });

  updateCartUI();
}

function placeOrder() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const pincode = document.getElementById("custPincode").value.trim();

  if (!name || !phone || !address || !pincode) {
    alert("Please fill all delivery details");
    return;
  }

  // hide address
  document.getElementById("addressSection").style.display = "none";

  // show payment options
  document.getElementById("paymentSection").style.display = "block";
}


function handleCheckout() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  // ensure cart is open
  openCart();

  document.getElementById("cartItems").style.display = "none";
  document.querySelector(".cart-summary").style.display = "none";
  document.getElementById("addressSection").style.display = "block";
}

function isLoggedIn() {
  return !!localStorage.getItem("userName");
}

function backToCart() {
  // hide address form
  const address = document.getElementById("addressSection");
  if (address) address.style.display = "none";

  // show cart items & summary
  const items = document.getElementById("cartItems");
  if (items) items.style.display = "block";

  const summary = document.querySelector(".cart-summary");
  if (summary) summary.style.display = "block";
}
let selectedPayment = "";

function selectPayment(method) {
  selectedPayment = method;

  document.getElementById("cod").checked = method === "COD";
  document.getElementById("upi").checked = method === "UPI";

  const upiBox = document.getElementById("upiBox");
  upiBox.style.display = method === "UPI" ? "block" : "none";
}


function confirmOrder() {
  if (!selectedPayment) {
    alert("Please select a payment method");
    return;
  }

  if (selectedPayment === "UPI") {
    const txnId = document.getElementById("txnId").value.trim();
    if (!txnId) {
      alert("Please enter UPI Transaction ID");
      return;
    }
  }

  alert("Order placed successfully!");

  // reset
  cart = [];
  updateCartUI();
  closeCart();

  document.getElementById("paymentSection").style.display = "none";
}
function backFromPayment() {
  // hide payment section
  document.getElementById("paymentSection").style.display = "none";

  // show cart again
  document.getElementById("cartItems").style.display = "block";
  document.querySelector(".cart-summary").style.display = "block";

  // make sure address is hidden
  const address = document.getElementById("addressSection");
  if (address) address.style.display = "none";
}
function renderUserAvatar() {
  const avatar = document.getElementById("userAvatar");
  const userName = localStorage.getItem("userName");

  if (!userName) {
    avatar.classList.add("guest");
    avatar.innerHTML = `<i class="ri-user-3-line"></i>`;
    avatar.onclick = () => {
      window.location.href = "index.html";
    };
  } else {
    avatar.classList.remove("guest");
    avatar.innerText = userName.charAt(0).toUpperCase();
    avatar.onclick = () => {};
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderUserAvatar();
});


