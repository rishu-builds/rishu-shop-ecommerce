<?php
require_once 'includes/config.php';
requireLogin();
$user = getCurrentUser();
$pdo = getDB();

$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize($_POST['username'] ?? '');
    $full_name = sanitize($_POST['full_name'] ?? '');
    $gender = sanitize($_POST['gender'] ?? 'male');
    $dob = sanitize($_POST['dob'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $phone = sanitize($_POST['phone'] ?? '');

    if (empty($username) || empty($full_name) || empty($email)) {
        $error = 'Username, full name and email are required.';
    } else {
        // Check uniqueness excluding current user
        $check = $pdo->prepare("SELECT id FROM users WHERE (email=? OR username=?) AND id != ?");
        $check->execute([$email, $username, $user['id']]);
        if ($check->fetch()) {
            $error = 'Email or username is already taken.';
        } else {
            $avatar = ($gender === 'female') ? 'assets/female.png' : 'assets/male.png';
            $stmt = $pdo->prepare("UPDATE users SET username=?,full_name=?,gender=?,dob=?,email=?,phone=?,avatar=? WHERE id=?");
            $stmt->execute([$username, $full_name, $gender, $dob ?: null, $email, $phone, $avatar, $user['id']]);
            $_SESSION['user_name'] = $full_name;
            $_SESSION['user_email'] = $email;
            $user = getCurrentUser(); // Refresh
            $success = 'Profile updated successfully!';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Settings - Rishu Shop</title>
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
header h1{font-family:'Playfair Display',serif;font-size:1.1rem;
  background:linear-gradient(135deg,#ff6b9d,#c44dff);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
main{padding:20px 14px 60px;max-width:500px;margin:0 auto}
.avatar-section{text-align:center;margin-bottom:28px}
.avatar-wrap{
  width:90px;height:90px;border-radius:50%;margin:0 auto 12px;
  border:3px solid;border-image:linear-gradient(135deg,var(--pink),var(--purple)) 1;
  box-shadow:0 0 24px rgba(196,77,255,0.3);
  overflow:hidden;position:relative;
}
.avatar-wrap img{width:100%;height:100%;object-fit:cover}
.avatar-name{font-family:'Playfair Display',serif;font-size:1.3rem;color:#fff;font-weight:700}
.avatar-email{color:rgba(255,255,255,0.5);font-size:.85rem;margin-top:2px}
.card{
  background:var(--glass);border:1px solid var(--glass-border);
  border-radius:20px;padding:22px;margin-bottom:16px;
  backdrop-filter:blur(12px);
}
.card-title{font-size:.8rem;font-weight:700;color:rgba(255,255,255,0.4);
  text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
.field{margin-bottom:14px}
.field label{display:block;color:rgba(255,255,255,0.55);font-size:.8rem;font-weight:600;
  margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px}
.field input,.field select{
  width:100%;padding:12px 14px;
  background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);
  border-radius:10px;color:#fff;font-family:'Nunito',sans-serif;font-size:.95rem;outline:none;
  transition:all .3s;
}
.field input:focus,.field select:focus{
  border-color:var(--pink);background:rgba(255,255,255,0.1);
  box-shadow:0 0 0 3px rgba(255,107,157,0.15);
}
.field input::placeholder{color:rgba(255,255,255,0.25)}
.field select option{background:#2d1b69;color:#fff}
.gender-preview{
  display:flex;gap:12px;margin-top:10px;
}
.gender-opt{
  flex:1;padding:14px;border-radius:12px;
  background:rgba(255,255,255,0.05);border:2px solid transparent;
  cursor:pointer;text-align:center;transition:all .3s;color:rgba(255,255,255,0.6);
}
.gender-opt.active{
  background:linear-gradient(135deg,rgba(255,107,157,0.15),rgba(196,77,255,0.15));
  border-color:var(--pink);color:#fff;
}
.gender-opt i{font-size:1.5rem;display:block;margin-bottom:4px}
.gender-opt span{font-size:.85rem;font-weight:700}
.btn-save{
  width:100%;padding:15px;border:none;border-radius:14px;
  background:linear-gradient(135deg,var(--pink),var(--purple));
  color:#fff;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:700;
  cursor:pointer;transition:all .3s;margin-top:8px;
  box-shadow:0 4px 20px rgba(255,107,157,0.3);
}
.btn-save:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,107,157,0.4)}
.alert{padding:12px 16px;border-radius:10px;margin-bottom:14px;font-size:.9rem}
.alert-s{background:rgba(80,255,160,0.15);border:1px solid rgba(80,255,160,0.3);color:#80ffb0}
.alert-e{background:rgba(255,80,80,0.15);border:1px solid rgba(255,80,80,0.3);color:#ff9999}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:400px){.row2{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <a href="shop.php" class="back-btn"><i class="fas fa-arrow-left"></i></a>
  <h1><i class="fas fa-gear"></i> Settings</h1>
</header>
<main>
  <div class="avatar-section">
    <div class="avatar-wrap" style="border-radius:50%;border:3px solid transparent;background:linear-gradient(#1a0533,#1a0533) padding-box,linear-gradient(135deg,#ff6b9d,#c44dff) border-box">
      <img src="<?= htmlspecialchars($user['avatar']) ?>" alt="Avatar" id="avatarImg" onerror="this.src='assets/male.png'">
    </div>
    <div class="avatar-name"><?= htmlspecialchars($user['full_name']) ?></div>
    <div class="avatar-email"><?= htmlspecialchars($user['email']) ?></div>
  </div>

  <?php if ($success): ?>
    <div class="alert alert-s"><i class="fas fa-check-circle"></i> <?= htmlspecialchars($success) ?></div>
  <?php endif; ?>
  <?php if ($error): ?>
    <div class="alert alert-e"><i class="fas fa-exclamation-circle"></i> <?= htmlspecialchars($error) ?></div>
  <?php endif; ?>

  <form method="POST">
    <div class="card">
      <div class="card-title"><i class="fas fa-user"></i> Personal Info</div>
      <div class="row2">
        <div class="field">
          <label>Username</label>
          <input type="text" name="username" value="<?= htmlspecialchars($user['username']) ?>" required>
        </div>
        <div class="field">
          <label>Full Name</label>
          <input type="text" name="full_name" value="<?= htmlspecialchars($user['full_name']) ?>" required>
        </div>
      </div>
      <div class="row2">
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" value="<?= htmlspecialchars($user['email']) ?>" required>
        </div>
        <div class="field">
          <label>Phone</label>
          <input type="tel" name="phone" value="<?= htmlspecialchars($user['phone'] ?? '') ?>" placeholder="+91...">
        </div>
      </div>
      <div class="field">
        <label>Date of Birth</label>
        <input type="date" name="dob" value="<?= htmlspecialchars($user['dob'] ?? '') ?>">
      </div>
    </div>

    <div class="card">
      <div class="card-title"><i class="fas fa-venus-mars"></i> Gender & Avatar</div>
      <input type="hidden" name="gender" id="genderInput" value="<?= htmlspecialchars($user['gender']) ?>">
      <div class="gender-preview">
        <div class="gender-opt <?= $user['gender'] === 'male' ? 'active' : '' ?>" onclick="selectGender('male')">
          <i class="fas fa-mars"></i><span>Male</span>
        </div>
        <div class="gender-opt <?= $user['gender'] === 'female' ? 'active' : '' ?>" onclick="selectGender('female')">
          <i class="fas fa-venus"></i><span>Female</span>
        </div>
      </div>
      <p style="margin-top:10px;color:rgba(255,255,255,0.4);font-size:.8rem">Avatar will update automatically based on gender.</p>
    </div>

    <button type="submit" class="btn-save">
      <i class="fas fa-save"></i> Save Changes
    </button>
  </form>
</main>
<script>
function selectGender(g){
  document.getElementById('genderInput').value=g;
  document.querySelectorAll('.gender-opt').forEach((el,i)=>el.classList.toggle('active',i===(g==='male'?0:1)));
  document.getElementById('avatarImg').src='assets/'+(g)+'.png';
}
</script>
</body>
</html>
