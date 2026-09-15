# 🛍️ TOKOPEDEI — Modern Marketplace & E-Commerce Web Application

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://tokopedia-react.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tokopedia Pay](https://img.shields.io/badge/Payment-Tokopedia%20Pay%20(QRIS%20%2B%20VA)-03AC0E?style=for-the-badge)](https://tokopedia-react.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend-Go%20(Gin)%20%2B%20MongoDB%20(HTTPS)-00ADD8?style=for-the-badge&logo=go)](https://api.143.198.166.143.sslip.io/api/health)

A production-grade, high-fidelity e-commerce marketplace web application inspired by **Tokopedia**, branded as **TOKOPEDEI**. Built with **React 19** and **Vite**, featuring seamless synchronization between the **Shopper Experience (Front Office)**, **Admin Control (Back Office with RBAC Security)**, an **In-House Tokopedia Pay Payment Simulator**, and a high-performance **Golang + MongoDB** cloud backend with **SSL/HTTPS**.

🌐 **Live Demo Website**: [https://tokopedia-react.vercel.app](https://tokopedia-react.vercel.app)  
⚙️ **Backend Repository**: [https://github.com/mazkev/tokped-backend](https://github.com/mazkev/tokped-backend)  
🔒 **Live Secure API (HTTPS)**: [https://api.143.198.166.143.sslip.io/api/health](https://api.143.198.166.143.sslip.io/api/health)  
📖 **Interactive Swagger API Docs**: [https://api.143.198.166.143.sslip.io/swagger/index.html](https://api.143.198.166.143.sslip.io/swagger/index.html)

---

## 🌟 Fitur Utama (Key Features)

### 💳 1. Tokopedia Pay (In-House Payment Gateway Engine)
* **QRIS Dinamis Asli**:
  - Render QR Code dinamis resmi dengan logo standar **QRIS & GPN** dan nomor NMID unik.
  - **Dapat di-scan langsung** menggunakan kamera smartphone sungguhan atau aplikasi e-wallet.
  - Efek animasi **sinar laser hijau (laser scanning line)** yang bergerak naik-turun secara real-time.
* **BCA Virtual Account**:
  - Nomor VA otomatis ter-generate dengan format resmi `80777xxxxxxxx`.
  - Tombol **"Salin"** nomor rekening dengan visual feedback (`✓ Tersalin!`).
  - Tab panduan transfer lengkap: **m-BCA**, **KlikBCA**, dan **ATM BCA**.
* **GoPay & OVO Instant**:
  - Pilihan dompet digital dengan simulasi debit saldo instan 1-klik.
* **Live Countdown Timer 24 Jam**:
  - Penghitung mundur batas waktu pelunasan transaksi secara real-time (`23:59:45`).
* **Simulator Pembayaran Mandiri**:
  - Tombol aksi **`[⚡ Simulasikan Pembayaran Berhasil]`** yang langsung memvalidasi transaksi ke backend VPS Go.
  - Status pesanan di database MongoDB seketika berubah menjadi **`Diproses`** dan memunculkan animasi sukses centang hijau beserta struk digital.

---

### 🛒 2. Pengalaman Berbelanja (Shopper Front Office)
* **Branding Eksklusif TOKOPEDEI**:
  - Tema visual hijau khas marketplace terpercaya, typography Outfit/Inter, dan micro-animations.
  - Navbar responsif dengan bilah pencarian cerdas (*live search*), tombol wishlist dengan counter badge, drawer preview keranjang, notifikasi toast, dan menu user dropdown.
* **Halaman Detail Produk Interaktif**:
  - **Galeri Foto Multi-Sudut**: Thumbnail interaktif untuk melihat berbagai sudut foto produk secara instan.
  - **Pilihan Varian Produk**: Pilihan warna (*Space Black, Natural Titanium, dll*) dan spesifikasi/kapasitas (*128GB, 256GB, dll*) dengan penyesuaian harga dinamis.
  - **Tab Navigasi**: Tab *Detail*, *Spesifikasi*, *Info Penting*, dan *Ulasan Pembeli*.
  - **Review & Rating Bintang**: Rata-rata bintang, breakdown bintang 5 s.d 1, filter ulasan, pembeli terverifikasi, dan counter interaktif **👍 Membantu**.
  - **Rekomendasi "Kamu Mungkin Juga Suka"**: Grid rekomendasi produk serupa dalam kategori yang relevan.
* **Keranjang Belanja Fleksibel**:
  - Dukungan *"Pilih Semua"* atau centang produk individual (*partial checkout*).
  - Ringkasan belanja dan kalkulasi total tagihan menyesuaikan barang yang dipilih.
* **Alur Pengiriman & Kupon Promo**:
  - Modal ubah alamat pengiriman instan.
  - Pilihan kurir fleksibel: *Bebas Ongkir (Rp0)*, *Reguler - JNE/SiCepat*, *Instan (3 Jam)*, dan *Kargo*.
  - Kupon diskon aktif (e.g. `TOKOPEDIA10`, `HEMAT20`).
* **Riwayat & Pelacakan Transaksi**:
  - Timeline status pelacakan: *Menunggu Pembayaran ➔ Diproses ➔ Dikirim ➔ Selesai*.
  - Tombol **`⚡ Bayar Sekarang`** pada pesanan yang belum lunas agar pembeli bisa membuka kembali modal pembayaran kapan saja.
  - Tombol **Batalkan Pesanan** dan **Beli Lagi**.

---

### 🛡️ 3. Back Office & Keamanan Admin (RBAC Protected)
* **Role-Based Access Control (403 Forbidden Guard)**:
  - Rute Back Office (`?page=admin`) diproteksi penuh.
  - Pengguna tamu (belum login) atau pembeli biasa diblokir otomatis dan diarahkan ke layar **403 Forbidden Access**.
  - Hanya dapat diakses oleh akun dengan role `admin`.
* **Manajemen Transaksi Masuk**:
  - Monitoring seluruh invoice pesanan pembeli secara real-time.
  - Filter status transaksi & pencarian instan nomor invoice / nama pembeli.
  - Update status pesanan langsung (*Diproses ➔ Dikirim ➔ Selesai ➔ Dibatalkan*) yang langsung tersinkron ke sisi pembeli.
* **Manajemen Katalog & Stok**:
  - Tambah produk baru, ubah harga, sesuaikan diskon, dan update stok barang.
* **Statistik & Analitik Penjualan**:
  - KPI Total Omset / Pendapatan, jumlah transaksi sukses, dan rata-rata nilai order.

---

## 🛠️ Arsitektur & Teknologi (Tech Stack)

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite 6 | Komponen fungsional modern, custom hooks, dan dynamic code-splitting |
| **Styling** | Vanilla CSS | Custom Tokopedei Design Tokens, responsive grid, glassmorphism, micro-animations |
| **Frontend Deployment** | Vercel | Otomatisasi CI/CD dari branch `main` GitHub |
| **Backend API** | Golang (Gin Framework) | High-performance Go Monolith REST API (~25 MB RAM) |
| **Payment Engine** | Tokopedia Pay | In-house QRIS & Virtual Account payment simulation engine |
| **Database** | MongoDB v2 | Connection pooling (min 5, max 50), auto compound indexes, 256MB cache limit |
| **Infrastruktur VPS** | DigitalOcean + Docker | Containerized multi-service dengan Docker Compose dan network isolation |
| **DevOps Otomasi** | GitHub Actions | Automated Lint, Go Vet, and Remote SSH deployment pipeline |

---

## 🚀 Panduan Menjalankan Proyek (Getting Started)

### 1. Clone Repositori
```bash
git clone https://github.com/mazkev/tokopedia-react.git
cd tokopedia-react
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Jalankan Local Development Server
```bash
npm run dev
```
Buka browser di: `http://localhost:5173/`

### 4. Build untuk Produksi
```bash
npm run build
```

---

## 🔐 Kredensial Akun Pengujian (Demo Accounts)

### 👨‍💼 Akun Administrator (Back Office Access)
* **URL**: [https://tokopedia-react.vercel.app/?page=admin](https://tokopedia-react.vercel.app/?page=admin)
* **Email**: `admin@tokopedia.com`
* **Password**: `admin123`

### 🛒 Akun Pembeli (Customer)
* Pengguna dapat langsung mendaftarkan akun baru melalui tombol **Daftar**, atau login dengan akun uji coba:
  - **Email**: `kevin@tokopedia.com`
  - **Password**: `password123`

---

## 📁 Struktur Direktori

```text
tokopedia-react/
├── public/
│   ├── favicon.ico
│   ├── tokopedei-icon.svg       # Favicon & Logo Resmi Tokopedei
│   └── robots.txt
├── src/
│   ├── assets/                 # Asset visual & icons
│   ├── components/
│   │   ├── AdminDashboard.jsx  # Back Office & Manajemen Katalog/Order
│   │   ├── AuthPage.jsx        # Login & Registrasi Pengguna
│   │   ├── CartPage.jsx        # Keranjang Belanja & Checkbox Seleksi
│   │   ├── Header.jsx          # Navbar, Search, Wishlist, & User Dropdown
│   │   ├── OrdersPage.jsx      # Daftar Transaksi, Timeline, & Bayar Sekarang
│   │   ├── PaymentModal.jsx    # Tokopedia Pay Modal (QRIS Laser & BCA VA)
│   │   ├── PaymentPage.jsx     # Checkout, Alamat Pengiriman, & Jasa Kurir
│   │   ├── ProductCard.jsx     # Kartu Katalog Produk
│   │   ├── ProductDetail.jsx   # Galeri Foto, Varian, Review, & Rekomendasi
│   │   └── WishlistPage.jsx    # Halaman Produk Favorit
│   ├── services/
│   │   └── api.js              # HTTP Client & REST API Integration
│   ├── App.jsx                 # Routing Utama, State Management, & Modals
│   └── index.css               # Design System & Styling Global
├── package.json
└── README.md
```

---

Developed with ❤️ by **Kevin Pratama (Mazkev)**.
