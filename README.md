# Java PBO Learning & Exam Simulator

Simulator pembelajaran interaktif dan persiapan ujian **Pemrograman Berorientasi Objek (PBO / OOP)**

Aplikasi ini berfokus pada format soal ujian **Fill in the Blanks**, yaitu melengkapi potongan kode Java yang sengaja dikosongkan pada baris-baris krusial (kata kunci, identifier, pemanggilan method, konstruktor, inheritance, anotasi `@Override`, dan polimorfisme).

---

## 🌟 Fitur Utama

1. **Audit & Akurasi Akademik 100% dari Slide Kuliah**:
   - Seluruh materi dan bank soal diindeks langsung dari berbagai sumber.

2. **Komponen Fill in the Blanks Interaktif**:
   - Bagian kosong (`/* BLANK_X */`) digantikan dengan input teks langsung di dalam baris kode Java.
   - Posisi indentasi, tanda kurung kurawal, dan titik koma tetap terjaga rapi.
   - Dukungan navigasi keyboard: tekan tombol `Enter` atau `Tab` untuk berpindah antar-kotak kosong dengan cepat.
   - Responsif untuk laptop maupun layar ponsel smartphone.

3. **Mesin Penilaian Akurat & Transparan (`GradingEngine`)**:
   - Pemeriksaan independen untuk setiap blank.
   - Normalisasi spasi di tepi (*edge whitespace*) dan penanganan spasi token ekuivalen.
   - Pemberian nilai parsial (*partial credit*) untuk soal dengan banyak blank.
   - Pembedaan status: Benar (*Correct*), Salah (*Incorrect*), dan Belum Diisi (*Empty*).

4. **Mode Latihan (Practice Mode)**:
   - Pilih bab materi dan tingkat kesulitan (Mudah, Sedang, Sulit).
   - Fitur **Periksa Jawaban** langsung untuk menguji pemahaman sebelum melanjutkan.
   - Penjelasan komprehensif, analisis jebakan umum mahasiswa (*common mistakes*), dan kunci jawaban.

5. **Mode Simulasi Ujian (Exam Mode)**:
   - Pengalaman menyerupai ujian kampus yang sesungguhnya.
   - Timer hitung mundur dengan peringatan visual saat sisa waktu menipis.
   - Kunci jawaban dan pembahasan disembunyikan total selama ujian berjalan.
   - Navigasi nomor soal (Palette) dengan indikator: *Sudah diisi*, *Belum diisi*, *Ditandai ragu-ragu*.
   - Konfirmasi sebelum pengumpulan dan pengumpulan otomatis (*auto-submit*) jika waktu habis.
   - **Ketahanan Refresh**: Sesi ujian yang sedang berjalan tersimpan otomatis di `localStorage`, sehingga jika halaman browser tidak sengaja ter-refresh, ujian dapat dilanjutkan tanpa kehilangan jawaban!

6. **Evaluasi & Rekomendasi Hasil Ujian**:
   - Nilai akhir (0–100) dan konversi huruf mutu (A, B, C, D, E).
   - Evaluasi penguasaan per bab materi.
   - Deteksi topik yang paling sering salah dengan rekomendasi belajar spesifik.
   - Tombol **Ulangi Soal yang Salah** untuk langsung melatih kembali soal-soal yang belum tepat.

7. **Penyimpanan Lokal & Backup Mandiri**:
   - 100% beroperasi di browser pengguna tanpa akun, tanpa login, dan tanpa koneksi internet (*zero-dependency*).
   - Ekspor data riwayat dan statistik ke file JSON (`backup.json`).
   - Impor data JSON dengan validasi keamanan.
   - Tombol Reset data dengan konfirmasi.
   - Mode Gelap (Dark Mode) dan Mode Terang (Light Mode).

---

## 📂 Struktur Proyek

```
.
├── index.html                  # Antarmuka web utama
├── README.md                   # Dokumentasi panduan proyek
├── docs/
│   └── MATERIAL_INVENTORY.md   # Inventarisasi & audit 8 file PDF slide kuliah
├── src/
│   ├── css/
│   │   └── style.css           # Desain modern, responsif, dark/light theme
│   └── js/
│       ├── app.js              # Controller utama & routing tampilan
│       ├── data-store.js       # Data store materi & bank soal offline
│       ├── grading.js          # Mesin penilaian fill-in-the-blanks & nilai parsial
│       ├── materials.js        # Modul pembaca materi & Java syntax highlighting
│       ├── question-bank.js    # Repository soal, filter, & pengacakan ujian
│       ├── quiz-engine.js      # Engine ujian, input interaktif, timer, & palette
│       ├── results.js          # Laporan evaluasi hasil ujian & review per blank
│       └── storage.js          # Penyimpanan localStorage, export/import JSON
├── data/
│   ├── materials/
│   │   └── materials.json      # Struktur JSON materi kuliah PBO
│   └── questions/
│       └── questions.json      # Bank soal JSON terstruktur (24 soal valid)
└── tests/
    └── test-suite.js           # Pengujian otomatis integritas soal & grading
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dibangun murni menggunakan **HTML5, CSS3, dan JavaScript Modern (ES Modules)** tanpa memerlukan compiler build atau framework eksternal.

### Cara 1: Menggunakan Web Server Lokal (Direkomendasikan)

Jika Anda memiliki Python terpasang di komputer/perangkat Anda:

```bash
# Jalankan server statis lokal pada port 8080:
python3 -m http.server 8080
```

Lalu buka browser Anda di:
```
http://localhost:8080
```

Atau jika menggunakan Node.js:
```bash
npx serve .
```

---

## 🧪 Menjalankan Pengujian Otomatis

Untuk memastikan seluruh bank soal, pemetaan blank, dan mesin penilaian berfungsi normal:

```bash
node tests/test-suite.js
```

Hasil verifikasi:
- **226 tes passed (100% success)**.
- Seluruh 45 blank pada 24 soal terverifikasi valid dan cocok dengan template kode Java.
- Mesin penilaian teruji menangani normalisasi whitespace, nilai parsial, dan deteksi kelemahan topik.

---

## 📖 Silabus & Bab yang Dicakup

1. **Bab 1: Pengantar PBO & Bahasa Java** (JVM, Bytecode, `javac`, `java`, Blueprint Class vs Instance Object, Atribut & Method).
2. **Bab 2: Statements, Expressions, Variabel, Tipe Data & Operator** (`static` vs instance, tipe primitif vs referensi, immutability String, `==` vs `.equals()`, `Scanner`, pre/post-increment, type-casting).
3. **Bab 3: Array dan ArrayList** (Larik objek, alokasi memori `new`, default value `0.0`/`null`, properti `.length`, enhanced for-each, `ArrayList<T>`, `.add()`, `.get()`, `.remove()`, `.size()`).
4. **Bab 4: Abstraksi dan Enkapsulasi** (Information hiding, `private`, `protected`, `public`, getter/setter, keyword `this`, `abstract class` & method).
5. **Bab 5: Pewarisan (Inheritance)** (Hubungan is-a, keyword `extends`, single inheritance, constructor chaining, keyword `super(...)` di baris pertama, akses `protected`).
6. **Bab 6: Polimorfisme (Polymorphism)** (Compile-time overloading vs runtime overriding, anotasi `@Override`, Dynamic Method Dispatch, koleksi objek polimorfik).
