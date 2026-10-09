# 🎮 Little Man Studio — Penugasan Three.js

Project penugasan Three.js: menampilkan dan menginovasikan model 3D **Little_Man.glb**
dengan berbagai fitur interaktif berbasis library Three.js.

## ✨ Fitur Inovasi
- 🔄 Auto-rotate kamera (OrbitControls)
- 🕸️ Mode wireframe
- 🌙 Mode malam (day/night)
- 🎉 Party lights (lampu warna-warni berdenyut)
- 📸 Screenshot langsung dari browser
- 🎨 Pengatur warna lampu neon
- 📏 Slider skala model & kecepatan animasi
- ✨ Partikel bintang melayang + cincin neon berdenyut
- 🎭 Auto-play animasi bawaan model (jika ada)

## 🚀 Menjalankan secara lokal
Karena project memuat file `.glb`, jalankan lewat local server:

```bash
# Opsi 1: Python
python -m http.server 5500

# Opsi 2: Node
npx serve .
```

Lalu buka `http://localhost:5500`.

## 📦 Deploy ke Vercel
1. Push project ini ke GitHub (`git init` → commit → push).
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. Framework preset: **Other** (static). Klik **Deploy**. Selesai! 🎉

## 📁 Struktur File
```
little-man-threejs/
├── index.html
├── style.css
├── main.js
└── Little_Man.glb
```
