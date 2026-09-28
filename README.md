# Rishu Shop — Full-Stack E-Commerce Website

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%20%2F%208.x-777BB4?style=flat&logo=php&logoColor=white)](#)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat&logo=mysql&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-UI-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](#)

A full-stack e-commerce web application built with PHP, MySQL, and vanilla JavaScript. Features a responsive modern storefront, interactive cart drawer, phone OTP authentication, 5-stage order tracking, and an admin management dashboard.

---

## Features

### Storefront & Shopping Experience
- **Product Catalog & Search:** Client-side search and category filtering (Shirts, Denim, Outerwear).
- **Quick View Modal:** Product gallery preview, size selection (S, M, L, XL), stock status, and add-to-cart.
- **Cart Drawer:** Real-time quantity updates, coupon code engine (`RISHU20` for 20% off), and subtotal calculation.
- **Responsive Design:** Mobile-first layout with smooth touch interactions for mobile, tablet, and desktop.

### Authentication & Accounts
- **Phone OTP Verification:** Simulated 6-digit one-time password login flow.
- **Standard Account Auth:** Secure local registration and login using PHP `password_hash()` and session management.
- **Google OAuth 2.0:** Single sign-on integration for Google accounts.
- **User Profile:** Manage shipping addresses and view past order history.

### Order Tracking
- Visual 5-stage delivery pipeline:
  1. `Order Placed` — Payment verified.
  2. `Packed` — Packed and ready for dispatch.
  3. `Shipped` — Handed over to courier with tracking details.
  4. `Out For Delivery` — Out for local delivery.
  5. `Delivered` — Order delivered.

### Admin Dashboard
- View order status, customer lists, and store metrics.
- 1-click order status update dropdown (Placed ➔ Shipped ➔ Delivered).
- Broadcast announcement banner management.

---

## Tech Stack

- **Backend:** PHP 7.4 / 8.x (PDO, Session Auth)
- **Database:** MySQL / MariaDB (Relational schema with foreign keys)
- **Frontend:** HTML5, CSS3, Tailwind CSS, Vanilla JavaScript (ES6+)
- **Authentication:** PHP Sessions, Google OAuth 2.0 Client
- **Hosting / Demo:** Compatible with XAMPP, WAMP, LAMP, or GitHub Pages (standalone demo)

---

## Database Schema

The database consists of relational tables defined in `database.sql`:

| Table | Purpose |
| :--- | :--- |
| `users` | Stores registered users, credentials, and OAuth identifiers |
| `products` | Product inventory, pricing, descriptions, and image paths |
| `orders` | Customer orders, totals, shipping info, and delivery status |
| `cart` | Persistent cart items for logged-in sessions |
| `wishlist` | Saved favorite products |
| `admin` | Administrator login credentials |

---

## Local Installation & Setup

### Prerequisites
- PHP 7.4 or higher
- MySQL / MariaDB
- Web server like Apache (via XAMPP, WAMP, or standalone)

### 1. Clone the repository
```bash
git clone https://github.com/rishu-builds/rishu-shop-ecommerce.git
cd rishu-shop-ecommerce
```

### 2. Set up the Database
1. Open **phpMyAdmin** (or your MySQL client).
2. Create a new database:
   ```sql
   CREATE DATABASE rishu_shop;
   ```
3. Import the `database.sql` file provided in the repository root.

### 3. Configure Database Credentials
Open `includes/config.php` and configure your local settings if needed:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'rishu_shop');
```

### 4. Run the Project
Place the project directory inside your web root (`htdocs/` for XAMPP):
```
http://localhost/rishu-shop-ecommerce/
```
*Note: You can also open `index.html` directly in any web browser to view the client-side interactive storefront demo.*

---

## Admin Credentials

- **URL:** `http://localhost/rishu-shop-ecommerce/admin/admin-login.php`
- **Username:** `admin`
- **Password:** `admin123`

---

## Author

**Rishabh Yadav**
- LinkedIn: [Rishabh Yadav](https://www.linkedin.com/in/rishabh-yadav777/)
- GitHub: [@rishu-builds](https://github.com/rishu-builds)
- Email: [ysrishabh017@gmail.com](mailto:ysrishabh017@gmail.com)
