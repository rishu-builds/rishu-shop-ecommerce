<?php
require_once 'includes/config.php';
requireLogin();
$user = getCurrentUser();
$supportNumber = getSupportNumber();
$pdo = getDB();

// Get products
$products = $pdo->query("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC")->fetchAll();

// Get wishlist IDs for current user
$wishlistStmt = $pdo->prepare("SELECT product_id FROM wishlist WHERE user_id = ?");
$wishlistStmt->execute([$user['id']]);
$wishlistIds = array_column($wishlistStmt->fetchAll(), 'product_id');

// Get unread broadcasts
$broadcastStmt = $pdo->prepare("
  SELECT b.* FROM broadcasts b 
  WHERE b.is_active = 1 
  AND b.id NOT IN (SELECT broadcast_id FROM broadcast_reads WHERE user_id = ?)
  ORDER BY b.created_at DESC LIMIT 1
");
$broadcastStmt->execute([$user['id']]);
$broadcast = $broadcastStmt->fetch();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Shop - Rishu Shop</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --pink:#ff6b9d;--purple:#c44dff;--indigo:#667eea;
  --glass:rgba(255,255,255,0.1);--glass-border:rgba(255,255,255,0.2);
  --bg1:#1a0533;--bg2:#0d1b2a;
}
body{
  font-family:'Nunito',sans-serif;
  min-height:100vh;width:100%;max-width:100vw;overflow-x:hidden;
  background:linear-gradient(160deg,var(--bg1),#2d1b69 40%,#11234f 70%,var(--bg2));
  color:#fff;
}
/* HEADER */
header{
  position:sticky;top:0;z-index:100;
  background:rgba(26,5,51,0.85);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,0.1);
  padding:12px 16px;
  display:flex;align-items:center;justify-content:space-between;
}
.logo{
  font-family:'Playfair Display',serif;
  background:linear-gradient(135deg,#ff6b9d,#c44dff);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  font-size:1.4rem;font-weight:700;white-space:nowrap;
}
.header-right{display:flex;align-items:center;gap:12px}
.user-info{
  display:flex;align-items:center;gap:8px;
  background:var(--glass);border:1px solid var(--glass-border);
  border-radius:30px;padding:6px 14px;
}
.user-info img{width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid var(--pink)}
.user-info span{font-size:.85rem;font-weight:600;color:#fff;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.verified{color:#4fc3f7;font-size:.85rem}
.menu-btn{
  background:var(--glass);border:1px solid var(--glass-border);
  border-radius:50%;width:38px;height:38px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:#fff;font-size:1rem;position:relative;
  transition:all .2s;
}
.menu-btn:hover{background:rgba(255,255,255,0.18)}
/* DROPDOWN MENU */
.dropdown{
  position:absolute;top:50px;right:0;
  background:rgba(26,5,51,0.95);
  border:1px solid rgba(255,255,255,0.15);
  border-radius:16px;padding:8px;min-width:180px;
  backdrop-filter:blur(20px);
  box-shadow:0 12px 40px rgba(0,0,0,0.5);
  display:none;animation:dropIn .2s ease;
  z-index:200;
}
@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.dropdown.show{display:block}
.dropdown a{
  display:flex;align-items:center;gap:10px;
  padding:10px 14px;border-radius:10px;
  color:rgba(255,255,255,0.85);text-decoration:none;font-size:.9rem;font-weight:600;
  transition:all .2s;
}
.dropdown a:hover{background:rgba(255,255,255,0.1);color:#fff}
.dropdown a.danger{color:#ff8080}
.dropdown a.danger:hover{background:rgba(255,80,80,0.15)}
.dropdown hr{border:none;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0}
/* MAIN */
main{padding:20px 14px 80px;max-width:600px;margin:0 auto}
.section-title{
  font-family:'Playfair Display',serif;
  font-size:1.5rem;color:#fff;margin-bottom:16px;
  display:flex;align-items:center;gap:10px;
}
.section-title span{
  font-size:.8rem;background:linear-gradient(135deg,var(--pink),var(--purple));
  padding:3px 10px;border-radius:20px;font-family:'Nunito',sans-serif;font-weight:700;
}
/* PRODUCT GRID */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.product-card{
  background:var(--glass);
  border:1px solid var(--glass-border);
  border-radius:18px;overflow:hidden;
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  box-shadow:0 4px 20px rgba(0,0,0,0.2);
  cursor:pointer;
  transition:transform .3s,box-shadow .3s;
  animation:cardIn .5s ease both;
  text-decoration:none;color:inherit;display:block;
  position:relative;
}
.product-card:hover{transform:translateY(-6px) scale(1.02);box-shadow:0 12px 36px rgba(196,77,255,0.25)}
@keyframes cardIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.product-img{
  width:100%;aspect-ratio:1;object-fit:cover;
  background:rgba(255,255,255,0.05);
  transition:transform .4s;
}
.product-card:hover .product-img{transform:scale(1.05)}
.product-info{padding:10px 12px 12px}
.product-name{
  font-size:.88rem;font-weight:700;color:#fff;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:6px;
}
.price-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.price-new{
  font-size:1rem;font-weight:700;
  background:linear-gradient(135deg,var(--pink),var(--purple));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.price-old{
  font-size:.8rem;color:rgba(255,255,255,0.4);text-decoration:line-through;
}
.heart-btn{
  position:absolute;top:10px;right:10px;
  background:rgba(0,0,0,0.4);border:none;border-radius:50%;
  width:34px;height:34px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .2s;backdrop-filter:blur(6px);
  color:rgba(255,255,255,0.7);font-size:1rem;
}
.heart-btn.active,.heart-btn:hover{color:var(--pink);background:rgba(255,107,157,0.2)}
/* BROADCAST MODAL */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:300;
  display:flex;align-items:center;justify-content:center;padding:20px;
  backdrop-filter:blur(8px);animation:fadeIn .3s ease;
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{
  background:rgba(30,10,60,0.95);
  border:1px solid rgba(255,255,255,0.2);
  border-radius:24px;padding:32px 28px;max-width:380px;width:100%;
  box-shadow:0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.1);
  animation:slideUp .4s ease;text-align:center;
}
@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-icon{
  width:56px;height:56px;border-radius:50%;margin:0 auto 16px;
  background:linear-gradient(135deg,var(--pink),var(--purple));
  display:flex;align-items:center;justify-content:center;font-size:1.4rem;
}
.modal h3{font-family:'Playfair Display',serif;font-size:1.4rem;color:#fff;margin-bottom:12px}
.modal p{color:rgba(255,255,255,0.75);line-height:1.6;margin-bottom:24px}
.modal .btn-close{
  background:linear-gradient(135deg,var(--pink),var(--purple));
  color:#fff;border:none;border-radius:12px;padding:12px 32px;
  font-family:'Nunito',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;
  transition:transform .2s;
}
.modal .btn-close:hover{transform:scale(1.05)}
/* EMPTY STATE */
.empty{text-align:center;padding:60px 20px;color:rgba(255,255,255,0.5)}
.empty i{font-size:3rem;margin-bottom:12px;display:block}
@media(max-width:380px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <div class="header-right">
    <div class="user-info">
      <img src="<?= htmlspecialchars($user['avatar']) ?>" alt="avatar" onerror="this.src='assets/male.png'">
      <span><?= htmlspecialchars(explode(' ', $user['full_name'])[0]) ?></span>
      <i class="fas fa-circle-check verified"></i>
    </div>
    <div class="menu-btn" onclick="toggleMenu(this)">
      <i class="fas fa-ellipsis-v"></i>
      <div class="dropdown" id="menuDropdown">
        <a href="settings.php"><i class="fas fa-gear"></i> Settings</a>
        <a href="orders.php"><i class="fas fa-box"></i> My Orders</a>
        <a href="wishlist.php"><i class="fas fa-heart"></i> Wish List</a>
        <a href="javascript:void(0)" onclick="contactSupport()"><i class="fab fa-whatsapp"></i> Support</a>
        <hr>
        <a href="logout.php" class="danger"><i class="fas fa-sign-out-alt"></i> Logout</a>
      </div>
    </div>
  </div>
</header>

<main>
  <div class="section-title">
    New Arrivals <span>✨ Fresh</span>
  </div>

  <?php if (empty($products)): ?>
    <div class="empty">
      <i class="fas fa-shirt"></i>
      <p>No products yet. Check back soon!</p>
    </div>
  <?php else: ?>
  <div class="grid">
    <?php foreach ($products as $i => $p):
      $images = json_decode($p['images'], true);
      $img = $images[0] ?? 'https://via.placeholder.com/400x400?text=No+Image';
      $inWishlist = in_array($p['id'], $wishlistIds);
    ?>
    <a href="product.php?id=<?= $p['id'] ?>" class="product-card" style="animation-delay:<?= $i * 0.07 ?>s">
      <img class="product-img" src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($p['name']) ?>" loading="lazy">
      <button class="heart-btn <?= $inWishlist ? 'active' : '' ?>" 
        onclick="toggleWishlist(event, <?= $p['id'] ?>, this)"
        title="Add to wishlist">
        <i class="fa<?= $inWishlist ? 's' : 'r' ?> fa-heart"></i>
      </button>
      <div class="product-info">
        <div class="product-name"><?= htmlspecialchars($p['name']) ?></div>
        <div class="price-row">
          <span class="price-new">₹<?= number_format($p['price']) ?></span>
          <?php if ($p['old_price']): ?>
            <span class="price-old">₹<?= number_format($p['old_price']) ?></span>
          <?php endif; ?>
        </div>
      </div>
    </a>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</main>

<!-- Broadcast Modal -->
<?php if ($broadcast): ?>
<div class="modal-overlay" id="broadcastModal">
  <div class="modal">
    <div class="modal-icon"><i class="fas fa-bullhorn"></i></div>
    <h3><?= htmlspecialchars($broadcast['title']) ?></h3>
    <p><?= nl2br(htmlspecialchars($broadcast['message'])) ?></p>
    <button class="btn-close" onclick="closeBroadcast(<?= $broadcast['id'] ?>)">
      <i class="fas fa-check"></i> Got it!
    </button>
  </div>
</div>
<?php endif; ?>

<script>
function toggleMenu(btn){
  const d=document.getElementById('menuDropdown');
  d.classList.toggle('show');
  document.addEventListener('click',function handler(e){
    if(!btn.contains(e.target)){d.classList.remove('show');document.removeEventListener('click',handler)}
  });
}

function toggleWishlist(e,productId,btn){
  e.preventDefault();e.stopPropagation();
  fetch('api/wishlist.php',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({product_id:productId})
  })
  .then(r=>r.json())
  .then(data=>{
    if(data.success){
      btn.classList.toggle('active');
      const icon=btn.querySelector('i');
      icon.className=data.action==='added'?'fas fa-heart':'far fa-heart';
    }
  });
}

function closeBroadcast(broadcastId){
  fetch('api/broadcast_read.php',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({broadcast_id:broadcastId})
  });
  document.getElementById('broadcastModal').style.animation='fadeOut .3s ease forwards';
  setTimeout(()=>document.getElementById('broadcastModal').remove(),300);
}

function contactSupport(){
  window.open('https://wa.me/<?= $supportNumber ?>?text=Hi! I need help with my order.','_blank');
}

// Fade out animation
const s=document.createElement('style');
s.textContent='@keyframes fadeOut{to{opacity:0}}';
document.head.appendChild(s);
</script>
</body>
</html>
