
export type View = 'dashboard' | 'pelanggan' | 'tagihan' | 'stok' | 'aset' | 'pemasukan' | 'pengeluaran' | 'wilayah' | 'paket' | 'odp' | 'karyawan' | 'manajemen-user' | 'pengaturan-umum' | 'pengaturan-aplikasi' | 'pengaturan-aset' | 'pengaturan-hak-akses' | 'pengaturan-invoice' | 'laporan-laba-rugi' | 'laporan-aset' | 'laporan-saham' | 'laporan-bagihasil' | 'absensi';

export type Role = 'Owner' | 'Admin' | 'Teknisi' | 'Penarik';

export interface PemilikSaham {
  id: string;
  nama: string;
  nik: string;
  telepon: string;
  alamat: string;
  persentaseSaham: number;
  wilayahId: string; // Wilayah investasi utama
  nilaiModalAwal: number;
  tanggalBergabung: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: Role;
  assignedWilayahIds: string[]; 
  karyawanId?: string; 
}

export interface Absensi {
  id: string;
  karyawanId: string;
  tanggal: string; 
  jamMasuk: string;
  jamKeluar?: string;
  status: 'Hadir' | 'Izin' | 'Alpa' | 'Sakit' | 'Libur';
  fotoMasuk?: string; 
  keterangan?: string;
}

export interface JadwalKehadiran {
  id: string;
  karyawanId: string;
  bulan: string;
  tahun: number;
  tanggalLibur: string[]; // Array of ISO dates YYYY-MM-DD
}

export interface Karyawan {
  id: string;
  nama: string;
  nik: string;
  telepon: string;
  alamat: string;
  posisi: string;
  tanggalBergabung: string;
  status: 'Aktif' | 'Cuti' | 'Resign';
  gajiPokok: number;
  tunjanganHarian: number;
}

export interface AssetSettings {
  depreciationLifespanYears: number;
  salvageValuePercent: number;
  valuationMultiplier: number;
  churnRateEstimate: number;
}

export interface InvoiceSettings {
  useVAT: boolean;
  vatPercent: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  carryOverUnpaid: boolean;
  footerMessage: string;
}

export interface Pelanggan {
  id: string;
  nama: string;
  nik: string;
  alamat: string;
  rt: string;
  rw: string;
  wilayahId: string;
  paketId: string;
  odpId: string;
  status: 'Aktif' | 'Nonaktif';
  tanggalDaftar: string;
  tanggalTagihan: number;
  telepon: string;
}

export interface Tagihan {
  id: string;
  pelangganId: string;
  bulan: string;
  tahun: number;
  jumlah: number;
  diskon?: number;
  status: 'Lunas' | 'Belum Lunas';
  tanggalBayar?: string;
}

export interface Pengeluaran {
  id: string;
  tanggal: string;
  wilayahId: string; 
  kategori: string;
  keterangan: string;
  volume: number;
  satuan: string;
  hargaSatuan: number;
  jumlah: number;
}

export interface KategoriPengeluaran {
  id: string;
  nama: string;
  isSystem: boolean;
}

export interface StokBarang {
  id: string;
  nama: string;
  wilayahId: string; 
  kategori: string;
  jumlah: number;
  satuan: string;
  harga: number;
}

export interface Aset {
  id: string;
  nama: string;
  wilayahId: string; 
  kategori: string;
  nilai: number;
  kondisi: 'Baik' | 'Rusak' | 'Perbaikan';
  tanggalPerolehan: string;
}

export interface Wilayah {
  id: string;
  nama: string;
}

export interface Paket {
  id: string;
  nama: string;
  kecepatan: string;
  harga: number;
}

export interface ODP {
  id: string;
  nama: string;
  wilayahId: string;
  kapasitas: number;
  terisi: number;
}
