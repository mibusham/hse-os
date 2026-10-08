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

## 3. Pengaktifan Penuh Fungsi Interaktif (8 Oktober 2026)
Semua fungsi statutori kini telah dihidupkan sepenuhnya (100% Operational) dan disambungkan ke pangkalan data Google Cloud Firestore & storan luar talian:

1. **Pillar 1: DOSH Statutory & Site Ops (`DoshOpsPillarView`)**
   - **Permit To Work (PTW) Digital:** Borang keluarkan PTW baharu, butang kawalan permit (Tutup Permit, Batal / Stop Work, Aktifkan Semula), dan penjejakan masa sah.
   - **Pemeriksaan 7-Hari Berkanun (OSHA 2022):** Borang daftar tag pemeriksaan perancah, jentera & loji; fungsi tukar status Green Tag (Safe) / Red Tag (Stop Work) secara langsung.
   - **Safe Man-Hours Logger:** Pengiraan automatik formula A × B × C = D dengan butang simpan lejar bulanan terkumpul.

2. **Pillar 2: CDM 2024 Governance Studio (`CdmStudioPillarView`)**
   - **Borang JKKP 103 (PDF / Cetakan Rasmi):** Modal paparan statutori rasmi berformat kepala surat JKKP sedia untuk dicetak (`window.print()`) dan diserahkan ke Pejabat DOSH Negeri Pulau Pinang.
   - **Direktori Pemegang Amanah (Duty Holders):** Borang kemas kini pelantikan Klien (Reg. 4), PCWD (Reg. 6), PCWC (Reg. 10), dan SHO Seksyen 29 dengan nombor pendaftaran badan profesional.
   - **Dossier PCI & CPP:** Senarai semak interaktif dengan bar peratusan kemajuan fail keselamatan.

3. **Pillar 3: DOE / JAS Environment & ESCP (`DoeEnvPillarView`)**
   - **Log Ujian Air TSS:** Borang kemas kini bacaan TSS (mg/L), pH, dan kekeruhan NTU kolam silt trap dengan amaran automatik had 50 mg/L JAS.
   - **Kawalan Wash Trough:** Butang suis status pam jet basuh tayar (Online Auto / Maintenance).
   - **e-SWIS Buangan Berjadual:** Borang daftar buangan berjadual (SW 305/SW 306/SW 409/SW 410) dengan pengiraan had 180 hari.

4. **Pillar 4: Health, CLQ & Welfare Suite (`HealthWelfarePillarView`)**
   - **Kawalan Vektor Aedes (Akta 130):** Log semburan thermal fogging dan abate larviciding dengan meter kitaran 14-hari automatik.
   - **Heat Stress Index (WBGT):** Slider suhu interaktif dengan pengkelasan risiko automatik (Normal / Waspada / Bahaya) dan panduan rehat berkanun.
   - **CLQ Akta 446:** Kawalan kapasiti pekerja dan perakuan penginapan JTKSM.

5. **Pillar 5: Corporate & Subcontractor Vetting (`CorporateSubconPillarView`)**
   - **Pendaftaran Subkontraktor Baharu:** Borang pendaftaran syarikat, pengkhususan skop kerja, gred CIDB G1-G7, polisi insurans CAR, tarikh luput, dan bilangan pekerja berkad hijau.
   - **Status Saringan:** Butang tukar status kelulusan (Approved / Pending Docs).

6. **Analytics & Statutory Reports (`ReportsAnalyticsPillarView`)**
   - Menggabungkan data masa-nyata dari semua pilar (Man-hours, PTWs, Inspections, Subcontractors, Kualiti Air TSS).
   - Penjana Laporan Bulanan SHO rasmi lengkap dengan butang cetak PDF berkanun.

7. **Navigasi Terhubung (`App.tsx` & `ExecutiveMatrixView`)**
   - Klik mana-mana kad modul sintesis AI atau amaran Action Radar terus membuka pilar statutori yang berkenaan.

