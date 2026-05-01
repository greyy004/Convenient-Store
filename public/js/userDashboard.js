document.addEventListener("DOMContentLoaded", async () => {
    const productContainer = document.getElementById('product');

    try {
        // Fetch products
        if (productContainer) {
            const productsRes = await fetch('/user/products', {
                method: 'get',
                headers: { 'content-type': 'application/json' },
                credentials: 'include'
            });

            if (!productsRes.ok) {
                console.error("Error fetching products");
                return;
            }

            const data = await productsRes.json();
            const products = data.products || [];

            if (products.length === 0) {
                productContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem; margin-top: 2rem;">No products available at the moment.</p>';
                return;
            }

            // Render products
            let html = '<div class="products-grid">';
            products.forEach(p => {
                const imgUrl = p.product_img_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop';
                html += `
                    <div class="product-card">
                        <div class="product-icon" style="background-image: url('${imgUrl}');"></div>
                        <h3>${p.product_name}</h3>
                        <p><strong>Rs. ${parseFloat(p.price).toFixed(2)}</strong> - In Stock: ${p.stock}</p>
                        <p>${p.description || 'No description available.'}</p>
                        <button>Add to Cart</button>
                    </div>
                `;
            });
            html += '</div>';
            productContainer.innerHTML = html;
        }

    } catch (err) {
        console.error("Error initializing dashboard:", err);
    }
});

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const res = await fetch('/auth/logout', {
                method: 'POST'
            });
            if (res.ok) {
                window.location.href = '/html/index.html';
            } else {
                console.error('Logout failed');
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }
}
