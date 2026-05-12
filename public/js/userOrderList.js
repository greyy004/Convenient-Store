document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
        showNotification("Payment successful! Your order is being processed.", "success");
    } else if (paymentStatus === 'failed') {
        showNotification("Payment failed or was cancelled. Please try again.", "error");
    }

    await loadOrders();
});

async function loadOrders() {
    const container = document.getElementById("ordersContainer");

    try {
        const response = await fetch("/user/orders", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            container.innerHTML = `
                <div class="order-message order-message-error">
                    <h2>Unable to load orders</h2>
                    <p>Please refresh the page or try again in a moment.</p>
                </div>
            `;
            return;
        }

        const data = await response.json();
        const orders = data.orders || [];

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="order-empty-state">
                    <div class="order-empty-icon">0</div>
                    <h2>No orders yet</h2>
                    <p>You haven't placed any orders yet. Browse the shop and your purchases will appear here.</p>
                    <a href="/user/dashboard" class="order-empty-action">Start Shopping</a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">${new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</div>
                </div>
                <div class="order-body">
                    <div class="order-info">
                        <h4>Status</h4>
                        <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="order-info">
                        <h4>Payment</h4>
                        <p>${order.payment_method.toUpperCase()}</p>
                    </div>
                    <div class="order-info">
                        <h4>Total Amount</h4>
                        <p class="order-total">Rs. ${parseFloat(order.total_price).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error loading orders:", err);
        container.innerHTML = `
            <div class="order-message order-message-error">
                <h2>Something went wrong</h2>
                <p>An error occurred while loading your orders.</p>
            </div>
        `;
    }
}

async function logout() {
    try {
        const res = await fetch("/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        if (res.ok) {
            window.location.href = "/html/index.html";
        }
    } catch (err) {
        console.error("Logout failed:", err);
    }
}
