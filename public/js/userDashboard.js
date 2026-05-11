function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let products = [];

function formatPrice(price) {
  const amount = Number(price);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function getSelectedProducts() {
  const searchValue =
    document.getElementById("productSearch")?.value.trim().toLowerCase() || "";
  const categoryValue =
    document.getElementById("categoryFilter")?.value || "all";

  return products.filter((product) => {
    const productText = [
      product.product_name,
      product.description,
      product.category_name,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchValue || productText.includes(searchValue);
    const matchesCategory =
      categoryValue === "all" ||
      String(product.category_name || "Uncategorized") === categoryValue;
    return matchesSearch && matchesCategory;
  });
}

function updateProductSummary(count) {
  const productSummary = document.getElementById("productSummary");
  if (!productSummary) {
    return;
  }

  productSummary.textContent = `${count} ${count === 1 ? "item" : "items"} available`;
}

function renderCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) {
    return;
  }

  const categories = [
    ...new Set(
      products.map((product) => product.category_name || "Uncategorized"),
    ),
  ].sort();
  categoryFilter.innerHTML = `
        <option value="all">All categories</option>
        ${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}
    `;
}

function renderProducts() {
  const productContainer = document.getElementById("product");
  if (!productContainer) {
    return;
  }

  const selectedProducts = getSelectedProducts();
  updateProductSummary(selectedProducts.length);

  if (selectedProducts.length === 0) {
    productContainer.innerHTML =
      '<p class="shop-empty">No products match your search.</p>';
    return;
  }

  const cards = selectedProducts
    .map((product) => {
      const imgUrl =
        product.product_img_url ||
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop";
      const categoryName = product.category_name || "Uncategorized";
      return `
            <article class="shop-product-card">
                <div class="shop-product-image" style="background-image: url('${escapeHtml(imgUrl)}');"></div>
                <div class="shop-product-body">
                    <div class="shop-product-meta">
                        <span class="shop-category">${escapeHtml(categoryName)}</span>
                        <span class="shop-stock">${escapeHtml(product.stock)} in stock</span>
                    </div>
                    <h3>${escapeHtml(product.product_name)}</h3>
                    <p class="shop-description">${escapeHtml(product.description || "No description available.")}</p>
                    <div class="shop-price-container">
                        <span class="shop-price-label">Price</span>
                        <strong class="shop-price-value">Rs. ${formatPrice(product.price)}</strong>
                    </div>
                    <div class="shop-card-footer">
                        <div class="shop-quantity-control">
                            <button class="shop-qty-btn minus" type="button">−</button>
                            <input type="number" class="shop-qty-input" value="1" min="1" max="${product.stock}" readonly>
                            <button class="shop-qty-btn plus" type="button">+</button>
                        </div>
                        <button class="shop-add-btn" type="button" data-product-id="${escapeHtml(product.id)}">Add to Cart</button>
                    </div>
                </div>
            </article>
        `;
    })
    .join("");

  productContainer.innerHTML = `<div class="shop-products-grid">${cards}</div>`;

  // Add event listeners for quantity buttons
  productContainer.querySelectorAll(".shop-product-card").forEach((card) => {
    const minusBtn = card.querySelector(".shop-qty-btn.minus");
    const plusBtn = card.querySelector(".shop-qty-btn.plus");
    const qtyInput = card.querySelector(".shop-qty-input");
    const maxStock = parseInt(qtyInput.getAttribute("max"));

    minusBtn?.addEventListener("click", () => {
      const currentQty = parseInt(qtyInput.value);
      if (currentQty > 1) {
        qtyInput.value = currentQty - 1;
      }
    });

    plusBtn?.addEventListener("click", () => {
      const currentQty = parseInt(qtyInput.value);
      if (currentQty < maxStock) {
        qtyInput.value = currentQty + 1;
      }
    });
  });

  productContainer.querySelectorAll(".shop-add-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const productId = button.dataset.productId;
        const card = button.closest(".shop-product-card");
        const quantity = parseInt(card.querySelector(".shop-qty-input").value);

        const res = await fetch("/user/addToCart", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            productId,
            quantity,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          showNotification("Item added to the cart", "success");
        } else {
          showNotification(data.message || "Error adding item", "error");
        }
      } catch (err) {
        console.error("error adding item to the cart:", err);
        showNotification("Error adding item to the cart", "error");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const productContainer = document.getElementById("product");
  const productSearch = document.getElementById("productSearch");
  const categoryFilter = document.getElementById("categoryFilter");

  productSearch?.addEventListener("input", renderProducts);
  categoryFilter?.addEventListener("change", renderProducts);

  try {
    // Fetch products
    if (productContainer) {
      const productsRes = await fetch("/user/products", {
        method: "get",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      if (!productsRes.ok) {
        console.error("Error fetching products");
        productContainer.innerHTML =
          '<p class="shop-empty">Unable to load products right now.</p>';
        showNotification("Unable to load products right now", "error");
        return;
      }

      const data = await productsRes.json();
      products = data.products || [];
      renderCategoryFilter();

      if (products.length === 0) {
        productContainer.innerHTML =
          '<p class="shop-empty">No products available at the moment.</p>';
        updateProductSummary(0);
        return;
      }

      renderProducts();
    }
  } catch (err) {
    console.error("Error initializing dashboard:", err);
    if (productContainer) {
      productContainer.innerHTML =
        '<p class="shop-empty">Unable to load products right now.</p>';
    }
    showNotification("Unable to load products right now", "error");
  }
});

async function logout() {
  const shouldLogout = await showConfirmation({
    title: "Logout",
    message: "Are you sure you want to logout?",
    confirmText: "Logout",
    cancelText: "Stay",
  });

  if (shouldLogout) {
    try {
      const res = await fetch("/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        window.location.href = "/html/index.html";
      } else {
        console.error("Logout failed");
        showNotification("Logout failed", "error");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      showNotification("Logout failed", "error");
    }
  }
}
