<?php
require_once '../includes/config.php';

if (isAdminLoggedIn()) {
    header('Location: admin-dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username && $password) {
        $pdo = getDB();
        $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password'])) {
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            header('Location: admin-dashboard.php');
            exit;
        } else {
            $error = 'Invalid username or password.';
        }
    } else {
        $error = 'Please fill in all fields.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Admin Login - Rishu Shop</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:'Nunito',sans-serif;min-height:100vh;width:100%;max-width:100vw;overflow-x:hidden;
  background:linear-gradient(135deg,#0a0a1a,#1a0533 50%,#0d1b2a);
  display:flex;align-items:center;justify-content:center;padding:20px;
}
.wrap{width:100%;max-width:400px;z-index:1}
.logo{text-align:center;margin-bottom:32px}
.logo h1{font-family:'Playfair Display',serif;font-size:2rem;
  background:linear-gradient(135deg,#ff6b9d,#c44dff);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.logo p{color:rgba(255,255,255,0.4);font-size:.85rem;margin-top:4px}
.card{
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
  border-radius:24px;padding:32px 28px;backdrop-filter:blur(20px);
  box-shadow:0 20px 60px rgba(0,0,0,0.4);
}
h2{font-family:'Playfair Display',serif;color:#fff;font-size:1.4rem;margin-bottom:8px;text-align:center}
.sub{text-align:center;color:rgba(255,255,255,0.4);font-size:.85rem;margin-bottom:24px}
.field{margin-bottom:16px;position:relative}
.field label{display:block;color:rgba(255,255,255,0.5);font-size:.8rem;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.field input{
  width:100%;padding:13px 16px 13px 44px;
  background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);
  border-radius:12px;color:#fff;font-family:'Nunito',sans-serif;font-size:.95rem;outline:none;
}
.field input:focus{border-color:#ff6b9d;box-shadow:0 0 0 3px rgba(255,107,157,0.15)}
.field input::placeholder{color:rgba(255,255,255,0.25)}
.field-icon{position:absolute;left:14px;top:38px;color:rgba(255,255,255,0.35);font-size:.9rem}
.btn{
  width:100%;padding:14px;border:none;border-radius:12px;
  background:linear-gradient(135deg,#ff6b9d,#c44dff);
  color:#fff;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:700;
  cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(255,107,157,0.3);
}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,107,157,0.4)}
.alert{background:rgba(255,80,80,0.15);border:1px solid rgba(255,80,80,0.3);color:#ff9999;
  padding:12px 16px;border-radius:10px;margin-bottom:14px;font-size:.9rem}
.back{text-align:center;margin-top:16px;color:rgba(255,255,255,0.4);font-size:.85rem}
.back a{color:#ff6b9d;text-decoration:none;font-weight:600}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">
    <h1><i class="fas fa-shield-halved"></i> Admin</h1>
    <p>Rishu Shop Administration</p>
  </div>
  <div class="card">
    <h2>Admin Login</h2>
    <p class="sub">Enter your admin credentials</p>
    <?php if ($error): ?>
    <div class="alert"><i class="fas fa-exclamation-circle"></i> <?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <form method="POST">
      <div class="field">
        <label>Username</label>
        <i class="fas fa-user field-icon"></i>
        <input type="text" name="username" placeholder="Admin username" required>
      </div>
      <div class="field">
        <label>Password</label>
        <i class="fas fa-lock field-icon"></i>
        <input type="password" name="password" placeholder="Admin password" required>
      </div>
      <button type="submit" class="btn"><i class="fas fa-sign-in-alt"></i> Login</button>
    </form>
    <div class="back"><a href="../login.php"><i class="fas fa-arrow-left"></i> Back to Shop</a></div>
  </div>
</div>
</body>
</html>
