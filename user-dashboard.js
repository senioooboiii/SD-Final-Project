// User Dashboard JavaScript

// Get current user
let currentUser = localStorage.getItem("currentUser") || "User";

// Initialize Dashboard
window.addEventListener("load", () => {
  loadDashboardData();
  setupEventListeners();
});

// Load Dashboard Data
function loadDashboardData() {
  const userPayments = getUserPayments(currentUser);
  const userMembership = getUserMembership(currentUser);
  const currentProfile = JSON.parse(localStorage.getItem(currentUser + '_profile')) || getDefaultProfile();

  // Get user data (contains email and phone from signup)
  let userData = {};
  try {
    const storedUserData = localStorage.getItem(currentUser);
    if (storedUserData) {
      userData = JSON.parse(storedUserData);
    }
  } catch (e) {
    // If not JSON, it's old format
    userData = {};
  }

  // Update Overview
  document.getElementById("overviewUsername").textContent = currentUser;
  document.getElementById("overviewPlan").textContent = userMembership.plan || "No Active Plan";
  document.getElementById("overviewDaysActive").textContent = userMembership.daysActive || "0";
  document.getElementById("overviewWorkouts").textContent = userMembership.workouts || "0";
  document.getElementById("overviewProgress").textContent = userMembership.progress || "0%";

  // Update Profile with stored data
  document.getElementById("profileFullName").textContent = currentProfile.fullName;
  document.getElementById("profileUsername").textContent = currentUser;
  document.getElementById("profileEmail").textContent = userData.email || currentProfile.email || "email@example.com";
  document.getElementById("profilePhone").textContent = userData.phone || currentProfile.phone || "+63 9XX XXX XXXX";
  document.getElementById("profileJoinDate").textContent = new Date().toLocaleDateString();
  document.getElementById("profileMemberId").textContent = "MEMBER ID: " + generateMemberID(currentUser);
  document.getElementById("profileAvatar").src = currentProfile.profileImage;

  // Update Membership Status
  if (userMembership.plan) {
    document.getElementById("membershipStatus").innerHTML = `
      <div class="status-active">
        <p><strong>Plan:</strong> ${userMembership.plan}</p>
        <p><strong>Status:</strong> <span style="color: #45ffca;">Active</span></p>
        <p><strong>Joined:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
    `;
  }

  // Update Payments Table
  loadPaymentsTable(userPayments);

  // Load Progress
  loadProgressStats();

  // Load Messages
  loadMessages();
}

// Get user-specific payments
function getUserPayments(username) {
  const allPayments = JSON.parse(localStorage.getItem("payments")) || [];
  return allPayments.filter(p => p.member === username);
}

// Get user membership
function getUserMembership(username) {
  const memberships = JSON.parse(localStorage.getItem("memberships")) || {};
  return memberships[username] || {};
}

// Generate unique Member ID
function generateMemberID(username) {
  return "SG" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Load Payments Table
function loadPaymentsTable(payments) {
  const tbody = document.getElementById("paymentsTableBody");

  if (payments.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align: center; padding: 2rem;'>No payment history yet</td></tr>";
    return;
  }

  tbody.innerHTML = payments.map(payment => `
    <tr>
      <td>${new Date(payment.date).toLocaleDateString()}</td>
      <td>${payment.plan}</td>
      <td>₱${payment.amount}</td>
      <td>${payment.method === "paypal" ? "PayPal" : payment.method === "credit" ? "Credit Card" : "GCash"}</td>
      <td><span class="status-badge completed">Completed</span></td>
    </tr>
  `).join("");
}

// Load Progress Stats
function loadProgressStats() {
  document.getElementById("goal1").textContent = "0%";
  document.getElementById("goal1-fill").style.width = "0%";
  
  document.getElementById("goal2").textContent = "0%";
  document.getElementById("goal2-fill").style.width = "0%";
  
  document.getElementById("goal3").textContent = "0%";
  document.getElementById("goal3-fill").style.width = "0%";

  document.getElementById("monthWorkouts").textContent = "0";
  document.getElementById("monthHours").textContent = "0";
  document.getElementById("monthCalories").textContent = "0";
  document.getElementById("monthBestDay").textContent = "-";
}

// Set up Event Listeners
function setupEventListeners() {
  // Sidebar navigation
  document.querySelectorAll(".dash-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-section");
      goToSection(section);
    });
  });

  // Logout
  document.getElementById("dashboardLogout").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });

  // Payment Modal Close
  document.getElementById("closePaymentModal").addEventListener("click", () => {
    document.getElementById("paymentModal").style.display = "none";
  });

  // Edit Profile Modal Close
  document.getElementById("closeEditProfileModal").addEventListener("click", () => {
    document.getElementById("editProfileModal").style.display = "none";
  });

  // Payment Form
  document.getElementById("dashboardPaymentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleDashboardPayment();
  });

  // Edit Profile Form
  document.getElementById("editProfileForm").addEventListener("submit", saveProfileChanges);

  // Profile Image Upload
  document.getElementById("profileImageInput").addEventListener("change", handleProfileImageUpload);
}

// Go to Section
function goToSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".dashboard-section").forEach(section => {
    section.classList.remove("active");
  });

  // Remove active from all buttons
  document.querySelectorAll(".dash-nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Show selected section
  document.getElementById(sectionName).classList.add("active");

  // Add active to button
  document.querySelector(`[data-section="${sectionName}"]`).classList.add("active");

  // Load section-specific data
  if (sectionName === "reviews") {
    loadUserReviews();
  }

  // Scroll to top
  document.querySelector(".dashboard-main").scrollTop = 0;
}

// Select Plan
function selectPlan(planName, amount) {
  document.getElementById("selectedPlan").value = planName;
  document.getElementById("selectedAmount").value = amount;
  document.getElementById("paymentPlanName").textContent = planName + " - ₱" + amount;
  document.getElementById("paymentMethod").value = "";
  document.getElementById("dashboardPaymentMessage").textContent = "";
  document.getElementById("paymentModal").style.display = "flex";
}

// Handle Dashboard Payment
function handleDashboardPayment() {
  const method = document.getElementById("paymentMethod").value;
  const plan = document.getElementById("selectedPlan").value;
  const amount = document.getElementById("selectedAmount").value;
  const message = document.getElementById("dashboardPaymentMessage");

  if (method === "") {
    message.textContent = "Please select a payment method.";
    message.style.color = "red";
    return;
  }

  // Save payment
  const payments = JSON.parse(localStorage.getItem("payments")) || [];
  payments.push({
    member: currentUser,
    plan: plan,
    amount: parseInt(amount),
    method: method,
    date: new Date().toISOString()
  });
  localStorage.setItem("payments", JSON.stringify(payments));

  // Update membership
  const memberships = JSON.parse(localStorage.getItem("memberships")) || {};
  memberships[currentUser] = {
    plan: plan,
    amount: amount,
    joinDate: new Date().toISOString(),
    daysActive: 0,
    workouts: 0,
    progress: "0%"
  };
  localStorage.setItem("memberships", JSON.stringify(memberships));

  // Show success
  message.textContent = "✓ Payment successful! Welcome to " + plan + " plan!";
  message.style.color = "#45ffca";

  setTimeout(() => {
    document.getElementById("paymentModal").style.display = "none";
    loadDashboardData();
    goToSection("overview");
  }, 2000);
}

// Edit Profile
function editProfile() {
  const modal = document.getElementById('editProfileModal');
  const currentProfile = JSON.parse(localStorage.getItem(currentUser + '_profile')) || getDefaultProfile();
  
  // Pre-fill form with current data
  document.getElementById('editFullName').value = currentProfile.fullName || currentUser;
  document.getElementById('editEmail').value = currentProfile.email || 'senio' + currentUser.toLowerCase() + '@gmail.com';
  document.getElementById('editPhone').value = currentProfile.phone || '+63 912 345 6789';
  
  // Load profile picture if exists
  if (currentProfile.profileImage) {
    document.getElementById('editProfileAvatarPreview').src = currentProfile.profileImage;
  }
  
  modal.style.display = 'flex';
}

// Get default profile data
function getDefaultProfile() {
  return {
    fullName: currentUser,
    email: 'senio' + currentUser.toLowerCase() + '@gmail.com',
    phone: '+63 912 345 6789',
    profileImage: 'https://via.placeholder.com/150'
  };
}

// Handle profile image upload
function handleProfileImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('editProfileAvatarPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Save Profile Changes
function saveProfileChanges(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('editFullName').value;
  const email = document.getElementById('editEmail').value;
  const phone = document.getElementById('editPhone').value;
  const profileImage = document.getElementById('editProfileAvatarPreview').src;
  const messageDisplay = document.getElementById('editProfileMessage');
  
  if (!fullName || !email || !phone) {
    messageDisplay.textContent = '❌ All fields are required!';
    messageDisplay.style.color = 'red';
    return;
  }
  
  // Save profile data to localStorage
  const profileData = {
    fullName: fullName,
    email: email,
    phone: phone,
    profileImage: profileImage
  };
  
  localStorage.setItem(currentUser + '_profile', JSON.stringify(profileData));
  
  messageDisplay.textContent = '✅ Profile updated successfully!';
  messageDisplay.style.color = '#45ffca';
  
  setTimeout(() => {
    document.getElementById('editProfileModal').style.display = 'none';
    loadDashboardData();
  }, 1500);
}

// Change Password
function changePassword() {
  const newPassword = prompt("Enter new password:");
  if (newPassword) {
    localStorage.setItem(currentUser, newPassword);
    alert("Password changed successfully!");
  }
}

// Delete Account
function deleteAccount() {
  if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
    if (confirm("This will permanently delete all your data. Continue?")) {
      localStorage.removeItem(currentUser);
      localStorage.removeItem("currentUser");
      alert("Account deleted successfully.");
      window.location.href = "index.html";
    }
  }
}

// Load Messages
function loadMessages() {
  const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
  const messagesList = document.getElementById("messagesList");

  // Filter messages for current user based on membership or "all"
  const userMembership = getUserMembership(currentUser);
  const userPlan = userMembership.plan ? userMembership.plan.toLowerCase() : null;

  const filteredMessages = announcements.filter(msg => {
    return msg.sendTo === "all" || msg.sendTo === userPlan;
  });

  if (filteredMessages.length === 0) {
    messagesList.innerHTML = "<p class=\"no-messages\">No messages yet</p>";
    return;
  }

  messagesList.innerHTML = filteredMessages.map((msg, idx) => `
    <div class="message-item">
      <div class="message-header">
        <h4>${msg.title}</h4>
        <small>${new Date(msg.date).toLocaleDateString()} ${new Date(msg.date).toLocaleTimeString()}</small>
      </div>
      <p class="message-content">${msg.message}</p>
      <span class="message-badge">${msg.sendTo === "all" ? "📢 All Members" : "📌 " + msg.sendTo.charAt(0).toUpperCase() + msg.sendTo.slice(1) + " Members"}</span>
    </div>
  `).join("");
}

// Submit User Review
function submitUserReview() {
  const rating = document.getElementById("userReviewRating").value;
  const reviewText = document.getElementById("userReviewText").value;
  const messageDisplay = document.getElementById("reviewSubmitMessage");

  if (!rating || !reviewText) {
    messageDisplay.textContent = "❌ Please fill in all fields!";
    messageDisplay.style.color = "red";
    return;
  }

  if (reviewText.trim().length < 5) {
    messageDisplay.textContent = "❌ Review must be at least 5 characters!";
    messageDisplay.style.color = "red";
    return;
  }

  // Save review
  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.push({
    name: currentUser,
    rating: parseInt(rating),
    text: reviewText,
    date: new Date().toISOString()
  });
  localStorage.setItem("reviews", JSON.stringify(reviews));

  messageDisplay.textContent = "✅ Review submitted successfully!";
  messageDisplay.style.color = "#45ffca";

  document.getElementById("userReviewRating").value = "";
  document.getElementById("userReviewText").value = "";

  setTimeout(() => {
    loadUserReviews();
    messageDisplay.textContent = "";
  }, 1500);
}

// Load User Reviews
function loadUserReviews() {
  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  const userReviewsList = document.getElementById("userReviewsList");

  // Filter reviews submitted by current user
  const userReviews = reviews.filter(review => review.name === currentUser);

  if (userReviews.length === 0) {
    userReviewsList.innerHTML = "<p>No reviews submitted yet</p>";
    return;
  }

  userReviewsList.innerHTML = userReviews.map((review, idx) => `
    <div class="review-card">
      <div class="review-header">
        <h4>${currentUser}</h4>
        <div class="review-rating">${"⭐".repeat(review.rating)}</div>
      </div>
      <p>${review.text}</p>
      <small>${new Date(review.date).toLocaleDateString()}</small>
      <button class="action-btn delete-btn" onclick="deleteUserReview(${idx})" style="margin-top: 1rem;">
        <i class='bx bxs-trash'></i> Delete
      </button>
    </div>
  `).join("");
}

// Delete User Review
function deleteUserReview(index) {
  if (confirm("Are you sure you want to delete this review?")) {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    const userReviews = reviews.filter(review => review.name === currentUser);
    
    // Get the actual index in the full reviews array
    let actualIndex = -1;
    let userCount = 0;
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].name === currentUser) {
        if (userCount === index) {
          actualIndex = i;
          break;
        }
        userCount++;
      }
    }

    if (actualIndex !== -1) {
      reviews.splice(actualIndex, 1);
      localStorage.setItem("reviews", JSON.stringify(reviews));
      loadUserReviews();
    }
  }
}

// Close modals when clicking outside
window.addEventListener("click", (event) => {
  const paymentModal = document.getElementById("paymentModal");
  const editProfileModal = document.getElementById("editProfileModal");
  
  if (event.target === paymentModal) {
    paymentModal.style.display = "none";
  }
  
  if (event.target === editProfileModal) {
    editProfileModal.style.display = "none";
  }
});
