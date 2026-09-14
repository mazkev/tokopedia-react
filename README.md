# TOKOPEDEI — Modern Marketplace & E-Commerce Web App

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://tokopedia-react.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Go%20(Gin)%20%2B%20MongoDB-00ADD8?style=for-the-badge&logo=go)](http://143.198.166.143:8080)

A high-fidelity, production-grade marketplace web application inspired by **Tokopedia**, rebranded as **TOKOPEDEI**. Built with **React 19** and **Vite**, featuring seamless synchronization between the **Front Office** (Shopper Experience), **Back Office** (Admin Control with RBAC Security), and a high-performance **Go (Gin) + MongoDB** backend.

🌐 **Live Demo Website**: [https://tokopedia-react.vercel.app](https://tokopedia-react.vercel.app)

---

## 🌟 Fitur Utama (Key Features)

### 🛒 1. Pengalaman Berbelanja (Shopper Front Office)
* **Branding Eksklusif TOKOPEDEI**:
  - Logo SVG kustom Tokopedei, favicon, dan tema warna hijau khas marketplace terpercaya.
  - Navbar responsif dengan bilah pencarian cerdas (*live search*), tombol wishlist dengan counter badge, drawer preview keranjang, notifikasi, dan menu profil.
* **Halaman Detail Produk Lengkap**:
  - **Galeri Foto Multi-Sudut**: Thumbnail interaktif untuk melihat berbagai sudut foto produk secara instan.
  - **Pilihan Varian Produk**: Pilihan warna (*Space Black, Natural Titanium, dll*) dan spesifikasi/ukuran (*128GB, 256GB, dll*) dengan penyesuaian harga real-time.
  - **Tab Navigasi Dinamis**: Tab *Detail*, *Spesifikasi*, *Info Penting*, dan *Ulasan Pembeli*.
  - **Tab Ulasan Interaktif**: Rata-rata bintang, persentase kepuasan pembeli, breakdown bintang 5 s.d 1, filter review (*Semua*, *★ 5*, *★ 4*), review pembeli terverifikasi, dan counter interaktif **👍 Membantu**.
  - **Rekomendasi "Kamu Mungkin Juga Suka"**: Carousel/grid rekomendasi produk serupa dalam kategori yang sama.
  - **Tombol Cepat**: *Beli Langsung*, *+ Keranjang*, *🤍 Wishlist*, dan *🔗 Share (Salin Link)*.
* **Keranjang Belanja Fleksibel**:
  - **Checkbox Seleksi Barang**: Dukungan *"Pilih Semua"* atau centang produk individual (*partial checkout*).
  - Ringkasan belanja dan total tagihan menyesuaikan barang yang dicentang.
  - Barang yang tidak dipilih tetap tersimpan aman di keranjang.
* **Alur Pengiriman & Pembayaran Komprehensif**:
  - **Alamat Pengiriman**: Kartu alamat penerima lengkap dengan modal *"Ubah Alamat"* instan.
  - **Pilihan Jasa Kurir**: *Bebas Ongkir (Rp0)*, *Reguler - JNE/SiCepat (Rp10.000)*, *Instan - GoSend (Rp20.000)*, dan *Kargo (Rp35.000)* dengan kalkulasi ongkir otomatis.
  - **Metode Pembayaran**: Dukungan GoPay, OVO, Virtual Account (BCA, Mandiri, BNI), dan Kartu Kredit.
  - **Kupon Promo & Diskon**: Dukungan kode voucher (misal: `TOKOPEDIA10`, `HEMAT20`).
* **Pelacakan & Aksi Pesanan (Order Management)**:
  - Timeline pelacakan pesanan: *Menunggu Konfirmasi ➔ Diproses ➔ Dikirim ➔ Selesai*.
  - Rincian alamat pengiriman dan jasa kurir di setiap invoice.
  - **Batalkan Pesanan**: Khusus pesanan berstatus *Menunggu Konfirmasi*.
  - **Beli Lagi**: Memasukkan kembali seluruh barang dari transaksi lama ke keranjang dalam 1 klik.

---

### 🛡️ 2. Back Office & Keamanan Admin (RBAC Protected)
* **Role-Based Access Control (403 Forbidden Guard)**:
  - Rute Back Office (`?page=admin`) diproteksi penuh.
  - Pengguna tamu (belum login) atau pembeli biasa dilarang masuk dan diarahkan ke layar **403 Forbidden**.
  - Hanya dapat diakses oleh akun dengan role `admin`.
* **Manajemen Transaksi Masuk**:
  - Monitoring seluruh invoice pembeli secara real-time.
  - Filter status transaksi & pencarian instan invoice/pembeli.
  - Update status pesanan langsung (*Menunggu Konfirmasi ➔ Diproses ➔ Dikirim ➔ Selesai ➔ Dibatalkan*) yang langsung tersinkron ke pembeli.
* **Manajemen Katalog & Stok**:
  - Mengelola etalase produk, update harga, persentase diskon, dan stok barang.
* **Statistik & Analitik Penjualan**:
  - KPI Omset / Total Pendapatan, jumlah pesanan sukses, dan rata-rata nilai transaksi.

---

## 🛠️ Arsitektur & Teknologi (Tech Stack)

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite 6 | Komponen fungsional modern, hooks, dan lazy loading |
| **Styling** | Vanilla CSS | Custom Tokopedei Design Tokens, responsive grid, micro-animations |
| **Deployment** | Vercel | Otomatisasi CI/CD dari branch `main` GitHub |
| **Backend API** | Go (Golang) + Gin | RESTful API berkecepatan tinggi dengan caching & connection pooling |
| **Database** | MongoDB | Basis data pesanan, produk, ulasan, dan pengguna |
| **Infrastruktur VPS** | Docker Container | Containerized backend & database pada droplet cloud VPS |

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

## 🔐 Kredensial Pengujian (Demo Accounts)

### Akun Administrator (Back Office Access)
* **URL**: [https://tokopedia-react.vercel.app/?page=admin](https://tokopedia-react.vercel.app/?page=admin)
* **Email**: `admin@tokopedia.com`
* **Kata Sandi**: `admin123`

### Akun Pembeli (Customer)
* Pengguna dapat langsung mendaftarkan akun baru melalui menu **Daftar** di pojok kanan atas, atau masuk dengan akun yang sudah dibuat saat pengujian:
  - **Email**: `kevin_test@tokopedei.com`
  - **Kata Sandi**: `Password123!`

---

## 📁 Struktur Direktori

```text
tokopedia-react/
├── public/
│   ├── favicon.ico
│   ├── tokopedei-icon.svg       # Favicon & Logo Tokopedei
│   └── robots.txt
├── src/
│   ├── assets/                 # Asset gambar & ikon
│   ├── components/
│   │   ├── AdminDashboard.jsx  # Back Office & Manajemen Toko
│   │   ├── AuthPage.jsx        # Login & Registrasi Pengguna
│   │   ├── CartPage.jsx        # Keranjang belanja & Checkbox seleksi
│   │   ├── Header.jsx          # Navbar, Search, Wishlist, & User Dropdown
│   │   ├── OrdersPage.jsx      # Daftar transaksi, Batalkan, & Beli Lagi
│   │   ├── PaymentPage.jsx     # Alamat pengiriman, Jasa kurir, & Pembayaran
│   │   ├── ProductCard.jsx     # Kartu katalog produk
│   │   ├── ProductDetail.jsx   # Galeri foto, Varian, Tab ulasan, & Rekomendasi
│   │   └── WishlistPage.jsx    # Halaman barang favorit tersimpan
│   ├── services/
│   │   └── api.js              # Integrasi REST API backend & local fallbacks
│   ├── App.jsx                 # Routing utama & State Management
│   └── index.css               # Desain sistem & Styling global
├── package.json
└── README.md
```

---

Developed with ❤️ by **Mazkev**.
