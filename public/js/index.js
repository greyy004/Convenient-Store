const fallbackImage =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderFeaturedProducts(products) {
  const grid = document.getElementById("featuredProducts");

  if (!grid) {
    return;
  }

  if (!products.length) {
    grid.innerHTML = `
      <div class="product-card product-card-empty">
        <div class="product-icon" style="background-image: url('${fallbackImage}');"></div>
        <h3>No Products</h3>
        <p>Featured products will appear here once they are added to the store.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products
    .map((product) => {
      const imageUrl = product.product_img_url || fallbackImage;
      const categoryName = product.category_name || "Featured";
      const description =
        product.description ||
        `${categoryName} item available now at JayaStore.`;

      return `
        <article class="product-card">
          <div class="product-icon" style="background-image: url('${escapeHtml(imageUrl)}');"></div>
          <div class="product-card-body">
            <div class="product-card-meta">
              <span class="product-category">${escapeHtml(categoryName)}</span>
              <span class="product-stock">${escapeHtml(product.stock)} in stock</span>
            </div>
            <h3>${escapeHtml(product.product_name)}</h3>
            <p>${escapeHtml(description)}</p>
            <div class="product-price-container">
              <span class="product-price-label">Price</span>
              <strong class="product-price-value">Rs. ${formatPrice(product.price)}</strong>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function formatPrice(price) {
  const amount = Number(price);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/featured-products");

    if (!response.ok) {
      throw new Error("Failed to load featured products");
    }

    const data = await response.json();
    renderFeaturedProducts((data.products || []).slice(0, 3));
  } catch (err) {
    console.error(err);
    renderFeaturedProducts([]);
  }
});
