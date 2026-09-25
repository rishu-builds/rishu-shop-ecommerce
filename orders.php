<?php
require_once 'includes/config.php';
requireLogin();
$user = getCurrentUser();
$pdo = getDB();

$stmt = $pdo->prepare("
  SELECT o.*, p.name as product_name, p.images as product_images, p.price
  FROM orders o
  JOIN products p ON o.product_id = p.id
  WHERE o.user_id = ?
  ORDER BY o.created_at DESC
");
$stmt->execute([$user['id']]);
$orders = $stmt->fetchAll();

$statusSteps = ['Order Placed','Packed','Shipped','Out For Delivery','Delivered'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>My Orders - Rishu Shop</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--pink:#ff6b9d;--purple:#c44dff;--glass:rgba(255,255,255,0.08);--glass-border:rgba(255,255,255,0.15)}
body{font-family:'Nunito',sans-serif;min-height:100vh;width:100%;max-width:100vw;overflow-x:hidden;
  background:linear-gradient(160deg,#1a0533,#2d1b69 40%,#11234f 70%,#0d1b2a);color:#fff}
header{
  position:sticky;top:0;z-index:100;
  background:rgba(26,5,51,0.9);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,0.1);
  padding:12px 16px;display:flex;align-items:center;gap:12px;
}
.back-btn{
  background:rgba(255,255,255,0.1);border:none;border-radius:50%;
  width:36px;height:36px;display:flex;align-items:center;justify-content:center;
  color:#fff;cursor:pointer;text-decoration:none;
}
.back-btn:hover{background:rgba(255,255,255,0.2)}
header h1{font-family:'Playfair Display',serif;font-size:1.1rem;
  background:linear-gradient(135deg,#ff6b9d,#c44dff);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
main{padding:20px 14px 60px;max-width:600px;margin:0 auto}
.order-card{
  background:var(--glass);border:1px solid var(--glass-border);
  border-radius:20px;padding:18px;margin-bottom:18px;
  backdrop-filter:blur(12px);animation:cardIn .4s ease both;
}
@keyframes cardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.order-header{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}
.order-img{
  width:70px;height:70px;object-fit:cover;border-radius:12px;
  flex-shrink:0;border:1px solid rgba(255,255,255,0.1);
}
.order-meta{flex:1;min-width:0}
.order-name{font-size:1rem;font-weight:700;color:#fff;margin-bottom:4px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.order-price{
  font-size:1rem;font-weight:700;
  background:linear-gradient(135deg,var(--pink),var(--purple));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:4px;
}
.order-date{font-size:.8rem;color:rgba(255,255,255,0.45)}
.status-badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 12px;border-radius:20px;font-size:.8rem;font-weight:700;
  white-space:nowrap;
}
.badge-placed{background:rgba(100,150,255,0.2);color:#99bbff;border:1px solid rgba(100,150,255,0.3)}
.badge-packed{background:rgba(255,200,50,0.2);color:#ffd080;border:1px solid rgba(255,200,50,0.3)}
.badge-shipped{background:rgba(100,200,255,0.2);color:#80ddff;border:1px solid rgba(100,200,255,0.3)}
.badge-out{background:rgba(255,150,50,0.2);color:#ffb080;border:1px solid rgba(255,150,50,0.3)}
.badge-delivered{background:rgba(80,255,160,0.2);color:#80ffb0;border:1px solid rgba(80,255,160,0.3)}
/* TRACKER */
.tracker{display:flex;align-items:center;margin-top:14px;overflow-x:auto;padding-bottom:4px}
.tracker::-webkit-scrollbar{display:none}
.step{display:flex;flex-direction:column;align-items:center;flex:1;min-width:52px;position:relative}
.step:not(:last-child)::after{
  content:'';position:absolute;top:14px;left:50%;
  width:100%;height:2px;background:rgba(255,255,255,0.15);z-index:0;
}
.step.done:not(:last-child)::after{background:linear-gradient(90deg,var(--pink),var(--purple))}
.step-dot{
  width:28px;height:28px;border-radius:50%;z-index:1;
  background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.2);
  display:flex;align-items:center;justify-content:center;font-size:.7rem;
  transition:all .3s;
}
.step.done .step-dot{
  background:linear-gradient(135deg,var(--pink),var(--purple));
  border-color:transparent;box-shadow:0 0 12px rgba(255,107,157,0.4);
}
.step-label{font-size:.62rem;color:rgba(255,255,255,0.45);margin-top:5px;text-align:center;line-height:1.2;max-width:52px}
.step.done .step-label{color:rgba(255,255,255,0.8)}
.order-address{
  margin-top:14px;padding-top:14px;
  border-top:1px solid rgba(255,255,255,0.1);
  font-size:.82rem;color:rgba(255,255,255,0.5);display:flex;gap:8px;align-items:flex-start;
}
.order-address i{color:var(--pink);flex-shrink:0;margin-top:2px}
.empty{text-align:center;padding:80px 20px;color:rgba(255,255,255,0.4)}
.empty i{font-size:3rem;margin-bottom:16px;display:block}
.empty a{color:var(--pink);text-decoration:none;font-weight:700}
</style>
</head>
<body>
<header>
  <a href="shop.php" class="back-btn"><i class="fas fa-arrow-left"></i></a>
  <h1><i class="fas fa-box"></i> My Orders</h1>
</header>
<main>
  <?php if (empty($orders)): ?>
  <div class="empty">
    <i class="fas fa-box-open"></i>
    <p style="font-size:1.1rem;color:rgba(255,255,255,0.6);margin-bottom:8px">No orders yet</p>
    <p>Start shopping to see your orders here.</p>
    <a href="shop.php" style="display:inline-block;margin-top:16px;background:linear-gradient(135deg,#ff6b9d,#c44dff);color:#fff;padding:12px 28px;border-radius:12px;font-weight:700">Shop Now</a>
  </div>
  <?php else: ?>
  <?php foreach ($orders as $i => $order):
    $imgs = json_decode($order['product_images'], true);
    $img = $imgs[0] ?? '';
    $curStep = array_search($order['status'], $statusSteps);
    $stepIcons = ['fa-check','fa-box-open','fa-truck','fa-map-marker-alt','fa-circle-check'];
    
    $badgeClass = match($order['status']) {
      'Order Placed' => 'badge-placed',
      'Packed' => 'badge-packed',
      'Shipped' => 'badge-shipped',
      'Out For Delivery' => 'badge-out',
      'Delivered' => 'badge-delivered',
      default => 'badge-placed'
    };
  ?>
  <div class="order-card" style="animation-delay:<?= $i * 0.07 ?>s">
    <div class="order-header">
      <img class="order-img" src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($order['product_name']) ?>" onerror="this.src='https://via.placeholder.com/70'">
      <div class="order-meta">
        <div class="order-name"><?= htmlspecialchars($order['product_name']) ?></div>
        <div class="order-price">₹<?= number_format($order['total_price']) ?></div>
        <div class="order-date"><i class="fas fa-clock"></i> <?= date('d M Y, h:i A', strtotime($order['created_at'])) ?></div>
      </div>
      <span class="status-badge <?= $badgeClass ?>">
        <i class="fas <?= $stepIcons[$curStep !== false ? $curStep : 0] ?>"></i>
        <?= htmlspecialchars($order['status']) ?>
      </span>
    </div>

    <!-- Progress Tracker -->
    <div class="tracker">
      <?php foreach ($statusSteps as $j => $step): ?>
      <div class="step <?= $j <= $curStep ? 'done' : '' ?>">
        <div class="step-dot">
          <i class="fas <?= $stepIcons[$j] ?>"></i>
        </div>
        <div class="step-label"><?= $step ?></div>
      </div>
      <?php endforeach; ?>
    </div>

    <div class="order-address">
      <i class="fas fa-location-dot"></i>
      <span><?= htmlspecialchars($order['full_name']) ?>, <?= htmlspecialchars($order['address']) ?>, <?= htmlspecialchars($order['city']) ?>, <?= htmlspecialchars($order['state']) ?> - <?= htmlspecialchars($order['postal_code']) ?></span>
    </div>
  </div>
  <?php endforeach; ?>
  <?php endif; ?>
</main>
</body>
</html>
