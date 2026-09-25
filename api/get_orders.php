<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

$pdo = getDB();
$userId = 1;
if (isLoggedIn()) {
    $userId = $_SESSION['user_id'];
}

$stmt = $pdo->prepare("
    SELECT o.*, p.name as product_name, p.images as product_images, p.category as product_category
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
");
$stmt->execute([$userId]);
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'orders' => $orders
]);
