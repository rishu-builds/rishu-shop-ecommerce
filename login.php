<?php
require_once 'includes/config.php';

// Handle Logout action if requested
if (isset($_GET['logout'])) {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    header('Location: login.php?loggedout=1');
    exit;
}

// Redirect target
$redirectUrl = isset($_GET['redirect']) ? sanitize($_GET['redirect']) : 'index.html';

// If already logged in, redirect to target
if (isLoggedIn() && !isset($_GET['switch'])) {
    header("Location: $redirectUrl");
    exit;
}

$error = '';
$success = '';
$pdo = getDB();

// Handle AJAX requests
if (isset($_POST['ajax_action'])) {
    header('Content-Type: application/json');
    $action = $_POST['ajax_action'];

    // 1. Request OTP
    if ($action === 'request_otp') {
        $identifier = sanitize($_POST['identifier'] ?? '');
        if (empty($identifier)) {
            echo json_encode(['success' => false, 'message' => 'Please enter Email or Mobile Number']);
            exit;
        }

        // Check if user exists
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR phone = ? OR username = ? LIMIT 1");
        $stmt->execute([$identifier, $identifier, $identifier]);
        $user = $stmt->fetch();

        // Default or generate test OTP
        $otp = '123456';
        $_SESSION['login_otp'] = $otp;
        $_SESSION['login_identifier'] = $identifier;
        $_SESSION['otp_time'] = time();

        if ($user) {
            $_SESSION['otp_user_id'] = $user['id'];
        } else {
            $_SESSION['otp_user_id'] = null; // New user will be registered upon OTP verify
        }

        echo json_encode([
            'success' => true,
            'is_new_user' => !$user,
            'otp' => $otp,
            'message' => "OTP sent successfully! (Test OTP: $otp)"
        ]);
        exit;
    }

    // 2. Verify OTP
    if ($action === 'verify_otp') {
        $enteredOtp = sanitize($_POST['otp'] ?? '');
        $storedOtp = $_SESSION['login_otp'] ?? '123456';
        $identifier = $_SESSION['login_identifier'] ?? sanitize($_POST['identifier'] ?? '');

        if (empty($enteredOtp) || $enteredOtp !== $storedOtp) {
            echo json_encode(['success' => false, 'message' => 'Invalid OTP. Please enter 123456']);
            exit;
        }

        // Find or create user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR phone = ? OR username = ? LIMIT 1");
        $stmt->execute([$identifier, $identifier, $identifier]);
        $user = $stmt->fetch();

        if (!$user) {
            // Auto-register new user via mobile/email
            $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
            $email = $isEmail ? $identifier : 'user_' . rand(1000, 9999) . '@rishushop.in';
            $phone = !$isEmail ? $identifier : '98765' . rand(10000, 99999);
            $fullName = sanitize($_POST['full_name'] ?? 'Rishu Shopper');
            $username = 'user_' . rand(10000, 99999);

            $stmt = $pdo->prepare("INSERT INTO users (username, full_name, email, phone, auth_provider, avatar) VALUES (?, ?, ?, ?, 'local', 'assets/male.png')");
            $stmt->execute([$username, $fullName, $email, $phone]);
            $userId = $pdo->lastInsertId();

            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
        }

        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_phone'] = $user['phone'] ?? '7607718791';

        echo json_encode([
            'success' => true,
            'redirect' => $redirectUrl,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'email' => $user['email'],
                'phone' => $user['phone'] ?? '7607718791'
            ]
        ]);
        exit;
    }

    // 3. Password Login
    if ($action === 'password_login') {
        $identifier = sanitize($_POST['identifier'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($identifier) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Please fill in both fields']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR phone = ? OR username = ? LIMIT 1");
        $stmt->execute([$identifier, $identifier, $identifier]);
        $user = $stmt->fetch();

        // Check password or fallback master password '123456'
        $passwordMatches = false;
        if ($user) {
            if ($password === '123456') {
                $passwordMatches = true;
            } elseif (!empty($user['password']) && password_verify($password, $user['password'])) {
                $passwordMatches = true;
            }
        }

        if ($passwordMatches) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_phone'] = $user['phone'] ?? '7607718791';

            echo json_encode([
                'success' => true,
                'redirect' => $redirectUrl,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['full_name'],
                    'email' => $user['email'],
                    'phone' => $user['phone'] ?? '7607718791'
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid Email/Mobile or Password']);
        }
        exit;
    }

    // 4. Quick 1-Click Login as Rishabh Yadav
    if ($action === 'quick_login_rishabh') {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute(['ysrishabh017@gmail.com']);
        $user = $stmt->fetch();

        if (!$user) {
            $pdo->prepare("INSERT INTO users (id, username, full_name, email, phone, auth_provider, avatar) VALUES (1, 'rishabh', 'Rishabh Yadav', 'ysrishabh017@gmail.com', '7607718791', 'local', 'assets/male.png')")->execute();
            $stmt->execute(['ysrishabh017@gmail.com']);
            $user = $stmt->fetch();
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_phone'] = $user['phone'] ?? '7607718791';

        echo json_encode([
            'success' => true,
            'redirect' => $redirectUrl,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'email' => $user['email'],
                'phone' => '7607718791'
            ]
        ]);
        exit;
    }

    // 5. Sign Up / Register
    if ($action === 'register') {
        $fullName = sanitize($_POST['full_name'] ?? '');
        $identifier = sanitize($_POST['identifier'] ?? '');
        $password = $_POST['password'] ?? '123456';

        if (empty($fullName) || empty($identifier)) {
            echo json_encode(['success' => false, 'message' => 'Name and Mobile/Email are required']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1");
        $stmt->execute([$identifier, $identifier]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'User already exists. Please login.']);
            exit;
        }

        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $email = $isEmail ? $identifier : 'user_' . rand(1000, 9999) . '@rishushop.in';
        $phone = !$isEmail ? $identifier : '76077' . rand(10000, 99999);
        $username = 'user_' . rand(10000, 99999);
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO users (username, full_name, email, phone, password, auth_provider, avatar) VALUES (?, ?, ?, ?, ?, 'local', 'assets/male.png')");
        $stmt->execute([$username, $fullName, $email, $phone, $hash]);
        $newId = $pdo->lastInsertId();

        $_SESSION['user_id'] = $newId;
        $_SESSION['user_name'] = $fullName;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_phone'] = $phone;

        echo json_encode([
            'success' => true,
            'redirect' => $redirectUrl,
            'user' => [
                'id' => $newId,
                'name' => $fullName,
                'email' => $email,
                'phone' => $phone
            ]
        ]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rishu Shop — Login / Sign In</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
/* ==========================================================================
   FLIPKART OFFICIAL SIGNATURE LOGIN STYLES
   ========================================================================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f1f3f6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #212121;
}

/* FLIPKART TOP HEADER */
.fk-top-header {
  background-color: #2874f0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 1px 0 rgba(0,0,0,.16);
  position: relative;
  z-index: 10;
}
.fk-header-inner {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.fk-brand {
  display: flex;
  flex-direction: column;
  text-decoration: none;
}
.fk-brand-name {
  font-size: 20px;
  font-style: italic;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.fk-brand-sub {
  font-size: 11px;
  color: #fff;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 3px;
}
.fk-brand-sub span { color: #ffe500; font-weight: 700; }
.fk-close-btn {
  color: #fff;
  text-decoration: none;
  font-size: 20px;
  padding: 6px;
  cursor: pointer;
}

/* MAIN CONTAINER */
.fk-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

/* FLIPKART SPLIT CARD */
.fk-login-card {
  width: 750px;
  max-width: 100%;
  min-height: 500px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 16px 0 rgba(0,0,0,.15);
  display: flex;
  overflow: hidden;
  position: relative;
  animation: cardFadeIn 0.3s ease-out;
}
@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* LEFT BLUE PANEL */
.fk-left-panel {
  width: 290px;
  background-color: #2874f0;
  padding: 40px 33px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.fk-left-panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: radial-gradient(circle at 50% 120%, rgba(255,255,255,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.fk-left-title {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 16px;
}
.fk-left-subtitle {
  font-size: 15px;
  line-height: 1.5;
  color: #dbdbdb;
  font-weight: 400;
}
.fk-left-illustration {
  margin-top: auto;
  text-align: center;
  position: relative;
  z-index: 2;
}
.fk-illustration-svg {
  width: 140px;
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
}

/* RIGHT FORM PANEL */
.fk-right-panel {
  flex: 1;
  padding: 40px 35px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
}

/* FORM WRAPPER */
.fk-form-view {
  display: none;
  animation: viewFadeIn 0.25s ease-out;
}
.fk-form-view.active {
  display: block;
}
@keyframes viewFadeIn {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* FLOATING INPUT GROUP */
.fk-input-group {
  position: relative;
  margin-bottom: 24px;
}
.fk-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px 0;
  font-size: 15px;
  color: #212121;
  outline: none;
  font-family: inherit;
  background: transparent;
  transition: border-color 0.2s;
}
.fk-input:focus {
  border-bottom: 2px solid #2874f0;
}
.fk-label {
  position: absolute;
  top: 10px;
  left: 0;
  font-size: 15px;
  color: #878787;
  pointer-events: none;
  transition: all 0.2s ease;
}
.fk-input:focus ~ .fk-label,
.fk-input:not(:placeholder-shown) ~ .fk-label {
  top: -12px;
  font-size: 11px;
  color: #878787;
}

/* TERMS NOTICE */
.fk-terms-text {
  font-size: 12px;
  color: #878787;
  line-height: 1.5;
  margin-bottom: 20px;
}
.fk-terms-text a {
  color: #2874f0;
  text-decoration: none;
}

/* PRIMARY BUTTON: FLIPKART ORANGE */
.fk-btn-primary {
  width: 100%;
  height: 48px;
  background: #fb641b;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,.2);
  border: none;
  border-radius: 2px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s, box-shadow 0.2s;
}
.fk-btn-primary:hover {
  background: #e55b18;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.25);
}
.fk-btn-primary:disabled {
  background: #f0a079;
  cursor: not-allowed;
}

/* SECONDARY BUTTON: WHITE WITH BLUE TEXT */
.fk-btn-secondary {
  width: 100%;
  height: 48px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #2874f0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.08);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
}
.fk-btn-secondary:hover {
  background: #fafafa;
  box-shadow: 0 2px 6px 0 rgba(0,0,0,.15);
}

/* OR DIVIDER */
.fk-or-divider {
  text-align: center;
  margin: 18px 0;
  position: relative;
}
.fk-or-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e0e0;
  z-index: 1;
}
.fk-or-text {
  display: inline-block;
  background: #fff;
  padding: 0 14px;
  color: #878787;
  font-size: 13px;
  position: relative;
  z-index: 2;
}

/* 1-CLICK FAST LOGIN CHIP */
.fk-quick-chip {
  background: #f1f7ff;
  border: 1px dashed #2874f0;
  border-radius: 6px;
  padding: 12px 14px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
}
.fk-quick-chip:hover {
  background: #e6f0ff;
  border-color: #125cdb;
  transform: translateY(-1px);
}
.fk-quick-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fk-quick-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2874f0;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fk-quick-name {
  font-size: 13px;
  font-weight: 700;
  color: #212121;
}
.fk-quick-phone {
  font-size: 11px;
  color: #878787;
}

/* OTP BOXES */
.fk-otp-boxes {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}
.fk-otp-digit {
  width: 44px;
  height: 48px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  border: 1px solid #c2c2c2;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}
.fk-otp-digit:focus {
  border-color: #2874f0;
  box-shadow: 0 0 4px rgba(40,116,240,0.3);
}

/* RESEND TIMER */
.fk-timer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #878787;
  margin-bottom: 20px;
}
.fk-resend-link {
  color: #2874f0;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}

/* ERROR / ALERT MESSAGE */
.fk-alert {
  padding: 10px 14px;
  font-size: 13px;
  border-radius: 2px;
  margin-bottom: 18px;
  display: none;
  align-items: center;
  gap: 8px;
}
.fk-alert-error {
  background: #ffebe8;
  border: 1px solid #ffd1c9;
  color: #d32f2f;
}
.fk-alert-success {
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  color: #2e7d32;
}

/* FOOTER LINK */
.fk-card-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 14px;
}
.fk-footer-link {
  font-size: 14px;
  color: #2874f0;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.fk-footer-link:hover {
  text-decoration: underline;
}

/* RESPONSIVE FLIPKART MOBILE */
@media (max-width: 680px) {
  .fk-login-card {
    flex-direction: column;
    width: 100%;
    min-height: auto;
    border-radius: 0;
    box-shadow: none;
  }
  .fk-left-panel {
    width: 100%;
    padding: 24px 20px;
  }
  .fk-left-title { font-size: 22px; }
  .fk-left-illustration { display: none; }
  .fk-right-panel {
    padding: 24px 20px;
  }
}
</style>
</head>
<body>

<!-- Flipkart Top Header -->
<header class="fk-top-header">
  <div class="fk-header-inner">
    <a href="index.html" class="fk-brand">
      <span class="fk-brand-name">Rishu Shop</span>
      <span class="fk-brand-sub">Explore <span>Plus ✦</span></span>
    </a>
    <a href="index.html" class="fk-close-btn" title="Back to Store"><i class="fa-solid fa-xmark"></i></a>
  </div>
</header>

<!-- Main Container -->
<main class="fk-main">
  <div class="fk-login-card">

    <!-- LEFT BLUE PANEL -->
    <div class="fk-left-panel">
      <div>
        <h1 class="fk-left-title" id="leftPanelTitle">Login</h1>
        <p class="fk-left-subtitle" id="leftPanelSubtitle">Get access to your Orders, Wishlist and Recommendations</p>
      </div>

      <!-- Flipkart-Style Shopping Illustration -->
      <div class="fk-left-illustration">
        <svg class="fk-illustration-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.08)"/>
          <path d="M60 70 L140 70 L130 140 L70 140 Z" fill="#ffffff" fill-opacity="0.9"/>
          <path d="M85 70 C85 50 115 50 115 70" stroke="#2874f0" stroke-width="6" stroke-linecap="round"/>
          <polygon points="100,85 106,97 120,99 109,109 112,122 100,115 88,122 91,109 80,99 94,97" fill="#ffe500"/>
        </svg>
      </div>
    </div>

    <!-- RIGHT FORM PANEL -->
    <div class="fk-right-panel">

      <!-- Alert Box -->
      <div class="fk-alert" id="alertBox"></div>

      <!-- ==============================================
           VIEW 1: IDENTIFIER FORM (Mobile/Email + Request OTP)
           ============================================== -->
      <div class="fk-form-view active" id="viewIdentifier">
        <div style="display:flex;align-items:center;border-bottom:2px solid #2874f0;margin-bottom:24px;padding-bottom:6px">
          <span style="font-size:16px;font-weight:700;color:#212121;margin-right:10px">+91</span>
          <input type="tel" id="inputIdentifier" maxlength="10" placeholder="Enter 10-digit Mobile Number" style="border:none;outline:none;font-size:16px;color:#212121;width:100%;font-weight:600;letter-spacing:1px" autocomplete="tel">
        </div>

        <p class="fk-terms-text">
          By continuing, you agree to Rishu Shop's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>

        <button type="button" class="fk-btn-primary" id="btnRequestOtp" onclick="handleRequestOtp()">
          Request OTP
        </button>

        <div class="fk-or-divider">
          <span class="fk-or-text">OR</span>
        </div>

        <button type="button" class="fk-btn-secondary" onclick="switchView('viewPassword')">
          Login with Password
        </button>

        <div class="fk-card-footer">
          <a class="fk-footer-link" onclick="switchView('viewRegister')">New to Rishu Shop? Create an account</a>
        </div>
      </div>

      <!-- ==============================================
           VIEW 2: OTP VERIFICATION VIEW
           ============================================== -->
      <div class="fk-form-view" id="viewOtp">
        <p style="font-size:13px;color:#878787;margin-bottom:12px">
          Please enter the OTP sent to <strong id="otpDisplayTarget" style="color:#212121">+91 7607718791</strong>
          <span style="color:#2874f0;cursor:pointer;margin-left:6px;font-weight:600" onclick="switchView('viewIdentifier')">Change</span>
        </p>

        <div class="fk-otp-boxes">
          <input type="text" maxlength="1" class="fk-otp-digit" id="otp1" value="1">
          <input type="text" maxlength="1" class="fk-otp-digit" id="otp2" value="2">
          <input type="text" maxlength="1" class="fk-otp-digit" id="otp3" value="3">
          <input type="text" maxlength="1" class="fk-otp-digit" id="otp4" value="4">
          <input type="text" maxlength="1" class="fk-otp-digit" id="otp5" value="5">
          <input type="text" maxlength="1" class="fk-otp-digit" id="otp6" value="6">
        </div>

        <div class="fk-timer-row">
          <span id="otpTimerText">Resend OTP in <strong id="otpTimerVal" style="color:#212121">00:25</strong></span>
          <a class="fk-resend-link" id="btnResendOtp" style="display:none" onclick="handleRequestOtp()">Resend OTP</a>
        </div>

        <button type="button" class="fk-btn-primary" id="btnVerifyOtp" onclick="handleVerifyOtp()">
          Verify & Log In
        </button>

        <button type="button" class="fk-btn-secondary" onclick="switchView('viewPassword')">
          Login with Password instead
        </button>
      </div>

      <!-- ==============================================
           VIEW 3: PASSWORD LOGIN VIEW
           ============================================== -->
      <div class="fk-form-view" id="viewPassword">
        <div class="fk-input-group">
          <input type="text" id="inputPassIdentifier" class="fk-input" placeholder=" " value="ysrishabh017@gmail.com">
          <label class="fk-label">Enter Email/Mobile number</label>
        </div>

        <div class="fk-input-group">
          <input type="password" id="inputPassword" class="fk-input" placeholder=" " value="123456">
          <label class="fk-label">Enter Password</label>
          <i class="fa-regular fa-eye" id="togglePassEye" style="position:absolute;right:0;top:12px;color:#878787;cursor:pointer" onclick="togglePasswordVisibility()"></i>
        </div>

        <p class="fk-terms-text">
          By continuing, you agree to Rishu Shop's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>

        <button type="button" class="fk-btn-primary" id="btnPassLogin" onclick="handlePasswordLogin()">
          Log In
        </button>

        <div class="fk-or-divider">
          <span class="fk-or-text">OR</span>
        </div>

        <button type="button" class="fk-btn-secondary" onclick="switchView('viewIdentifier')">
          Request OTP
        </button>

        <div class="fk-card-footer">
          <a class="fk-footer-link" onclick="switchView('viewRegister')">New to Rishu Shop? Create an account</a>
        </div>
      </div>

      <!-- ==============================================
           VIEW 4: CREATE ACCOUNT (SIGN UP)
           ============================================== -->
      <div class="fk-form-view" id="viewRegister">
        <div class="fk-input-group">
          <input type="text" id="regFullName" class="fk-input" placeholder=" " value="Rishabh Yadav">
          <label class="fk-label">Enter Full Name</label>
        </div>

        <div class="fk-input-group">
          <input type="text" id="regIdentifier" class="fk-input" placeholder=" " value="7607718791">
          <label class="fk-label">Enter Mobile Number or Email</label>
        </div>

        <div class="fk-input-group">
          <input type="password" id="regPassword" class="fk-input" placeholder=" " value="123456">
          <label class="fk-label">Set Password</label>
        </div>

        <p class="fk-terms-text">
          By continuing, you agree to Rishu Shop's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>

        <button type="button" class="fk-btn-primary" id="btnRegister" onclick="handleRegister()">
          Continue
        </button>

        <button type="button" class="fk-btn-secondary" onclick="switchView('viewIdentifier')">
          Existing User? Log In
        </button>
      </div>

    </div>
  </div>
</main>

<script>
// Target redirect after login
const REDIRECT_URL = "<?= htmlspecialchars($redirectUrl) ?>";

// Switch between views
function switchView(viewId) {
  clearAlert();
  document.querySelectorAll('.fk-form-view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');

  const title = document.getElementById('leftPanelTitle');
  const sub = document.getElementById('leftPanelSubtitle');

  if (viewId === 'viewRegister') {
    title.textContent = "Looks like you're new here!";
    sub.textContent = "Sign up with your mobile number or email to get started";
  } else if (viewId === 'viewOtp') {
    title.textContent = "Verification";
    sub.textContent = "We have sent an OTP to your mobile/email for instant verification";
  } else {
    title.textContent = "Login";
    sub.textContent = "Get access to your Orders, Wishlist and Recommendations";
  }
}

// Alert helper
function showAlert(msg, isSuccess = false) {
  const box = document.getElementById('alertBox');
  box.className = 'fk-alert ' + (isSuccess ? 'fk-alert-success' : 'fk-alert-error');
  box.innerHTML = `<i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${msg}</span>`;
  box.style.display = 'flex';
}
function clearAlert() {
  const box = document.getElementById('alertBox');
  box.style.display = 'none';
}

// Toggle password visibility
function togglePasswordVisibility() {
  const input = document.getElementById('inputPassword');
  const eye = document.getElementById('togglePassEye');
  if (input.type === 'password') {
    input.type = 'text';
    eye.className = 'fa-regular fa-eye-slash';
  } else {
    input.type = 'password';
    eye.className = 'fa-regular fa-eye';
  }
}

// Request OTP
async function handleRequestOtp() {
  clearAlert();
  const idInput = document.getElementById('inputIdentifier');
  const identifier = idInput.value.trim();

  if (!identifier) {
    showAlert('Please enter a valid Mobile Number or Email');
    idInput.focus();
    return;
  }

  const btn = document.getElementById('btnRequestOtp');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...`;

  try {
    const formData = new FormData();
    formData.append('ajax_action', 'request_otp');
    formData.append('identifier', identifier);

    const res = await fetch('login.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      document.getElementById('otpDisplayTarget').textContent = identifier;
      switchView('viewOtp');
      showAlert(data.message, true);
      startOtpTimer();
      setupOtpInputListeners();
    } else {
      showAlert(data.message || 'Failed to send OTP');
    }
  } catch (err) {
    showAlert('Server error. Test OTP is 123456');
    document.getElementById('otpDisplayTarget').textContent = identifier;
    switchView('viewOtp');
    startOtpTimer();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Request OTP';
  }
}

// OTP Input Key Listener
function setupOtpInputListeners() {
  const inputs = document.querySelectorAll('.fk-otp-digit');
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
  inputs[0].focus();
}

// OTP Timer Countdown
let timerInterval = null;
function startOtpTimer() {
  if (timerInterval) clearInterval(timerInterval);
  let seconds = 25;
  const timerText = document.getElementById('otpTimerText');
  const timerVal = document.getElementById('otpTimerVal');
  const resendBtn = document.getElementById('btnResendOtp');

  timerText.style.display = 'inline';
  resendBtn.style.display = 'none';

  timerInterval = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(timerInterval);
      timerText.style.display = 'none';
      resendBtn.style.display = 'inline';
    } else {
      timerVal.textContent = `00:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

// Verify OTP
async function handleVerifyOtp() {
  clearAlert();
  const digits = Array.from(document.querySelectorAll('.fk-otp-digit')).map(i => i.value).join('');

  if (digits.length < 6) {
    showAlert('Please enter all 6 digits of OTP (Test: 123456)');
    return;
  }

  const btn = document.getElementById('btnVerifyOtp');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;

  try {
    const formData = new FormData();
    formData.append('ajax_action', 'verify_otp');
    formData.append('otp', digits);

    const res = await fetch('login.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      showAlert('OTP Verified! Logging you in...', true);
      if (data.user) {
        localStorage.setItem('rishu_logged_in_user', JSON.stringify(data.user));
      }
      setTimeout(() => {
        window.location.href = data.redirect || REDIRECT_URL;
      }, 600);
    } else {
      showAlert(data.message || 'Invalid OTP');
      btn.disabled = false;
      btn.textContent = 'Verify & Log In';
    }
  } catch (err) {
    showAlert('Connection error. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Verify & Log In';
  }
}

// Password Login
async function handlePasswordLogin() {
  clearAlert();
  const identifier = document.getElementById('inputPassIdentifier').value.trim();
  const password = document.getElementById('inputPassword').value;

  if (!identifier || !password) {
    showAlert('Please enter both Email/Mobile and Password');
    return;
  }

  const btn = document.getElementById('btnPassLogin');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging in...`;

  try {
    const formData = new FormData();
    formData.append('ajax_action', 'password_login');
    formData.append('identifier', identifier);
    formData.append('password', password);

    const res = await fetch('login.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      showAlert('Login successful! Redirecting...', true);
      if (data.user) {
        localStorage.setItem('rishu_logged_in_user', JSON.stringify(data.user));
      }
      setTimeout(() => {
        window.location.href = data.redirect || REDIRECT_URL;
      }, 500);
    } else {
      showAlert(data.message || 'Invalid credentials');
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  } catch (err) {
    showAlert('Server error. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Log In';
  }
}

// Quick 1-Click Login as Rishabh
async function handleQuickLoginRishabh() {
  clearAlert();
  try {
    const formData = new FormData();
    formData.append('ajax_action', 'quick_login_rishabh');

    const res = await fetch('login.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      showAlert('Welcome back, Rishabh! Redirecting...', true);
      if (data.user) {
        localStorage.setItem('rishu_logged_in_user', JSON.stringify(data.user));
      }
      setTimeout(() => {
        window.location.href = data.redirect || REDIRECT_URL;
      }, 500);
    }
  } catch (err) {
    window.location.href = REDIRECT_URL;
  }
}

// Sign Up / Register
async function handleRegister() {
  clearAlert();
  const fullName = document.getElementById('regFullName').value.trim();
  const identifier = document.getElementById('regIdentifier').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!fullName || !identifier) {
    showAlert('Name and Mobile/Email are required');
    return;
  }

  const btn = document.getElementById('btnRegister');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;

  try {
    const formData = new FormData();
    formData.append('ajax_action', 'register');
    formData.append('full_name', fullName);
    formData.append('identifier', identifier);
    formData.append('password', password);

    const res = await fetch('login.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      showAlert('Account created successfully! Welcome to Rishu Shop.', true);
      if (data.user) {
        localStorage.setItem('rishu_logged_in_user', JSON.stringify(data.user));
      }
      setTimeout(() => {
        window.location.href = data.redirect || REDIRECT_URL;
      }, 600);
    } else {
      showAlert(data.message || 'Failed to register');
      btn.disabled = false;
      btn.textContent = 'Continue';
    }
  } catch (err) {
    showAlert('Server error. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Continue';
  }
}
</script>
</body>
</html>
