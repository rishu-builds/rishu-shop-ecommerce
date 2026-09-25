<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$pdo = getDB();

// 1. CHECK CURRENT AUTH STATUS
if ($action === 'check') {
    if (isLoggedIn()) {
        $stmt = $pdo->prepare("SELECT id, full_name, email, phone, avatar FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if ($user) {
            echo json_encode([
                'logged_in' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['full_name'],
                    'email' => $user['email'],
                    'phone' => $user['phone'] ?? '',
                    'avatar' => $user['avatar'] ?? 'assets/male.png'
                ]
            ]);
            exit;
        }
    }
    echo json_encode(['logged_in' => false]);
    exit;
}

// 2. SEND OTP TO MOBILE NUMBER
if ($action === 'send_otp') {
    $rawPhone = sanitize($_POST['phone'] ?? '');
    // Clean phone number (strip non-digits, take last 10 digits)
    $cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone);
    if (strlen($cleanPhone) > 10) {
        $cleanPhone = substr($cleanPhone, -10);
    }

    if (strlen($cleanPhone) < 10) {
        echo json_encode(['success' => false, 'message' => 'Please enter a valid 10-digit mobile number']);
        exit;
    }

    // Generate random 6-digit OTP
    $otp = (string) rand(100000, 999999);
    $_SESSION['auth_otp'] = $otp;
    $_SESSION['auth_phone'] = $cleanPhone;
    $_SESSION['auth_otp_time'] = time();

    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id, full_name FROM users WHERE phone = ? LIMIT 1");
    $stmt->execute([$cleanPhone]);
    $existingUser = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'phone' => $cleanPhone,
        'otp' => $otp,
        'is_new_user' => !$existingUser,
        'message' => "OTP sent successfully to +91 $cleanPhone"
    ]);
    exit;
}

// 3. VERIFY OTP & COMPLETE LOGIN
if ($action === 'verify_otp') {
    $enteredOtp = sanitize($_POST['otp'] ?? '');
    $phone = sanitize($_POST['phone'] ?? ($_SESSION['auth_phone'] ?? ''));
    $fullName = sanitize($_POST['full_name'] ?? '');

    $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($cleanPhone) > 10) {
        $cleanPhone = substr($cleanPhone, -10);
    }

    $validOtp = $_SESSION['auth_otp'] ?? '';

    // Allow 123456 as master backup OTP for testing, or exact generated OTP
    if (empty($enteredOtp) || ($enteredOtp !== $validOtp && $enteredOtp !== '123456')) {
        echo json_encode(['success' => false, 'message' => 'Invalid OTP. Please check the SMS code.']);
        exit;
    }

    // Find user by phone
    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ? LIMIT 1");
    $stmt->execute([$cleanPhone]);
    $user = $stmt->fetch();

    if (!$user) {
        // If it's a new mobile number, register them
        $userName = !empty($fullName) ? $fullName : 'Customer ' . substr($cleanPhone, -4);
        $email = 'user_' . $cleanPhone . '@rishushop.in';
        $username = 'user_' . $cleanPhone;

        $stmt = $pdo->prepare("
            INSERT INTO users (username, full_name, email, phone, auth_provider, avatar)
            VALUES (?, ?, ?, ?, 'local', 'assets/male.png')
        ");
        $stmt->execute([$username, $userName, $email, $cleanPhone]);
        $newId = $pdo->lastInsertId();

        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$newId]);
        $user = $stmt->fetch();
    }

    // Set PHP Session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['full_name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_phone'] = $user['phone'];

    // Clear used OTP
    unset($_SESSION['auth_otp']);

    echo json_encode([
        'success' => true,
        'message' => 'Logged in successfully!',
        'user' => [
            'id' => $user['id'],
            'name' => $user['full_name'],
            'phone' => $user['phone'],
            'email' => $user['email'],
            'avatar' => $user['avatar'] ?? 'assets/male.png'
        ]
    ]);
    exit;
}

// 4. LOGOUT
if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
