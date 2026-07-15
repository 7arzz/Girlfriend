# 💘 Girlfriend Proposal Game

Selamat datang di repository **Girlfriend Proposal Game**! Proyek ini adalah sebuah aplikasi web interaktif yang romantis, menyenangkan, dan dibuat khusus untuk menyatakan cinta atau "menembak" seseorang spesial dengan gaya yang unik!

🔗 **Lihat dan mainkan aplikasinya secara langsung di sini:**
**[https://girlfriend-sandy.vercel.app/](https://girlfriend-sandy.vercel.app/)**

---

## 🌟 Fitur Utama

- **🏹 Mini-game Memanah Hati:** Pemain harus menarik busur dan menembakkan panah ke arah amplop 3D yang melayang-layang untuk membukanya.
- **🏃‍♂️ Tombol "Tidak" yang Suka Menghindar:** Pada layar pertanyaan utama, jika pemain mengarahkan kursor atau mencoba menyentuh tombol "Tidak/Coba Lagi", tombol tersebut akan kabur dan berpindah posisi (bahkan memunculkan teks lucu secara acak!).
- **🎵 Efek Suara Interaktif:** Dilengkapi dengan efek suara lucu untuk panahan, klik, dan perayaan (berbasis Web Audio API ringan).
- **📱 Responsif:** Tampilan game dirancang mulus untuk segala jenis perangkat, baik untuk layar Mobile, Tablet, maupun Desktop dengan tata letak optimal.
- **✨ Animasi & Partikel Menarik:** Visual memanjakan mata seperti efek ledakan partikel cinta dan detak jantung yang melayang.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini tidak bergantung pada framework animasi yang berat. Semua dibangun dengan teknologi modern namun tetap ringan:
- **[React (Vite)](https://vitejs.dev/)** - Struktur komponen dan rendering modern yang cepat.
- **CSS murni / Vanilla CSS** - Animasi canggih, transform 3D, media queries, dan UI responsif dikendalikan oleh CSS murni tanpa UI framework.
- **HTML5 Canvas** - Untuk merender fisika busur panah dan kalkulasi tumbukan (collision) secara _real-time_.

## 🚀 Cara Menjalankan Secara Lokal (Development)

Jika Anda ingin melihat atau memodifikasi _source code_ secara langsung, ikuti langkah-langkah di bawah ini:

1. **Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/)** di komputer Anda.
2. **Kloning atau Unduh repository ini** ke dalam direktori lokal.
3. Buka terminal (Command Prompt/PowerShell) di folder proyek ini.
4. Jalankan perintah instalasi _dependencies_:
   ```bash
   npm install
   ```
5. Jalankan server _development_ lokal:
   ```bash
   npm run dev
   ```
6. Buka http://localhost:5173 di browser Anda.

## 📁 Struktur Direktori Penting

- `/src/components` - Semua komponen utama aplikasi ini berada di sini (contoh: `ArcheryGame.jsx`, `Envelope.jsx`, `GirlfriendQuestion.jsx`).
- `/src/utils` - Utilitas tambahan seperti pengelola efek suara (`audio.js`).
- `/src/data.js` - Tempat Anda bisa mengganti teks/copywriting dalam game ini dengan mudah, agar pesannya lebih personal!
- `/src/assets` - Beberapa _assets_ (jika ada).

## 💡 Modifikasi Personal (Kustomisasi)

Ingin menyatakan perasaan kepada seseorang secara diam-diam melalui _app_ ini? Anda bisa langsung pergi ke file `src/data.js` untuk mengganti *judul*, *teks tombol*, hingga *dialog lucu* saat tombol "tanda silang/tidak" menghindar. Mudah dan praktis!

---

💖 _Dibuat dengan cinta. Semoga berhasil mendapatkan hatinya!_
