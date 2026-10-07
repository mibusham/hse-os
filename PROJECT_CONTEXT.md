# PROJECT_CONTEXT.md — HSE OS (Health, Safety & Environment Operating System)

> **Tarikh Kemaskini:** 7 Oktober 2026  
> **Status Semasa:** LIVE PRODUCTION DI GOOGLE CLOUD PLATFORM  
> **Aplikasi Rasmi:** [https://hse-os-cloud.web.app](https://hse-os-cloud.web.app) *(Alternatif: https://hse-os-cloud.firebaseapp.com)*  
> **Kod Sumber:** `C:\Users\Admin\.gemini\antigravity\scratch\hse-os`  
> **Dasar Keselamatan:** STRICT ZERO-TOUCH POLICY ke atas projek legacy Dawson / Everine di `C:\Users\Admin\Downloads\dawson-safety-dashboard (8)` & `ytchse.site`.

---

## 1. Ringkasan Pencapaian Hari Ini (7 Oktober 2026)

### A. Migrasi Infrastruktur Pangkalan Data ke Google Cloud
- Berikutan amaran kuota (Egress Exceeded / Grace Period) pada akaun Supabase pihak ketiga, keputusan strategik telah dibuat untuk memanfaatkan ekosistem **Google Cloud Platform (GCP)** milik pengguna (Google AI Pro pakej).
- **Google Cloud Firestore Database (`hse-os-cloud`)** diaktifkan sebagai pangkalan data utama HSE OS:
  - Kuota harian yang sangat tinggi (50,000 document reads, 20,000 document writes percuma setiap hari).
  - Integrasi masa-nyata (Realtime Sync) dengan enjin Google AI / Gemini.
  - Fail konfigurasi: `src/services/firebase.ts` & `src/services/projectService.ts`.
  - Dilengkapi sistem simpanan luar talian (Resilient Local Cache) untuk menjamin aplikasi sifar-terputus.

### B. Pelancaran Rasmi ke Google Firebase Hosting (Live Online)
- HSE OS telah dikompil dan di-deploy secara rasmi ke pelayan awan Google (Google Global Edge CDN).
- Domain awan langsung yang boleh diakses dari telefon pintar, tablet, atau komputer riba:
  - **URL Utama:** `https://hse-os-cloud.web.app`
  - Dilengkapi sijil keselamatan SSL HTTPS percuma dari Google.

### C. Sokongan Penuh Projek Perumahan Bertanah (Landed Housing & Terraced)
- Menambah kategori skop projek baharu: **`LANDED_RESIDENTIAL`** (Rumah Teres / Berkembar / Banglo) khas untuk projek sebenar pengguna (cth: **Eco Sun Phase 2, Bandar Cassia, Seberang Perai Selatan** — 90 unit rumah teres 2 tingkat, surau, dewan komuniti, stesen TNB).
- Menyesuaikan parameter teknikal tapak:
  - Menetapkan tingkat rumah lalai kepada 2 tingkat.
  - Menutup keperluan *Deep Excavation / Basement* yang tidak berkaitan dengan tapak perumahan teres.
  - Mengaktifkan modul sintesis AI khusus:
    - *Site Logistics, Backhoe & Mobile Plant Traffic Plan*
    - *Roof Truss, Rafters & Fall Prevention System*
    - *Tubular Frame Scaffolding & Bricklaying Platforms*

### D. Penambahbaikan Tipografi Tajuk Kontrak Panjang
- Menyelesaikan isu tajuk kontrak JKKP yang terlalu panjang memanjang ke bawah.
- Memperkenalkan medan baharu **Short Project Name** untuk paparan tajuk utama dashboard & header atas yang kemas dan berwibawa.
- Tajuk kontrak statutori penuh disimpan dalam kad tersusun dengan fungsi *expand/collapse*.

### E. Penyelarasan Statutori: Pemansuhan BOWEC 1986 & Penguatkuasaan OSHA 2022 / CDM 2024
- Selaras dengan perundangan rasmi Jabatan Keselamatan dan Kesihatan Pekerjaan (JKKP / DOSH), rujukan lama **BOWEC 1986 yang telah dimansuhkan telah dibuang sepenuhnya**.
- Digantikan dengan rangka kerja undang-undang semasa:
  - **Akta Keselamatan dan Kesihatan Pekerjaan (Pindaan) 2022 [Akta A1648 / OSHA 1994]**
  - **Peraturan-Peraturan KKP (Pengurusan Reka Bentuk dan Pembinaan) 2024 [CDM 2024]**

### F. Pembersihan Menyeluruh Data Olok-Olok (Zero Dummy Data)
- **Permit To Work (PTW):** Data olok-olok dikosongkan. Pengguna boleh menjana permit sebenar melalui butang `+ Keluarkan PTW Baru`.
- **Pemeriksaan 7-Hari:** Log perancah dan jentera dikosongkan sedia untuk pemeriksaan mingguan tapak sebenar.
- **Subkontraktor (Pillar 5):** Nama syarikat dummy dikosongkan ke status *Clean Empty State*.
- **Pemegang Amanah (Pillar 2):** Menggunakan nama Klien & Kontraktor Utama sebenar daripada input projek, manakala jawatan belum dilantik ditandakan sebagai *Pending Registration*.
- **Jam Bekerja Selamat:** Kiraan bermula dari sifar (0).

---

## 2. Struktur 5 Pilar Statutori HSE OS Semasa

| Pilar | Tajuk Modul | Fokus Pematuhan Undang-Undang |
|---|---|---|
| **Core** | Executive Command Matrix | AI Site Director summary, Site Twin zones, status sistem |
| **Pillar 1** | DOSH Statutory & Site Ops | Digital PTW, Pemeriksaan Perancah 7-Hari (OSHA 2022), Safe Man-Hours (A×B×C=D) |
| **Pillar 2** | CDM 2024 Governance Studio | Borang JKKP 103 (Notis Reg. 8), Direktori Duty Holders (Reg. 4, 6, 10), Fail PCI/CPP |
| **Pillar 3** | DOE / JAS Environment & ESCP | Ujian TSS Pelepasan Air Silt Trap (<50 mg/L), Sistem Wash Trough Jet Pump, eSWIS Buangan Berjadual 180-Hari |
| **Pillar 4** | Health, CLQ & Welfare Suite | Semburan Fogging Aedes 14-Hari (Akta 130), Indeks Tekanan Haba (WBGT), Penginapan Berpusat CLQ (Akta 446) |
| **Pillar 5** | Corporate & Subcon Vetting | Pendaftaran Gred CIDB G1-G7, Polisi Insurans CAR, Semakan 100% Kad Hijau CIDB |
| **Analytics** | Statutory Reports & Man-Hours | Penjana Laporan Bulanan SHO (Seksyen 29 OSHA 1994), Eksport/Cetak PDF mesyuarat SHC |

---

## 3. Langkah Seterusnya Untuk Sesi Akan Datang (Roadmap)
1. **Form Input Interaktif untuk Subkontraktor:** Menyediakan borang pendaftaran terus subkontraktor dan muat naik polisi insurans CAR ke Google Cloud Storage.
2. **Eksport Dokumen Rasmi PDF:** Menjana fail PDF rasmi Borang JKKP 103 berserta kepala surat (letterhead) kontraktor utama untuk diserahkan ke Pejabat DOSH Negeri Pulau Pinang.
3. **Penyimpanan Gambar Pemeriksaan Tapak:** Mengaktifkan Firebase Storage untuk membolehkan jurutera/SHO mengambil gambar keadaan tapak (Green/Red Tag) terus dari kamera telefon pintar.
