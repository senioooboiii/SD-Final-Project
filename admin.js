// Admin Panel JavaScript

// Admin credentials (hardcoded for now)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// Check if admin is logged in
window.addEventListener("load", () => {
  const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
  if (!isAdminLoggedIn) {
    document.getElementById("adminLoginModal").style.display = "flex";
  } else {
    loadDashboard();
  }
});

// Admin Login
document.getElementById("adminLoginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    localStorage.setItem("adminLoggedIn", "true");
    document.getElementById("adminLoginModal").style.display = "none";
    loadDashboard();
  } else {
    document.getElementById("adminLoginError").textContent = "Invalid credentials";
  }
});

// Admin Logout
document.getElementById("adminLogout").addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "index.html";
});

// Close Admin Login Modal
const closeAdminModal = document.getElementById("closeAdminModal");
if (closeAdminModal) {
  closeAdminModal.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// Navigation between sections
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons and sections
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".admin-section").forEach((s) => s.classList.remove("active"));

    // Add active class to clicked button and corresponding section
    btn.classList.add("active");
    const sectionId = btn.getAttribute("data-section");
    document.getElementById(sectionId).classList.add("active");

    // Load section data
    if (sectionId === "members") loadMembers();
    if (sectionId === "payments") loadPayments();
    if (sectionId === "reviews") loadReviews();
    if (sectionId === "announcements") loadAnnouncements();
  });
});

// Load Dashboard
function loadDashboard() {
  const members = getAllMembers();
  const payments = getAllPayments();
  const reviews = getAllReviews();

  document.getElementById("totalMembers").textContent = members.length;
  
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  document.getElementById("totalRevenue").textContent = "₱" + totalRevenue.toLocaleString();
  
  document.getElementById("totalPayments").textContent = payments.length;
  document.getElementById("totalReviews").textContent = reviews.length;

  // Recent Activity
  const activity = [];
  if (members.length > 0) activity.push(`📌 ${members.length} total members registered`);
  if (payments.length > 0) activity.push(`💰 ${payments.length} payments processed`);
  if (reviews.length > 0) activity.push(`⭐ ${reviews.length} reviews submitted`);

  const activityHtml = activity.length > 0 
    ? activity.map(a => `<p>${a}</p>`).join("") 
    : "<p>No recent activity</p>";
  document.getElementById("recentActivity").innerHTML = activityHtml;
}

// Get all members from localStorage
function getAllMembers() {
  const members = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !key.includes("admin") && key !== "adminLoggedIn") {
      members.push({
        username: key,
        joinDate: new Date().toLocaleDateString(),
      });
    }
  }
  return members;
}

// Get all payments from localStorage
function getAllPayments() {
  const paymentsStr = localStorage.getItem("payments");
  return paymentsStr ? JSON.parse(paymentsStr) : [];
}

// Get all reviews from localStorage
function getAllReviews() {
  const reviewsStr = localStorage.getItem("reviews");
  return reviewsStr ? JSON.parse(reviewsStr) : [];
}

// Load Members
function loadMembers() {
  const members = getAllMembers();
  const tbody = document.getElementById("membersTableBody");

  if (members.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No members yet</td></tr>";
    return;
  }

  tbody.innerHTML = members.map((member, idx) => `
    <tr>
      <td data-label="Username">${member.username}</td>
      <td data-label="Membership">Basic Plan</td>
      <td data-label="Join Date">${member.joinDate}</td>
      <td data-label="Actions">
        <button class="action-btn delete-btn" onclick="deleteMember('${member.username}')">
          <i class='bx bxs-trash'></i> Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// Delete Member
function deleteMember(username) {
  document.getElementById("deleteMessage").textContent = `Are you sure you want to delete member "${username}"?`;
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.style.display = "flex";

  document.getElementById("confirmDeleteBtn").onclick = () => {
    localStorage.removeItem(username);
    deleteModal.style.display = "none";
    loadMembers();
    loadDashboard();
  };
}

// Load Payments
function loadPayments() {
  const payments = getAllPayments();
  const tbody = document.getElementById("paymentsTableBody");

  if (payments.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6'>No payments yet</td></tr>";
    return;
  }

  tbody.innerHTML = payments.map((payment, idx) => `
    <tr>
      <td data-label="Member">${payment.member || "Unknown"}</td>
      <td data-label="Plan">${payment.plan}</td>
      <td data-label="Amount">₱${payment.amount}</td>
      <td data-label="Method">${payment.method}</td>
      <td data-label="Date">${new Date(payment.date).toLocaleDateString()}</td>
      <td data-label="Status"><span class="status-badge completed">Completed</span></td>
    </tr>
  `).join("");
}

// Search Members
document.getElementById("memberSearch").addEventListener("keyup", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#membersTableBody tr");

  rows.forEach((row) => {
    const username = row.cells[0].textContent.toLowerCase();
    row.style.display = username.includes(searchTerm) ? "" : "none";
  });
});

// Filter Payments
document.getElementById("paymentFilter").addEventListener("change", (e) => {
  const filterPlan = e.target.value;
  const rows = document.querySelectorAll("#paymentsTableBody tr");

  rows.forEach((row) => {
    const plan = row.cells[1].textContent;
    row.style.display = filterPlan === "" || plan === filterPlan ? "" : "none";
  });
});

// Load Reviews
function loadReviews() {
  const reviews = getAllReviews();
  const reviewsList = document.getElementById("reviewsList");

  if (reviews.length === 0) {
    reviewsList.innerHTML = "<p style='text-align: center; color: #aaa; padding: 2rem;'>No reviews yet</p>";
    return;
  }

  reviewsList.innerHTML = reviews.map((review, idx) => `
    <div class="admin-review-card">
      <div class="review-top">
        <div class="reviewer-info">
          <h4>${review.name}</h4>
          <div class="review-rating-display">${"⭐".repeat(review.rating)}</div>
        </div>
        <button class="action-btn delete-btn" onclick="deleteReview(${idx})">
          <i class='bx bxs-trash'></i> Delete
        </button>
      </div>
      <p class="review-text">${review.text}</p>
      <small class="review-date">${new Date(review.date).toLocaleDateString()}</small>
    </div>
  `).join("");
}

// Delete Review (admin can delete inappropriate reviews)
function deleteReview(idx) {
  const reviews = getAllReviews();
  document.getElementById("deleteMessage").textContent = `Are you sure you want to delete this review?`;
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.style.display = "flex";

  document.getElementById("confirmDeleteBtn").onclick = () => {
    reviews.splice(idx, 1);
    localStorage.setItem("reviews", JSON.stringify(reviews));
    deleteModal.style.display = "none";
    loadReviews();
    loadDashboard();
  };
}

// Close Delete Modal
document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
  document.getElementById("deleteModal").style.display = "none";
});

// Function to save payment (called from main site when user completes payment)
function savePayment(member, plan, amount, method) {
  const payments = getAllPayments();
  payments.push({
    member: member,
    plan: plan,
    amount: amount,
    method: method,
    date: new Date().toISOString()
  });
  localStorage.setItem("payments", JSON.stringify(payments));
}

// Function to save review (called from main site)
function saveReview(name, rating, text) {
  const reviews = getAllReviews();
  reviews.push({
    name: name,
    rating: rating,
    text: text,
    date: new Date().toISOString()
  });
  localStorage.setItem("reviews", JSON.stringify(reviews));
}

// Get all announcements
function getAllAnnouncements() {
  const announcementsStr = localStorage.getItem("announcements");
  return announcementsStr ? JSON.parse(announcementsStr) : [];
}

// Load Announcements
function loadAnnouncements() {
  const announcements = getAllAnnouncements();
  const tbody = document.getElementById("announcementsTableBody");

  if (announcements.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>No announcements sent yet</td></tr>";
    return;
  }

  tbody.innerHTML = announcements.map((announcement, idx) => `
    <tr>
      <td data-label="Title">${announcement.title}</td>
      <td data-label="Message">${announcement.message.substring(0, 50)}${announcement.message.length > 50 ? "..." : ""}</td>
      <td data-label="Sent To">${announcement.sendTo === "all" ? "All Members" : announcement.sendTo.charAt(0).toUpperCase() + announcement.sendTo.slice(1) + " Members"}</td>
      <td data-label="Date">${new Date(announcement.date).toLocaleDateString()}</td>
      <td data-label="Actions">
        <button class="action-btn delete-btn" onclick="deleteAnnouncement(${idx})">
          <i class='bx bxs-trash'></i> Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// Send Announcement
function sendAnnouncement() {
  const title = document.getElementById("announcementTitle").value;
  const message = document.getElementById("announcementMsg").value;
  const sendTo = document.getElementById("sendToUsers").value;
  const msgDisplay = document.getElementById("announcementStatusMsg");

  // Validation
  if (!title || !message) {
    msgDisplay.textContent = "❌ Please fill in all fields!";
    msgDisplay.style.color = "red";
    return;
  }

  // Save announcement
  const announcements = getAllAnnouncements();
  announcements.push({
    title: title,
    message: message,
    sendTo: sendTo,
    date: new Date().toISOString()
  });
  localStorage.setItem("announcements", JSON.stringify(announcements));

  // Show success
  msgDisplay.textContent = "✅ Announcement sent successfully!";
  msgDisplay.style.color = "var(--main-color)";

  // Clear form
  document.getElementById("announcementTitle").value = "";
  document.getElementById("announcementMsg").value = "";
  document.getElementById("sendToUsers").value = "all";

  // Reload announcements table
  setTimeout(() => {
    loadAnnouncements();
    msgDisplay.textContent = "";
  }, 2000);
}

// Delete Announcement
function deleteAnnouncement(idx) {
  const announcements = getAllAnnouncements();
  document.getElementById("deleteMessage").textContent = `Are you sure you want to delete this announcement?`;
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.style.display = "flex";

  document.getElementById("confirmDeleteBtn").onclick = () => {
    announcements.splice(idx, 1);
    localStorage.setItem("announcements", JSON.stringify(announcements));
    deleteModal.style.display = "none";
    loadAnnouncements();
  };
}
