# Civic Pulse

Prototipe React Native untuk Milestone Minggu 9: inisialisasi LBS, peta interaktif, dan komputasi jarak.

## Fitur milestone

- Peta `react-native-maps` dengan marker kustom untuk kategori laporan jalan, banjir, dan fasilitas umum.
- Pelacakan lokasi foreground menggunakan `expo-location`, dengan permintaan izin saat pengguna menekan tombol lokasi.
- Hook `useLocationTracking` menyesuaikan `distanceInterval`: 8 m saat berjalan/lambat, 20 m saat bergerak sedang, dan 40 m saat bergerak cepat.
- Jarak garis lurus antara pengguna dan laporan dihitung memakai Haversine.
- Laporan pada aplikasi ini adalah titik contoh yang diposisikan di sekitar pusat peta/lokasi untuk keperluan demonstrasi, bukan laporan warga dari server.

## Menjalankan aplikasi

1. Pasang Node.js LTS dan jalankan `npm install`.
2. Salin `.env.example` menjadi `.env` jika akan membuat development build atau APK Android, lalu isi API key Google Maps.
3. Jalankan `npm run start` dan buka aplikasi menggunakan perangkat/emulator melalui Expo Go atau development build.
4. Jalankan `npm run typecheck` untuk memeriksa tipe TypeScript.

Izin lokasi hanya diminta setelah tombol lokasi digunakan. Pelacakan berhenti saat tombol yang sama ditekan kembali atau layar ditutup.

## Google Maps untuk Android

Expo Go menyediakan konfigurasi peta untuk pengembangan. Untuk development build atau APK sendiri, buat API key Google Maps Android yang dibatasi sesuai application ID `com.civicpulse.app`, lalu atur environment variable `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` sebelum menjalankan perintah Expo. Jangan commit API key; batasi key menurut aplikasi dan API di Google Cloud Console.
