
import { Pelanggan, Paket, Wilayah, ODP, Karyawan, Tagihan, KategoriPengeluaran, Aset, User, Pengeluaran, Absensi, PemilikSaham } from './types';

export const SYSTEM_CATEGORIES: KategoriPengeluaran[] = [
  { id: 'cat-sys-1', nama: 'Bayar Internet', isSystem: true },
  { id: 'cat-sys-2', nama: 'Aset Barang', isSystem: true },
  { id: 'cat-sys-3', nama: 'Gaji Karyawan', isSystem: true },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'owner', password: 'password', nama: 'Budi (Owner)', role: 'Owner', assignedWilayahIds: [] },
  { id: 'u2', username: 'admin_barat', password: 'password', nama: 'Agus (Admin Barat)', role: 'Admin', assignedWilayahIds: ['w1'] },
  { id: 'u3', username: 'admin_selatan', password: 'password', nama: 'Siti (Admin Selatan)', role: 'Admin', assignedWilayahIds: ['w2'] },
  { id: 'u4', username: 'teknisi1', password: 'password', nama: 'Eko (Teknisi JKB & TGR)', role: 'Teknisi', assignedWilayahIds: ['w1', 'w3'], karyawanId: 'k1' },
];

export const MOCK_SAHAM: PemilikSaham[] = [
  { id: 'sh1', nama: 'Budi Santoso', nik: '3201010011220001', telepon: '081233445566', alamat: 'Kavling Elite No. 1', persentaseSaham: 60, wilayahId: 'w1', nilaiModalAwal: 500000000, tanggalBergabung: '2023-01-01' },
  { id: 'sh2', nama: 'Andi Wijaya', nik: '3201010011220002', telepon: '085566778899', alamat: 'Apartemen Green View', persentaseSaham: 25, wilayahId: 'w2', nilaiModalAwal: 200000000, tanggalBergabung: '2023-06-15' },
  { id: 'sh3', nama: 'Linda Sari', nik: '3201010011220003', telepon: '089900112233', alamat: 'Perumahan Graha Indah', persentaseSaham: 15, wilayahId: 'w3', nilaiModalAwal: 120000000, tanggalBergabung: '2024-02-10' },
];

export const MOCK_WILAYAH: Wilayah[] = [
  { id: 'w1', nama: 'Jakarta Barat' },
  { id: 'w2', nama: 'Jakarta Selatan' },
  { id: 'w3', nama: 'Tangerang' },
];

export const MOCK_PAKET: Paket[] = [
  { id: 'p1', nama: 'Home Basic', kecepatan: '10 Mbps', harga: 150000 },
  { id: 'p2', nama: 'Home Pro', kecepatan: '30 Mbps', harga: 250000 },
  { id: 'p3', nama: 'Gaming Turbo', kecepatan: '100 Mbps', harga: 500000 },
];

export const MOCK_ODP: ODP[] = [
  { id: 'o1', nama: 'ODP-JKB-01', wilayahId: 'w1', kapasitas: 16, terisi: 12 },
  { id: 'o2', nama: 'ODP-JKS-05', wilayahId: 'w2', kapasitas: 8, terisi: 5 },
  { id: 'o3', nama: 'ODP-TGR-09', wilayahId: 'w3', kapasitas: 16, terisi: 8 },
];

export const MOCK_KARYAWAN: Karyawan[] = [
  { id: 'k1', nama: 'Eko Prasetyo', nik: '3201010101010021', telepon: '08122334455', alamat: 'Perumahan Citra Indah', posisi: 'Teknisi Lapangan', tanggalBergabung: '2023-01-15', status: 'Aktif', gajiPokok: 3500000, tunjanganHarian: 50000 },
  { id: 'k2', nama: 'Siti Aminah', nik: '3201010101010022', telepon: '08554433221', alamat: 'Jl. Mawar No. 12', posisi: 'Admin Keuangan', tanggalBergabung: '2023-05-20', status: 'Aktif', gajiPokok: 4000000, tunjanganHarian: 30000 },
  { id: 'k3', nama: 'Bambang Susanto', nik: '3201010101010023', telepon: '08998877665', alamat: 'Kavling Bunga Raya', posisi: 'Teknisi Lapangan', tanggalBergabung: '2024-02-10', status: 'Aktif', gajiPokok: 3200000, tunjanganHarian: 50000 },
];

export const MOCK_ABSENSI: Absensi[] = [
  { id: 'abs1', karyawanId: 'k1', tanggal: '2026-05-01', jamMasuk: '08:00', jamKeluar: '17:00', status: 'Hadir' },
  { id: 'abs2', karyawanId: 'k1', tanggal: '2026-05-02', jamMasuk: '08:15', jamKeluar: '17:05', status: 'Hadir' },
  { id: 'abs3', karyawanId: 'k2', tanggal: '2026-05-01', jamMasuk: '08:00', jamKeluar: '16:30', status: 'Hadir' },
];

export const MOCK_PELANGGAN: Pelanggan[] = [
  { id: 'c1', nama: 'John Doe', nik: '3201010101010001', alamat: 'Jl. Melati No. 5', rt: '01', rw: '05', wilayahId: 'w1', paketId: 'p1', odpId: 'o1', status: 'Aktif', tanggalDaftar: '2023-10-15', tanggalTagihan: 5, telepon: '0811223344' },
  { id: 'c2', nama: 'Jane Smith', nik: '3201010101010002', alamat: 'Kavling Hijau Blok A', rt: '03', rw: '02', wilayahId: 'w2', paketId: 'p2', odpId: 'o2', status: 'Aktif', tanggalDaftar: '2024-05-01', tanggalTagihan: 1, telepon: '0855667788' },
];

export const MOCK_TAGIHAN: Tagihan[] = [
  { id: 't1', pelangganId: 'c1', bulan: 'Mei', tahun: 2026, jumlah: 150000, status: 'Lunas', tanggalBayar: '2026-05-05' },
];

export const MOCK_ASET: Aset[] = [
  { id: 'a1', nama: 'Mobil Operasional 01', wilayahId: 'w1', kategori: 'Kendaraan', nilai: 150000000, kondisi: 'Baik', tanggalPerolehan: '2023-01-10' },
];

export const MOCK_PENGELUARAN: Pengeluaran[] = [
  { id: 'exp1', tanggal: '2026-05-01', wilayahId: 'w1', kategori: 'Bayar Internet', keterangan: 'Pembayaran Bandwidth JKB', volume: 1, satuan: 'Lot', hargaSatuan: 5000000, jumlah: 5000000 },
];

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
