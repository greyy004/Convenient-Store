document.addEventListener("DOMContentLoaded", async () => {
  await loadCartSummary();
  await prefillUserData();

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

// PRE-FILL USER DATA
async function prefillUserData() {
  try {
    const response = await fetch("/user/profile", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user;

      if (user) {
        document.getElementById("fullName").value = user.name || "";
        document.getElementById("email").value = user.email || "";

        // Use saved data or dummy values if empty
        document.getElementById("address").value =
          user.address || "Kathmandu, Nepal (Dummy)";
        document.getElementById("phone").value = user.phone || "9800000000";
        document.getElementById("country").value = user.country || "Nepal";
      }
    }
  } catch (err) {
    console.error("Error pre-filling user data:", err);
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

    country: document.getElementById("country").value,

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
        window.location.href = "/user/orderList";
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
      document.getElementById("product_delivery_charge").value = 100;
      document.getElementById("product_service_charge").value = 0;
      document.getElementById("success_url").value =
        `${window.location.origin}/api/payment/success`;
      document.getElementById("failure_url").value =
        `${window.location.origin}/api/payment/failure`;

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
