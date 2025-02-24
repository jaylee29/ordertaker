/********************************************
  REGISTRATION: signup.html
********************************************/
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const newUsername = document.getElementById("newUsername").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    if (!newUsername || !newPassword) {
      alert("Please fill out all fields.");
      return;
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = existingUsers.some((user) => user.username === newUsername);

    if (userExists) {
      alert("Username already taken. Please choose another one.");
      return;
    }

    // Store new user
    existingUsers.push({ username: newUsername, password: newPassword });
    localStorage.setItem("users", JSON.stringify(existingUsers));

    alert("Registration successful! You can now log in.");
    window.location.href = "index.html"; // redirect to login page
  });
}

/********************************************
  LOGIN: index.html
********************************************/
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Please fill out all fields.");
      return;
    }

    // For admin, check if the entered credentials match admin's credentials
    if (username === "admin" && password === "bsit") {
      localStorage.setItem("loggedInUser", username);
      // Append login record to loginHistory
      let loginHistory = JSON.parse(localStorage.getItem("loginHistory")) || [];
      loginHistory.push({ username: username, date: new Date().toLocaleString() });
      localStorage.setItem("loginHistory", JSON.stringify(loginHistory));

      alert("Admin login successful!");
      window.location.href = "menu.html";
      return;
    }

    // For non-admin users, check the stored users
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    const validUser = existingUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (validUser) {
      localStorage.setItem("loggedInUser", username);
      // Append login record to loginHistory
      let loginHistory = JSON.parse(localStorage.getItem("loginHistory")) || [];
      loginHistory.push({ username: username, date: new Date().toLocaleString() });
      localStorage.setItem("loginHistory", JSON.stringify(loginHistory));

      alert("Login successful!");
      window.location.href = "menu.html";
    } else {
      alert("Invalid username or password.");
    }
  });
}

/********************************************
  OPTIONAL: Menu Access Control
********************************************/
if (window.location.pathname.includes("menu.html")) {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    window.location.href = "index.html";
  }
}

/********************************************
  MENU PAGE LOGIC: Cart and Order Handling
********************************************/
let cart = []; // Global cart array

function addToCart(name, price) {
  cart.push({ name: name, price: price });
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart");
  if (!cartList) return;
  cartList.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price}`;
    cartList.appendChild(li);
  });
}

const orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", function(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Please add at least one item to your cart.");
      return;
    }
    
    const deliveryAddress = document.getElementById("deliveryAddress").value.trim();
    const contactNumber = document.getElementById("contactNumber").value.trim();

    if (!deliveryAddress || !contactNumber) {
      alert("Please enter both delivery address and contact number.");
      return;
    }

    const loggedInUser = localStorage.getItem("loggedInUser") || "Guest";
    let total = 0;
    let receiptHTML = "";
    const currentDate = new Date().toLocaleString();
    const brandName = "OrderTaker";
    const orderNumber = Math.floor(Math.random() * 1000000);

    receiptHTML += `<p><strong>Brand Name:</strong> ${brandName}</p>`;
    receiptHTML += `<p><strong>Order Number:</strong> #${orderNumber}</p>`;
    receiptHTML += `<p><strong>Date/Time:</strong> ${currentDate}</p>`;
    receiptHTML += `<p><strong>Customer:</strong> ${loggedInUser}</p>`;
    receiptHTML += `<p><strong>Delivery Address:</strong> ${deliveryAddress}</p>`;
    receiptHTML += `<p><strong>Contact Number:</strong> ${contactNumber}</p>`;
    receiptHTML += `<hr />`;
    receiptHTML += `<h3>Ordered Items:</h3>`;

    cart.forEach(item => {
      receiptHTML += `<p>${item.name} - $${item.price}</p>`;
      total += item.price;
    });

    receiptHTML += `<hr />`;
    receiptHTML += `<p><strong>Total Price:</strong> $${total.toFixed(2)}</p>`;
    receiptHTML += `<p>Thank you for ordering with ${brandName}!</p>`;

    const receiptDetailsDiv = document.getElementById("receiptDetails");
    if (receiptDetailsDiv) {
      receiptDetailsDiv.innerHTML = receiptHTML;
    }

    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    orderHistory.push({
      orderNumber: orderNumber,
      customer: loggedInUser,
      date: currentDate,
      deliveryAddress: deliveryAddress,
      contactNumber: contactNumber,
      items: [...cart],
      total: total.toFixed(2)
    });
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

    openReceipt();
    cart = [];
    renderCart();
    document.getElementById("deliveryAddress").value = "";
    document.getElementById("contactNumber").value = "";
  });
}

function openReceipt() {
  const modal = document.getElementById("receiptModal");
  if (modal) modal.style.display = "flex";
}

function closeReceipt() {
  const modal = document.getElementById("receiptModal");
  if (modal) modal.style.display = "none";
}

/********************************************
  LOGOUT FUNCTION
********************************************/
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

/********************************************
  HISTORY PAGE LOGIC (Admin Only)
********************************************/
if (window.location.pathname.includes("history.html")) {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser !== "admin") {
    alert("Access denied: Only admin can view history.");
    window.location.href = "menu.html";
  }

  const orderHistoryContainer = document.getElementById("orderHistory");
  let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
  if (orderHistory.length === 0) {
    orderHistoryContainer.innerHTML = "<p>No orders placed yet.</p>";
  } else {
    orderHistory.forEach(order => {
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("history-record");
      orderDiv.innerHTML = `
        <p><strong>Order #:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Customer:</strong> ${order.customer}</p>
        <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
        <p><strong>Contact:</strong> ${order.contactNumber}</p>
        <p><strong>Items:</strong> ${order.items.map(i => `${i.name} ($${i.price})`).join(", ")}</p>
        <p><strong>Total:</strong> $${order.total}</p>
        <hr />
      `;
      orderHistoryContainer.appendChild(orderDiv);
    });
  }

  const loginHistoryContainer = document.getElementById("loginHistory");
  let loginHistory = JSON.parse(localStorage.getItem("loginHistory")) || [];
  if (loginHistory.length === 0) {
    loginHistoryContainer.innerHTML = "<p>No logins recorded yet.</p>";
  } else {
    loginHistory.forEach(record => {
      const loginDiv = document.createElement("div");
      loginDiv.classList.add("history-record");
      loginDiv.innerHTML = `
        <p><strong>User:</strong> ${record.username}</p>
        <p><strong>Date/Time:</strong> ${record.date}</p>
        <hr />
      `;
      loginHistoryContainer.appendChild(loginDiv);
    });
  }
}
