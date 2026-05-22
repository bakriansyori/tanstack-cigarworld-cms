## Ringkasan

Saya akan menyalin tampilan landing page **Golden Leaf Cigars** ke project ini, lalu menjadikan kontennya dinamis dengan CMS. Setelah selesai, Anda dan tim bisa login ke dashboard admin untuk mengubah teks hero, daftar produk, gambar, dan menulis artikel blog — tanpa menyentuh kode.

## Apa yang akan dibangun

### 1. Salinan landing page (publik)
Halaman publik dengan tampilan & nuansa coklat-emas yang sama dengan project asli:
- `/` — Beranda (Hero, About, Featured Products, CTA)
- `/products` — Katalog produk lengkap dari database
- `/products/:slug` — Detail satu produk
- `/blog` — Daftar artikel
- `/blog/:slug` — Detail artikel
- Semua teks, gambar, dan produk ditarik dari database — bukan hardcoded

Aset gambar (.webp produk, logo, font Cirkus) disalin dari project asli.

### 2. Dashboard CMS (admin)
Area admin di `/admin` dengan sidebar navigasi:
- **Dashboard** — ringkasan jumlah produk, artikel, user
- **Produk** — list, tambah, edit, hapus produk (nama, slug, deskripsi, harga, kategori, gambar utama, galeri, status published/draft)
- **Konten Halaman** — edit teks section beranda (hero title, hero subtitle, about heading, about body, CTA text, dll). Disimpan sebagai key-value sehingga mudah ditambah field baru
- **Blog** — list, tambah, edit, hapus artikel dengan editor teks kaya (judul, slug, cover, konten, status, tanggal publish)
- **Media Library** — upload, lihat, hapus gambar; bisa dipilih saat mengisi produk/artikel
- **Pengguna** — admin bisa undang/menghapus editor dan ubah peran

### 3. Autentikasi & Peran
- Login email + password (Lovable Cloud)
- Dua peran: **admin** (akses penuh termasuk manajemen user) dan **editor** (kelola produk, halaman, blog, media — tidak bisa hapus user)
- Halaman `/admin/*` dilindungi; non-login diarahkan ke `/login`
- Peran disimpan di tabel terpisah `user_roles` (best practice keamanan, mencegah privilege escalation)

## Pengalaman pengguna

**Untuk pengunjung publik:** website tampak persis seperti Golden Leaf Cigars yang sekarang — elegan, nuansa coklat & emas, font Cirkus untuk heading. Bedanya, semua konten kini bisa diperbarui kapan saja.

**Untuk admin/editor:**
1. Buka `/login`, masuk dengan email & password
2. Diarahkan ke `/admin` — sidebar kiri berisi menu (Dashboard, Produk, Konten Halaman, Blog, Media, Pengguna)
3. Edit produk → form dengan field lengkap, picker gambar dari media library, tombol Save & Publish
4. Perubahan langsung tampil di halaman publik setelah disimpan
5. Editor dapat semua menu kecuali Pengguna; Admin dapat semua

**Setup awal:** akun admin pertama dibuat lewat halaman signup yang aktif sekali, lalu otomatis dinonaktifkan. Admin pertama bisa mengundang user lain dari menu Pengguna.

## Struktur data (ringkas)

- `products` — id, slug, name, description, price, category, main_image, gallery, status, created_at
- `pages_content` — key (mis. `hero.title`), value (text/html), section
- `posts` — id, slug, title, cover_image, content (rich text), status, published_at, author_id
- `media` — id, url, filename, size, uploaded_by, created_at
- `profiles` — id (= auth.users.id), display_name, avatar
- `user_roles` — id, user_id, role (`admin` | `editor`)
- Storage bucket `media` (public read) untuk gambar

## Detail teknis

- **Frontend:** TanStack Start (struktur project ini), bukan React Router DOM seperti project asli. Setiap halaman jadi route file terpisah di `src/routes/` agar SSR & SEO optimal.
- **Auth & DB:** Lovable Cloud (Supabase). RLS aktif di semua tabel. Fungsi `has_role()` SECURITY DEFINER untuk cek peran tanpa rekursi.
- **Server functions:** semua query DB dibungkus `createServerFn` agar tidak bocor ke client bundle.
- **Editor teks kaya:** TipTap untuk konten blog & deskripsi panjang.
- **Upload gambar:** langsung ke Supabase Storage bucket `media`, simpan URL di tabel `media`.
- **Aset:** 32 gambar produk + logo + font Cirkus disalin dari project Golden Leaf Cigars asli.
- **Tema:** color tokens coklat & emas didefinisikan di `src/styles.css` sebagai design system, bukan hardcoded di komponen.

## Yang perlu Anda lakukan setelah implementasi

1. Buka `/signup` sekali untuk membuat akun admin pertama
2. Login, lalu isi/edit konten lewat dashboard
3. Undang anggota tim sebagai editor dari menu Pengguna

## Catatan ruang lingkup

- Halaman Kontak dengan form pengiriman email **tidak** termasuk — bisa ditambah di iterasi berikutnya
- Multi-bahasa (i18n) **tidak** termasuk
- Versioning/history konten **tidak** termasuk (hanya draft vs published)
- Migrasi otomatis konten lama dari project Golden Leaf Cigars **tidak** termasuk — saya akan seed data awal dengan beberapa contoh produk; sisanya Anda input lewat CMS

Setelah Anda menyetujui rencana ini, saya akan mulai implementasi.