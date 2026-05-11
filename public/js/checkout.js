document.addEventListener("DOMContentLoaded", async () => {
  await loadCartSummary();

  const checkoutForm = document.getElementById("checkoutForm");

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckout);
  }
});

// LOAD CART SUMMARY
async function loadCartSummary() {
  const itemsList = document.getElementById("cartItemsList");

  const shipping = 100;

  try {
    const response = await fetch("/user/cart", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      itemsList.innerHTML = "<p class='error-text'>Failed to load cart.</p>";
      return;
    }

    const data = await response.json();

    const items = data.cartItems || [];

    if (items.length === 0) {
      itemsList.innerHTML = "<p class='empty-text'>Your cart is empty.</p>";

      updateTotals(0, shipping);

      return;
    }

    let subtotal = 0;

    itemsList.innerHTML = items
      .map((item) => {
        const itemTotal = item.price * item.quantity;

        subtotal += itemTotal;

        return `
                    <div class="summary-item">
                        <div>
                            <strong>${item.product_name}</strong>
                            <div>Qty: ${item.quantity}</div>
                        </div>

                        <span>
                            Rs. ${itemTotal.toFixed(2)}
                        </span>
                    </div>
                `;
      })
      .join("");

    updateTotals(subtotal, shipping);
  } catch (err) {
    console.error(err);

    itemsList.innerHTML = "<p class='error-text'>Error loading cart.</p>";
  }
}

// UPDATE TOTALS
function updateTotals(subtotal, shipping) {
  document.getElementById("subtotal").textContent =
    `Rs. ${subtotal.toFixed(2)}`;

  document.getElementById("totalAmount").textContent =
    `Rs. ${(subtotal + shipping).toFixed(2)}`;
}

// CHECKOUT HANDLER
async function handleCheckout(e) {
  e.preventDefault();

  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked',
  ).value;

  const shippingData = {
    fullName: document.getElementById("fullName").value,

    email: document.getElementById("email").value,

    address: document.getElementById("address").value,

    city: document.getElementById("city").value,

    phone: document.getElementById("phone").value,
  };

  try {
    // CASH ON DELIVERY
    if (paymentMethod === "cod") {
      const res = await fetch("/user/placeOrder", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          ...shippingData,
          paymentMethod: "cod",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      showNotification("Order placed successfully!", "success");

      setTimeout(() => {
        window.location.href = "/user/dashboard";
      }, 2000);

      return;
    }

    // ESEWA PAYMENT
    if (paymentMethod === "esewa") {
      const res = await fetch("/api/payment/esewa", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify(shippingData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Payment initialization failed");
      }

      // Fill hidden eSewa form
      document.getElementById("amount").value = data.amount;

      document.getElementById("tax_amount").value = data.tax_amount;

      document.getElementById("total_amount").value = data.total_amount;

      document.getElementById("transaction_uuid").value = data.transaction_uuid;

      document.getElementById("signature").value = data.signature;

      // Submit to eSewa
      document.getElementById("esewaForm").submit();
    }
  } catch (err) {
    console.error(err);

    showNotification(err.message || "Checkout failed", "error");
  }
}

// LOGOUT
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
