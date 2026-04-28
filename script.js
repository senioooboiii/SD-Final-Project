
// Modal toggle
const modal = document.getElementById("authModal");
const closeModal = document.getElementById("closeModal");
const getStartedBtn = document.getElementById("getStartedBtn");
const homeGetStartedBtn = document.getElementById("homeGetStartedBtn");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const profileDropdown = document.getElementById("profileDropdown");
const profileName = document.getElementById("profileName");
const profileBtn = document.getElementById("profileBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Check if user is already logged in on page load
window.addEventListener("load", () => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    getStartedBtn.style.display = "none";
    profileDropdown.style.display = "inline-block";
    profileName.textContent = currentUser;
  }

  // Load remembered username
  const rememberedUsername = localStorage.getItem("rememberedUsername");
  if (rememberedUsername) {
    document.getElementById("loginUsername").value = rememberedUsername;
    document.getElementById("rememberMe").checked = true;
  }
});

// Open modal
const openLoginModal = (e) => {
  e.preventDefault();
  modal.style.display = "flex";
  loginForm.classList.add("active");
  signupForm.classList.remove("active");
};

getStartedBtn.addEventListener("click", openLoginModal);
homeGetStartedBtn.addEventListener("click", openLoginModal);

// Close modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Switch forms
showSignup.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.remove("active");
  signupForm.classList.add("active");
});
showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.classList.remove("active");
  loginForm.classList.add("active");
});

// Handle login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  const storedUser = localStorage.getItem(username);
  if (storedUser) {
    // Try to parse as JSON (new format)
    let isValid = false;
    try {
      const userData = JSON.parse(storedUser);
      isValid = userData.password === password;
    } catch (e) {
      // Fallback for old format (plain password string)
      isValid = storedUser === password;
    }

    if (isValid) {
      // Store current user and redirect to dashboard
      localStorage.setItem("currentUser", username);
      
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      window.location.href = "user-dashboard.html";
    } else {
      alert("Invalid credentials. Try again!");
    }
  } else {
    alert("Invalid credentials. Try again!");
  }
});

// Forgot Password functionality
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const closeForgotPassword = document.getElementById("closeForgotPassword");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const backToLogin = document.getElementById("backToLogin");
const resetMessage = document.getElementById("resetMessage");

// Open Forgot Password Modal
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  modal.style.display = "none";
  forgotPasswordModal.style.display = "flex";
  forgotPasswordForm.reset();
  resetMessage.textContent = "";
});

// Close Forgot Password Modal
closeForgotPassword.addEventListener("click", () => {
  forgotPasswordModal.style.display = "none";
});

// Back to Login
backToLogin.addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordModal.style.display = "none";
  modal.style.display = "flex";
  loginForm.classList.add("active");
  signupForm.classList.remove("active");
});

// Handle Forgot Password Form
forgotPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("resetUsername").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Check if user exists
  if (!localStorage.getItem(username)) {
    resetMessage.textContent = "❌ Username not found!";
    resetMessage.style.color = "red";
    return;
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    resetMessage.textContent = "❌ Passwords do not match!";
    resetMessage.style.color = "red";
    return;
  }

  // Check password length
  if (newPassword.length < 4) {
    resetMessage.textContent = "❌ Password must be at least 4 characters!";
    resetMessage.style.color = "red";
    return;
  }

  // Update password
  localStorage.setItem(username, newPassword);
  resetMessage.textContent = "✅ Password reset successful! Redirecting to login...";
  resetMessage.style.color = "var(--main-color)";

  setTimeout(() => {
    forgotPasswordModal.style.display = "none";
    modal.style.display = "flex";
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = "";
    forgotPasswordForm.reset();
  }, 2000);
});

// Handle signup
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const phone = document.getElementById("signupPhone").value;
  const password = document.getElementById("signupPassword").value;

  if (localStorage.getItem(username)) {
    alert("Username already exists!");
  } else {
    // Store user data as JSON object
    const userData = {
      password: password,
      email: email,
      phone: phone
    };
    localStorage.setItem(username, JSON.stringify(userData));
    alert("Signup successful! You can now login.");
    // Store current user and redirect to dashboard
    localStorage.setItem("currentUser", username);
    window.location.href = "user-dashboard.html";
  }
});

// Logout
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("currentUser");
  profileDropdown.style.display = "none";
  getStartedBtn.style.display = "inline-block";
  alert("You have logged out.");
  profileDropdown.classList.remove("active");
});

// Dropdown toggle
profileBtn.addEventListener("click", () => {
  profileDropdown.classList.toggle("active");
});


// Payment modal elements
const paymentModal = document.getElementById("paymentModal");
const paymentForm = document.getElementById("paymentForm");
const planSelected = document.getElementById("planSelected");
const paymentMessage = document.getElementById("paymentMessage");

// Find all Join Now buttons
const joinBtns = document.querySelectorAll(".box a");

// Open payment modal when Join Now clicked
joinBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const planName = btn.closest(".box").querySelector("h3").textContent;
    planSelected.value = planName;
    paymentModal.style.display = "block";
    paymentMessage.textContent = ""; // clear old messages
  });
});

// Close payment modal
const closeBtns = document.querySelectorAll(".modal .close");
closeBtns.forEach(closeBtn => {
  closeBtn.addEventListener("click", () => {
    paymentModal.style.display = "none";
  });
});

// Close modals when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
  if (event.target === paymentModal) {
    paymentModal.style.display = "none";
  }
  if (event.target === forgotPasswordModal) {
    forgotPasswordModal.style.display = "none";
  }
});

// Handle payment form submit
paymentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const method = document.getElementById("paymentMethod").value;
  const plan = document.getElementById("planSelected").value;
  const currentUser = profileName.textContent;

  if (method === "") {
    paymentMessage.textContent = "Please select a payment method.";
    paymentMessage.style.color = "red";
  } else if (method === "paypal") {
    // Save payment to localStorage
    savePaymentData(currentUser, plan, method);
    paymentMessage.textContent = "Payment successful! Redirecting to PayPal...";
    paymentMessage.style.color = "var(--main-color)";
    // TODO: integrate PayPal API or redirect here
  } else if (method === "credit") {
    // Save payment to localStorage
    savePaymentData(currentUser, plan, method);
    paymentMessage.textContent = "Payment successful! Credit Card processing...";
    paymentMessage.style.color = "var(--main-color)";
  } else if (method === "gcash") {
    // Save payment to localStorage
    savePaymentData(currentUser, plan, method);
    paymentMessage.textContent = "Payment successful! GCash processing...";
    paymentMessage.style.color = "var(--main-color)";
  }
});

// Function to save payment data
function savePaymentData(member, plan, method) {
  // Get plan pricing
  const planPrices = {
    "BASIC": 550,
    "PRO": 1500,
    "PREMIUM": 3000
  };

  const payments = JSON.parse(localStorage.getItem("payments")) || [];
  payments.push({
    member: member,
    plan: plan,
    amount: planPrices[plan] || 0,
    method: method,
    date: new Date().toISOString()
  });
  localStorage.setItem("payments", JSON.stringify(payments));
}

// View profile

const viewProfile = document.querySelector("#dropdownMenu li a[href='#']");
const messagesLink = document.querySelector("#dropdownMenu li:nth-child(2) a");

const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const profileUsername = document.getElementById("profileUsername");

const messagesModal = document.getElementById("messagesModal");
const closeMessages = document.getElementById("closeMessages");

// View Profile
viewProfile.addEventListener("click", (e) => {
  e.preventDefault();
  profileModal.style.display = "flex";
  profileUsername.textContent = profileName.textContent;
});
closeProfile.addEventListener("click", () => {
  profileModal.style.display = "none";
});

// Messages
messagesLink.addEventListener("click", (e) => {
  e.preventDefault();
  messagesModal.style.display = "flex";
});
closeMessages.addEventListener("click", () => {
  messagesModal.style.display = "none";
});

// NavBAR 
let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}
