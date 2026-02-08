/* ================= CONFIG ================= */
const API_URL =
  "https://script.google.com/macros/s/AKfycbzaEUxnSibtnnCQIfywK3CpW_XpMfij2qDb8KtMIIs-9zLDgzB0kcSkvKbKmVWfQ0T0yQ/exec";

/* ================= DOM ELEMENTS ================= */
const signinBox = document.getElementById("signinBox");
const signupBox = document.getElementById("signupBox");
const forgotBox = document.getElementById("forgotBox");

/* ================= UI TOGGLE ================= */
function showSignup() {
  signinBox.classList.add("hidden");
  forgotBox.classList.add("hidden");
  signupBox.classList.remove("hidden");
}

function showSignin() {
  signupBox.classList.add("hidden");
  forgotBox.classList.add("hidden");
  signinBox.classList.remove("hidden");
}

function showForgot() {
  signinBox.classList.add("hidden");
  signupBox.classList.add("hidden");
  forgotBox.classList.remove("hidden");
}

/* ================= SIGN UP ================= */
function signup() {
  const msg = document.getElementById("signupMsg");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    msg.innerText = "All fields are required";
    msg.style.color = "red";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "signup",
      name: name,
      email: email,
      password: password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        msg.innerText = "Account created. Please sign in.";
        msg.style.color = "green";

        // ⏩ auto switch to login page
        setTimeout(() => {
          showSignin();
        }, 800);

      } else {
        msg.innerText = data.message || "Signup failed";
        msg.style.color = "red";
      }
    })
    .catch(() => {
      msg.innerText = "Server error";
      msg.style.color = "red";
    });
}

/* ================= SIGN IN ================= */
function login() {
  const msg = document.getElementById("loginMsg");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    msg.innerText = "Please enter email and password";
    msg.style.color = "red";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      email: email,
      password: password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {

        // ✅ SAVE USER NAME (NOT EMAIL)
        localStorage.setItem(
          "userName",
          data.fullname || email
        );

        msg.innerText = "Login successful";
        msg.style.color = "green";

        setTimeout(() => {
          window.location.href = "home.html";
        }, 500);

      } else {
        msg.innerText = data.message || "Invalid email or password";
        msg.style.color = "red";
      }
    })
    .catch(() => {
      msg.innerText = "Server error. Try again.";
      msg.style.color = "red";
    });
}


/* ================= SEND OTP ================= */
function sendOTP() {
  const email = document.getElementById("fpEmail").value.trim();
  const msg = document.getElementById("fpMsg");

  if (!email) {
    msg.innerText = "Enter your registered email";
    msg.style.color = "red";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "sendOTP",
      email: email
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        msg.innerText = "OTP sent to your email";
        msg.style.color = "green";

        document.getElementById("fpOTP").classList.remove("hidden");
        document.getElementById("fpNewPass").classList.remove("hidden");
        document.getElementById("resetBtn").classList.remove("hidden");
      } else {
        msg.innerText = data.message || "Failed to send OTP";
        msg.style.color = "red";
      }
    })
    .catch(() => {
      msg.innerText = "Server error";
      msg.style.color = "red";
    });
}

/* ================= RESET PASSWORD ================= */
function resetPassword() {
  const email = document.getElementById("fpEmail").value.trim();
  const otp = document.getElementById("fpOTP").value.trim();
  const pass = document.getElementById("fpNewPass").value.trim();
  const msg = document.getElementById("fpMsg");

  if (!otp || !pass) {
    msg.innerText = "Enter OTP and new password";
    msg.style.color = "red";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "resetPassword",
      email: email,
      otp: otp,
      password: pass
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        msg.innerText = "Password reset successfully. Please sign in.";
        msg.style.color = "green";

        // ⏩ auto go to sign in
        setTimeout(() => {
          showSignin();
        }, 1000);

      } else {
        msg.innerText = data.message || "Invalid OTP";
        msg.style.color = "red";
      }
    })
    .catch(() => {
      msg.innerText = "Server error";
      msg.style.color = "red";
    });
}

