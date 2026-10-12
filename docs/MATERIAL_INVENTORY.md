# INVENTARISASI DAN AUDIT MATERI KULIAH PEMROGRAMAN BERORIENTASI OBJEK (PBO)

Dokumen ini disusun sebagai inventarisasi resmi seluruh materi ajar yang ditemukan pada direktori proyek. Seluruh bank soal, modul materi interaktif, dan simulasi ujian pada simulator ini diturunkan langsung dari dokumen-dokumen berikut.

---

## 1. Ringkasan Eksekutif & Status Audit

- **Total File Materi yang Ditemukan**: 8 file PDF (total 509 halaman slide).
- **Status Pembacaan**: 100% Berhasil diekstrak dan dianalisis teksnya (tidak ada file rusak atau murni scan tanpa teks).
- **Sumber Institusi & Pengampu**: Jurusan Teknik Informatika, Universitas Mataram (UNRAM), Dosen: Royana Afwani, S.T., M.T. dan Tim Dosen PBO UNRAM.
- **Bahasa Pengantar**: Materi tersedia dalam dua bahasa yang saling melengkapi (Edisi Bahasa Indonesia dan Edisi Bahasa Inggris/Eng).

---

## 2. Tabel Inventarisasi File Materi

| No | Nama File Asli | Jumlah Halaman | Ukuran Karakter Teks | Status Pembacaan | Topik Utama & Modul |
|---|---|---|---|---|---|
| 1 | `Materi PBO-1 dan 2 Pengantar Pemrograman Berorientasi Objek, PBO Pada Java_copy (1).pdf` | 67 | 17.299 | **SUKSES DIBACA** | Pengantar Paradigma PBO, Prosedural vs OOP, Kompilasi Java (`javac`, `java`, JVM, Bytecode), Class & Object, Atribut & Method |
| 2 | `Eng_PBO2_OOP and Java Introduction_copy (3).pdf` | 51 | 18.717 | **SUKSES DIBACA** | OOP & Java Introduction (English Edition): Why Java, Real-world Object Analogy (Mobil, Rekening), State & Behavior, Class Blueprint, Anatomy of Class |
| 3 | `PBO-4 JAVA Pernyataan, ekspresi, variabel, tipe data, dll_copy (1).pdf` | 108 | 24.080 | **SUKSES DIBACA** | Pernyataan (Statements), Ekspresi, Kata Kunci (Keywords), Variabel, Scope Variabel (Local, Instance, Class), Tipe Data Primitif, Operator, Konvensi Java |
| 4 | `PBO_3_StatementsExpressionsVariablesDataTypesOperators_copy (1).pdf` | 33 | 13.241 | **SUKSES DIBACA** | Primitive vs Reference Types, Memory Heap & Stack, Copy Trap, Equality (`==` vs `.equals()`), String Immutability, `Scanner`, Static Modifier, Type Casting |
| 5 | `PBO-5 Array, dan Arraylist_copy.pdf` | 34 | 10.144 | **SUKSES DIBACA** | Konsep Larik (Array 1D & Multidimensi), Deklarasi, Instansiasi (`new`), Default Value, Loop for, Array Resizing & Copy, Pengenalan ArrayList |
| 6 | `Eng_PBO_4_ArrayAndArrayList_copy.pdf` | 32 | 13.961 | **SUKSES DIBACA** | Array Declaration & Initialization, Enhanced for-each loop, `ArrayIndexOutOfBoundsException`, Class `java.util.Arrays`, `ArrayList<T>` methods (`add`, `get`, `set`, `remove`, `size`) |
| 7 | `PBO 5 dan 6 - Abstraksi, Enkapsulasi, Pewarisan, Polymorphism (2025)_copy.pdf` | 90 | 25.373 | **SUKSES DIBACA** | 4 Pilar OOP: Abstraksi (Design & Implementation: `abstract`, `interface`), Enkapsulasi (Access Modifiers, Getter/Setter), Pewarisan (`extends`, `super`, constructor chaining), Polimorfisme (Overloading vs Overriding) |
| 8 | `Eng_PBO_5_6_Abstraction_Encapsulation_Inheritance_Polymorphism_copy.pdf` | 94 | 38.701 | **SUKSES DIBACA** | The Four Pillars of OOP (English Edition 2025): Entity Selection, Information Hiding, Superclass/Subclass, Constructor chaining rules, Overloading vs Overriding rules, Heterogeneous collections |

---

## 3. Rincian Materi Per Bab & Pemetaan Silabus

### Bab 1: Pengantar Pemrograman Berorientasi Objek & Dasar Java
- **File Referensi**:
  - `Materi PBO-1 dan 2 Pengantar Pemrograman Berorientasi Objek, PBO Pada Java_copy (1).pdf` (Halaman 1–67)
  - `Eng_PBO2_OOP and Java Introduction_copy (3).pdf` (Halaman 1–51)
- **Topik Pembelajaran**:
  1. Paradigma Pemrograman: Prosedural/Terstruktur vs Berorientasi Objek (OOP).
  2. Eksekusi Program: Compiler vs Interpreter, Java Virtual Machine (JVM), Java Runtime Environment (JRE), Java Development Kit (JDK).
  3. Alur Kompilasi Java: Source Code (`.java`) -> `javac` -> Bytecode (`.class`) -> `java` -> JVM Mesin Target.
  4. Analogi Objek Dunia Nyata: Objek Mobil (Atribut: ban, roda kemudi, warna; Method: jalan, rem, belok).
  5. Konsep Dasar PBO:
     - **Class**: Blueprint/cetakan/deskripsi konsep objek.
     - **Object**: Instance konkret dari class yang menempati memori.
     - **Atribut (State)**: Data atau variabel yang dimiliki objek.
     - **Method (Behavior)**: Perilaku, aksi, atau fungsi yang dapat dilakukan objek.
  6. Struktur File Java & Method Utama (`public static void main(String[] args)`).
  7. Deklarasi Class Sederhana dan Pembuatan Objek dengan kata kunci `new`.
- **Potensi Soal Fill in the Blanks**:
  - Keyword `class`, `public static void main(String[] args)`, pembuatan objek `Mobil m = new Mobil();`.
  - Akses atribut dan method menggunakan operator titik (`m.warna = "Merah";`, `m.maju();`).

---

### Bab 2: Pernyataan, Ekspresi, Variabel, Tipe Data & Operator
- **File Referensi**:
  - `PBO-4 JAVA Pernyataan, ekspresi, variabel, tipe data, dll_copy (1).pdf` (Halaman 1–108)
  - `PBO_3_StatementsExpressionsVariablesDataTypesOperators_copy (1).pdf` (Halaman 1–33)
- **Topik Pembelajaran**:
  1. **Statements & Expressions**: Perbedaan baris perintah pengeksekusi (statement) dan penghasil nilai (expression).
  2. **Reserved Keywords**: Kata kunci resmi yang dilindungi oleh Java (`abstract`, `class`, `public`, `private`, `static`, `void`, `extends`, `final`, dll).
  3. **Variabel & Scope**:
     - *Local Variable*: Berada di dalam method/block kode, tidak memiliki nilai default, wajib diinisialisasi sebelum dibaca.
     - *Instance Variable*: Milik instance objek, memiliki nilai default (`0`, `false`, `null`).
     - *Class Variable (`static`)*: Menggunakan keyword `static`, dimiliki bersama oleh seluruh objek class, diakses via nama class.
  4. **Tipe Data Primitif vs Reference**:
     - Primitif: `byte` (8-bit), `short` (16-bit), `int` (32-bit), `long` (64-bit), `float`, `double`, `char`, `boolean`.
     - Reference: Objek, String, Array. Disimpan dalam heap memory, variabel hanya menyimpan referensi memori (pointer trap / copy trap).
  5. **Perbandingan Nilai**:
     - `==` untuk membandingkan kesamaan referensi / alamat memori objek atau nilai primitif.
     - `.equals()` untuk membandingkan kesamaan konten isi objek (misal `str1.equals(str2)`).
  6. **String & Scanner**:
     - String Immutability: String di Java tidak bisa diubah nilainya setelah dibuat.
     - Input Terminal: Menggunakan `java.util.Scanner` (`nextInt()`, `nextLine()`, `nextDouble()`).
  7. **Operator Java**:
     - Aritmatika (`+`, `-`, `*`, `/`, `%`).
     - Increment / Decrement: Pre-increment (`++x`) vs Post-increment (`x++`).
     - Relasional (`>`, `<`, `>=`, `<=`, `==`, `!=`).
     - Logika (`&&` short-circuit AND, `||` short-circuit OR, `!`).
     - Ternary (`kondisi ? ekspresi1 : ekspresi2`).
  8. **Type Casting**:
     - Widening (Otomatis): `int` ke `double`.
     - Narrowing (Manual): `(int) 3.14`.
- **Potensi Soal Fill in the Blanks**:
  - Deklarasi tipe data dan casting `(int) nilaiDouble`.
  - Operator post vs pre-increment (`y = 8 - x++;`).
  - Pemanggilan `.equals()` pada String vs `==`.
  - Inisialisasi Scanner `new Scanner(System.in)`.
  - Keyword `static` pada variabel bersama.

---

### Bab 3: Array dan ArrayList
- **File Referensi**:
  - `PBO-5 Array, dan Arraylist_copy.pdf` (Halaman 1–34)
  - `Eng_PBO_4_ArrayAndArrayList_copy.pdf` (Halaman 1–32)
- **Topik Pembelajaran**:
  1. **Konsep Array di Java**: Array adalah objek yang menampung elemen dengan tipe data sejenis.
  2. **Deklarasi dan Instansiasi**:
     - Deklarasi: `tipeData[] namaArray;`
     - Alokasi memori: `namaArray = new tipeData[panjang];`
     - Singkat: `int[] angka = new int[5];`
     - Inisialisasi langsung: `String[] buah = {"Apel", "Jeruk", "Mangga"};`
  3. **Nilai Default Elemen Array**: Angka integer (`0`), desimal (`0.0`), boolean (`false`), objek/String (`null`).
  4. **Akses Elemen & Properti `.length`**: Indeks berbasis nol (`0` sampai `length - 1`), error `ArrayIndexOutOfBoundsException`.
  5. **Iterasi**:
     - Standard loop for: `for (int i = 0; i < arr.length; i++)`
     - Enhanced for-each loop: `for (String s : buah)`
  6. **Array Multidimensi**: Array dua dimensi `int[][] matriks = new int[3][4];`, matriks jagged.
  7. **Utility Class `java.util.Arrays`**: `Arrays.sort()`, `Arrays.toString()`.
  8. **ArrayList (`java.util.ArrayList`)**:
     - Koleksi dinamis berukuran fleksibel (dapat membesar/mengecil otomatis).
     - Menggunakan Generics: `ArrayList<String> daftar = new ArrayList<>();`
     - Method esensial: `.add(item)`, `.get(index)`, `.set(index, item)`, `.remove(index)`, `.size()`, `.clear()`.
     - Perbandingan kritis: Array (panjang tetap, mendukung primitif) vs ArrayList (dinamis, hanya objek wrapper).
- **Potensi Soal Fill in the Blanks**:
  - Sintaks deklarasi array dan instansiasi `new int[ukuran]`.
  - Penggunaan `.length` (properti array) vs `.size()` (method ArrayList) vs `.length()` (method String).
  - Enhanced for-each loop sintaks `for (Tipe elem : array)`.
  - Method ArrayList: `.add(...)`, `.get(...)`, `.remove(...)`.

---

### Bab 4: Abstraksi dan Enkapsulasi (Pilar 1 & 2)
- **File Referensi**:
  - `PBO 5 dan 6 - Abstraksi, Enkapsulasi, Pewarisan, Polymorphism (2025)_copy.pdf` (Halaman 1–22)
  - `Eng_PBO_5_6_Abstraction_Encapsulation_Inheritance_Polymorphism_copy.pdf` (Halaman 1–22)
- **Topik Pembelajaran**:
  1. **Empat Pilar OOP**: Abstraksi, Enkapsulasi, Pewarisan, Polimorfisme.
  2. **Abstraksi (Design Level vs Implementation Level)**:
     - Design level: Menyeleksi karakteristik esensial dari entitas dunia nyata dan menyisihkan detail yang tidak relevan (Studi Kasus Koperasi: Anggota, Pengurus, Simpanan, Pinjaman).
     - Implementation level: Penggunaan `abstract class` dan `interface` untuk menentukan kontrak behavior.
  3. **Enkapsulasi (Information Hiding)**:
     - Definisi: Mengemas data (atribut) dan kode yang memanipulasinya (method) menjadi satu kesatuan serta menyembunyikan detail implementasi internal dari akses luar.
     - Keuntungan: Keamanan data, integritas validasi, modularitas kode.
  4. **Access Modifiers**:
     - `private`: Hanya dapat diakses di dalam kelas yang sama.
     - *(default/package-private)*: Dapat diakses di dalam satu package.
     - `protected`: Dapat diakses di package yang sama dan oleh subclass di package lain.
     - `public`: Dapat diakses dari mana saja.
  5. **Getter dan Setter**:
     - Getter (Accessor method): Mengembalikan nilai atribut private (`public double getPanjang() { return this.panjang; }`).
     - Setter (Mutator method): Mengubah nilai atribut private dengan validasi logika (`public void setPanjang(double p) { if (p > 0) this.panjang = p; }`).
  6. **Konstruktor**:
     - Method khusus tanpa return type yang dipanggil saat instansiasi objek.
     - Default/no-argument constructor vs parameterized constructor.
     - Penggunaan kata kunci `this` untuk mereferensikan instance variable saat terjadi parameter shadowing (`this.panjang = panjang;`).
- **Potensi Soal Fill in the Blanks**:
  - Keyword access modifier `private` pada atribut dan `public` pada getter/setter.
  - Implementasi getter dan setter (`return this.panjang;`, `this.lebar = lebar;`).
  - Konstruktor dengan parameter dan `this`.

---

### Bab 5: Pewarisan (Inheritance - Pilar 3)
- **File Referensi**:
  - `PBO 5 dan 6 - Abstraksi, Enkapsulasi, Pewarisan, Polymorphism (2025)_copy.pdf` (Halaman 23–66)
  - `Eng_PBO_5_6_Abstraction_Encapsulation_Inheritance_Polymorphism_copy.pdf` (Halaman 23–66)
- **Topik Pembelajaran**:
  1. **Konsep Pewarisan**:
     - Hubungan "is-a" (adalah seorang/sebuah): Subclass adalah bentuk spesifik dari Superclass.
     - Reusability kode: Subclass mewarisi atribut dan method dari Superclass tanpa perlu menulis ulang.
  2. **Keyword `extends`**: Sintaks `class Subclass extends Superclass`.
  3. **Single Inheritance di Java**: Di Java, suatu class hanya dapat meng-extend tepat 1 superclass secara langsung.
  4. **Pewarisan dan Access Modifier**:
     - Atribut/method bertipe `private` pada parent class TIDAK dapat diakses langsung oleh child class (harus melalui getter/setter atau diubah menjadi `protected`).
     - Atribut/method `protected` dapat diakses langsung oleh subclass.
  5. **Keyword `super`**:
     - `super()`: Memanggil constructor parent class. Wajib berada pada baris pertama di dalam constructor subclass!
     - `super.namaMethod()`: Memanggil method parent class jika di-override di subclass.
     - `super.namaVariabel`: Mengakses atribut parent class yang ter-shadowing.
  6. **Aturan Eksekusi Konstruktor pada Inheritance**:
     - Konstruktor TIDAK diwariskan ke subclass.
     - Sebelum subclass mengeksekusi body konstruktornya, konstruktor superclass SELALU dieksekusi terlebih dahulu.
     - Jika superclass memiliki no-arg constructor, pemanggilan `super()` terjadi secara implisit oleh compiler.
     - Jika superclass HANYA memiliki parameterized constructor (tanpa no-arg), subclass WAJIB memanggil `super(args)` secara eksplisit di baris pertama konstruktornya.
  7. **Contoh Nyata dari Slide Kuliah**:
     - `Person` (nama, usia) -> `Student` (nim, ipk).
     - `Sepeda` (gir, kecepatan) -> `SepedaGunung` (sadel, setGir).
     - `Employee` (name, salary) -> `Manager` (department).
     - `Matematika` (pertambahan, pengurangan) -> `MatematikaCanggih` (modulus).
- **Potensi Soal Fill in the Blanks**:
  - Keyword `extends` pada deklarasi subclass.
  - Pemanggilan `super(nama, usia)` pada baris pertama constructor subclass.
  - Penanganan access modifier `protected` untuk akses di subclass.
  - Pemanggilan `super.method()` untuk memperkaya behavior parent.

---

### Bab 6: Polimorfisme (Polymorphism - Pilar 4)
- **File Referensi**:
  - `PBO 5 dan 6 - Abstraksi, Enkapsulasi, Pewarisan, Polymorphism (2025)_copy.pdf` (Halaman 67–90)
  - `Eng_PBO_5_6_Abstraction_Encapsulation_Inheritance_Polymorphism_copy.pdf` (Halaman 67–94)
- **Topik Pembelajaran**:
  1. **Konsep Polimorfisme**: Kemampuan suatu entitas untuk mengambil banyak bentuk aksi melalui interface yang seragam ("one interface, multiple implementations").
  2. **Compile-time Polymorphism (Static Binding) — Method Overloading**:
     - Method-method dalam kelas yang sama memiliki NAMA YANG SAMA namun PARAMETER BERBEDA (jumlah parameter atau tipe parameter).
     - Return type tidak menentukan keunikan signature method.
     - Contoh dari slide: `gambarLingkaran()`, `gambarLingkaran(int diameter)`. Overloading constructor: `Employee()`, `Employee(String name, double salary)`.
  3. **Runtime Polymorphism (Dynamic Binding) — Method Overriding**:
     - Subclass mendefinisikan ulang method yang diwariskan dari parent class dengan nama dan parameter (signature) yang PERSIS SAMA.
     - Anotasi `@Override` untuk validasi kompiler.
     - Aturan Overriding:
       * Access modifier di subclass tidak boleh lebih ketat daripada di parent (misal parent `public`, subclass tidak boleh `protected` atau `private`).
       * Exception yang dilempar tidak boleh lebih luas.
     - Dynamic Method Dispatch: Keputusan implementasi method mana yang dipanggil ditentukan saat runtime berdasarkan objek aktual yang dibuat (`new`), bukan tipe referensi variabel.
  4. **Koleksi Polimorfik Heterogen**:
     - Variabel referensi superclass dapat menunjuk ke objek subclass apa pun: `Poligon p = new SegiEmpat();`
     - Array Poligon polimorfik: `Poligon[] arr = { new SegiEmpat(), new SegiTiga() };` lalu memanggil `arr[i].display()`.
  5. **Type Casting Objek & `instanceof`**:
     - Upcasting (otomatis): Subclass ke Superclass.
     - Downcasting: `(SegiEmpat) p` membutuhkan pengecekan `if (p instanceof SegiEmpat)`.
- **Potensi Soal Fill in the Blanks**:
  - Anotasi `@Override`.
  - Signature method overloading (parameter berbeda).
  - Dynamic method dispatch dan assignment polimorfik (`Parent p = new Child();`).
  - Pemanggilan method yang dioverride vs `super.namaMethod()`.

---

## 4. Kesimpulan Kesiapan Bank Soal

Seluruh materi di atas merupakan materi **asli dan otentik** dari slide kuliah dosen UNRAM. Simulator ini mengimplementasikan soal-soal latihan dan ujian tipe **Fill in the Blanks** berbasis kode Java yang valid, representatif, dan dapat dikompilasi, dengan referensi langsung ke halaman dan slide kuliah terkait.
