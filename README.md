# 🛍️ Rishu Shop — Full-Stack E-Commerce & Retail Management Platform

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%20%2F%208.x-777BB4?style=flat&logo=php&logoColor=white)](#)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat&logo=mysql&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](#)
[![OAuth 2.0](https://img.shields.io/badge/Google_OAuth-2.0_Auth-4285F4?style=flat&logo=google&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)

A high-performance, full-stack **E-Commerce & Retail Management Web Platform** engineered with **PHP backend**, **MySQL relational schema**, **Google OAuth 2.0 authentication**, and a responsive **Tailwind CSS storefront**. Features real-time cart drawer calculations, dynamic coupon engine, 5-stage live order tracking pipeline, and an administrative control hub.

---

## 🌟 Key Architecture & Features

### 🛍️ 1. Modern Interactive Storefront (`index.html` & `shop.php`)
- **Instant Product Search & Category Filtering:** Real-time client-side search bar and category pill switches (*All, Shirts, Denim, Outerwear*).
- **Interactive Quick View Modal:** Image gallery zoom, dynamic size selector (S/M/L/XL), stock indicator, and instant bag additions.
- **Slide-in Cart Drawer:** Real-time quantity adjustments, free express shipping progress bar (target ₹999), and coupon discount engine (`RISHU20` for 20% OFF).
- **Responsive Layout:** Optimized across mobile (touch-swipe cards, app drawer layout), tablet (2-column grids), and high-resolution desktop displays.

### 🔐 2. Authentication & User Management (`login.php` & `includes/auth.php`)
- Multi-channel authentication: **Phone OTP Verification** (fast 6-digit flow), Secure Local Auth with `password_hash()`, and **Google OAuth 2.0 Single Sign-On (SSO)**.
- User profile dashboard (`settings.php`) with avatar uploads, order history, and address book.

### 📦 3. Live 5-Stage Order Tracking Pipeline (`orders.php`)
- Step-by-step visual dispatch pipeline:
  1. `Order Placed` ➔ Payment received & verified.
  2. `Packed` ➔ Warehouse quality check & packaging.
  3. `Shipped` ➔ Handed over to logistics carrier (BlueDart / Delhivery AWB).
  4. `Out For Delivery` ➔ Last-mile courier dispatched.
  5. `Delivered` ➔ OTP verification and customer handover.

### 🎛️ 4. Administrative Control Hub (`admin/`)
- Real-time revenue metrics, order velocity charts, user growth logs.
- 1-click order status dispatch update dropdown.
- Dynamic broadcast announcement notification banner system.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│             Client Browser (Desktop & Mobile)          │
└───────────────────────────┬────────────────────────────┘
                            │
              HTTP / REST JSON / Form Submissions
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                      PHP Backend                       │
│  ├── Authentication (Local Sessions / Google OAuth)    │
│  ├── Cart & Checkout Calculation Engine                │
│  ├── 5-Stage Order State Machine                       │
│  └── Admin Control API & Announcement Broadcaster      │
└───────────────────────────┬────────────────────────────┘
                            │
                 PDO Prepared Queries (SQL)
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 MySQL Relational Database              │
│  ├── users (id, name, email, google_id, avatar)        │
│  ├── products (id, name, price, stock, images, cat)    │
│  ├── orders (id, user_id, status, total_price)         │
│  ├── cart (id, user_id, product_id, quantity)          │
│  ├── wishlist (id, user_id, product_id)                │
│  └── broadcasts (id, message, is_active)               │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Overview (`database.sql`)

| Table Name | Primary Purpose | Key Fields |
| :--- | :--- | :--- |
| **`users`** | Stores customer accounts & OAuth profiles | `id`, `username`, `email`, `google_id`, `avatar` |
| **`products`** | Inventory catalog & pricing | `id`, `name`, `price`, `old_price`, `stock`, `images` |
| **`orders`** | Order transactions & 5-stage tracking status | `id`, `user_id`, `total_price`, `status`, `payment_method` |
| **`cart`** | Active shopping bag persistence | `id`, `user_id`, `product_id`, `quantity` |
| **`wishlist`** | Customer saved favorites | `id`, `user_id`, `product_id` |
| **`admin`** | Administrator credentials | `id`, `username`, `password` |

---

## 💻 Local Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/rishu-builds/rishu-shop-ecommerce.git
cd rishu-shop-ecommerce
```

### 2. Database Setup (MySQL / phpMyAdmin)
1. Open **phpMyAdmin** (or MySQL CLI).
2. Create database: `CREATE DATABASE rishu_shop;`
3. Import schema: Import `database.sql`.

### 3. Configure Database Credentials
Edit `includes/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'rishu_shop');

// Google OAuth (Optional)
define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');
```

### 4. Run on Local Server
Place the folder in your web root (`htdocs/` for XAMPP or `www/` for WAMP) and open:
```text
http://localhost/rishu-shop-ecommerce/
```
*(Or simply double click `index.html` to run the standalone interactive modern demo directly in any browser!)*

---

## 🔐 Default Admin Credentials

- **URL:** `http://localhost/rishu-shop-ecommerce/admin/admin-login.php`
- **Username:** `admin`
- **Password:** `admin123`

---

## 👨‍💻 Author

**Rishabh Yadav**  
- 💼 LinkedIn: [Rishabh Yadav](https://www.linkedin.com/in/rishabh-yadav-00a235349)  
- 💻 GitHub: [@rishu-builds](https://github.com/rishu-builds)  
- ✉️ Email: [ysrishabh017@gmail.com](mailto:ysrishabh017@gmail.com)
