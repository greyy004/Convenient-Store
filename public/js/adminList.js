function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderUsersTable(users) {
    if (!users.length) {
        return '<p class="admin-empty">No users found.</p>';
    }

    const rows = users.map((user) => `
        <tr>
            <td>${escapeHtml(user.id)}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
        </tr>
    `).join('');

    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function renderProductsTable(products) {
    if (!products.length) {
        return '<p class="admin-empty">No products found.</p>';
    }

    const rows = products.map((product) => `
        <tr>
            <td>${escapeHtml(product.id)}</td>
            <td>${escapeHtml(product.product_name)}</td>
            <td>${escapeHtml(product.description || '-')}</td>
            <td>$${escapeHtml(product.price)}</td>
            <td>${escapeHtml(product.stock)}</td>
        </tr>
    `).join('');

    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Stock</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('listContent');
    const isUsersPage = window.location.pathname.includes('/admin/users-page');
    const config = isUsersPage
        ? {
            url: '/admin/users',
            renderer: (payload) => renderUsersTable(payload.users || []),
            error: 'Failed to load users'
        }
        : {
            url: '/admin/products',
            renderer: (payload) => renderProductsTable(payload.products || []),
            error: 'Failed to load products'
        };

    try {
        const res = await fetch(config.url, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
            credentials: 'include'
        });

        const payload = await res.json();
        if (!res.ok) {
            throw new Error(payload.message || config.error);
        }

        container.innerHTML = config.renderer(payload);
    } catch (err) {
        container.innerHTML = `<p class="admin-empty">${escapeHtml(err.message || config.error)}</p>`;
    }
});
