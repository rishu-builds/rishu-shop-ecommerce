<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

// Handle order placement from storefront
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || empty($data['items'])) {
    echo json_encode(['success' => false, 'error' => 'No items in order']);
    exit;
}

$pdo = getDB();

$fullName = sanitize($data['full_name'] ?? 'Rishabh Yadav');
$phone = sanitize($data['phone'] ?? '7607718791');
$address = sanitize($data['address'] ?? 'Ayodhya, Uttar Pradesh');
$city = sanitize($data['city'] ?? 'Ayodhya');
$state = sanitize($data['state'] ?? 'Uttar Pradesh');
$postalCode = sanitize($data['postal_code'] ?? '224001');
$paymentMethod = sanitize($data['payment_method'] ?? 'Cash On Delivery');
$totalPrice = floatval($data['total_price'] ?? 0);

// Get current user id or default to Rishabh (user 1)
$userId = 1;
if (isLoggedIn()) {
    $userId = $_SESSION['user_id'];
} else {
    // Check if user exists with this email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute(['ysrishabh017@gmail.com']);
    $user = $stmt->fetch();
    if ($user) {
        $userId = $user['id'];
    }
}

// Generate unique order code
$orderCode = 'RS-' . rand(10000, 99999);
$createdOrderIds = [];

// Insert into orders table for each item
foreach ($data['items'] as $item) {
    $productId = intval($item['product_id'] ?? 1);
    if ($productId < 1 || $productId > 10) {
        $productId = 1; // Fallback to valid product id
    }
    $qty = intval($item['quantity'] ?? 1);
    $itemPrice = floatval($item['price'] ?? 999);
    $itemTotal = $itemPrice * $qty;
    $size = sanitize($item['size'] ?? 'M');

    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, product_id, full_name, phone, address, city, state, postal_code, payment_method, quantity, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed')
    ");
    $stmt->execute([
        $userId,
        $productId,
        $fullName,
        $phone,
        $address . " [Size: $size | Code: $orderCode]",
        $city,
        $state,
        $postalCode,
        $paymentMethod,
        $qty,
        $itemTotal
    ]);
    $createdOrderIds[] = $pdo->lastInsertId();
}

echo json_encode([
    'success' => true,
    'order_code' => $orderCode,
    'order_id' => $createdOrderIds[0] ?? rand(100, 999),
    'order_ids' => $createdOrderIds,
    'total_price' => $totalPrice,
    'status' => 'Order Placed',
    'created_at' => date('Y-m-d H:i:s'),
    'delivery_date' => date('d M Y', strtotime('+4 days'))
]);
