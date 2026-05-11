# Tokopedia Clone Elite - React Marketplace

A high-fidelity, production-grade marketplace application inspired by **Tokopedia**. This project features a seamless synchronization between the **Front Office** (Shopper Experience) and the **Back Office** (Administrative Control).

![Tokopedia Banner](https://images.tokopedia.net/img/Gv9S2W/2022/10/5/4e488f2f-1e96-41f2-9f37-1c210d54a638.png)

## 🌟 Key Features

### 🛒 Front Office (Buyer Experience)
*   **Modern Homepage**: Interactive product grid with dynamic filtering, category chips, and promotional carousels.
*   **Elite Checkout Flow**: Multi-step process including **Cart Management**, **Voucher Application**, and a **Secure Payment Gateway**.
*   **Voucher Engine**: Support for discount codes (e.g., `TOKOPEDIA10`) with real-time price deduction in the cart.
*   **Real-time Order Tracking**: Visual animated timeline tracking packages through 4 stages: *Menunggu Konfirmasi*, *Diproses*, *Dikirim*, and *Selesai*.
*   **Social Proof**: Interactive rating and review system (1-5 stars) available for all completed transactions.
*   **Persistence**: Full `localStorage` integration—sessions, carts, history, and user registries survive page refreshes.

### 🏢 Back Office (Admin Dashboard)
*   **Order Management**: Full CRUD operations for orders, status updates, and transaction auditing.
*   **Inventory Control**: Real-time product editing (Name, Price, Category) that reflects instantly across the marketplace.
*   **Live Analytics**: Sales trend charts (last 7 days), top-selling products leaderboard, and revenue KPIs.
*   **Global Config**: System toggles for Maintenance Mode, Free Shipping promo, and Notification settings.
*   **Shop Profiling**: Dedicated module to manage store identity, branding (logo), and public descriptions.

## 🛠️ Technology Stack
*   **Frontend**: React.js (Hooks & Functional Components)
*   **Styling**: Vanilla CSS (Custom Design System with Glassmorphism)
*   **State Management**: React State + LocalStorage (Persistent Mock DB)
*   **Icons/Images**: Tokopedia Official CDN Assets

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mazkev/tokopedia-react.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the Admin Dashboard**:
   *   **Email**: `admin@tokopedia.com`
   *   **Password**: `admin123`

## ✅ Completed Milestones
- [x] High-fidelity Marketplace UI
- [x] Admin Back Office V2 (Orders & Inventory)
- [x] Voucher & Discount Engine (Real-time Calculation)
- [x] Animated Order Tracking Timeline
- [x] Post-Purchase Product Reviews
- [x] Persistent Storage (LocalStorage Sync)
- [x] Multi-Role User Registry (Admin vs Shopper)

---
Developed with ❤️ by Antigravity AI.
