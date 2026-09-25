<?php
// ============================================
// RISHU SHOP - Configuration
// ============================================

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: 'rishu_shop');

// Google OAuth Configuration
// Get these from Google Cloud Console > APIs & Services > Credentials
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: 'YOUR_GOOGLE_CLIENT_SECRET');
define('GOOGLE_REDIRECT_URI', getenv('GOOGLE_REDIRECT_URI') ?: 'https://rishu-shop.rf.gd/oauth/google-callback.php');
// Change the above URI to your actual domain when deploying

// App Configuration
define('APP_NAME', 'Rishu Shop');
define('APP_URL', 'https://YOUR_DOMAIN');
define('SESSION_TIMEOUT', 3600); // 1 hour

// Start secure session
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_strict_mode', 1);
    session_start();
}

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        // Fast probe: check if MySQL is running on port 3306 without blocking
        $mysqlAvailable = false;
        $probe = @fsockopen(DB_HOST, 3306, $errno, $errstr, 0.05);
        if (is_resource($probe)) {
            $mysqlAvailable = true;
            fclose($probe);
        }

        if ($mysqlAvailable) {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
                return $pdo;
            } catch (PDOException $e) {
                // Fallback to local SQLite below
            }
        }

        // 2. Auto-Fallback to Local Database (Self-Healing on any machine)
        $sqlitePath = __DIR__ . '/rishu_shop.sqlite';
        try {
            $pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $sqle) {
            die(json_encode(['error' => 'Database connection failed: ' . $sqle->getMessage()]));
        }
    }
    return $pdo;
}

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Require user login
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

// Check if admin is logged in
function isAdminLoggedIn() {
    return isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id']);
}

// Require admin login
function requireAdminLogin() {
    if (!isAdminLoggedIn()) {
        header('Location: admin-login.php');
        exit;
    }
}

// Sanitize input
function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Get current user data
function getCurrentUser() {
    if (!isLoggedIn()) return null;
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

// Get support WhatsApp number
function getSupportNumber() {
    $pdo = getDB();
    $stmt = $pdo->query("SELECT whatsapp_number FROM support_settings LIMIT 1");
    $row = $stmt->fetch();
    return $row ? $row['whatsapp_number'] : '919876543210';
}
?>
