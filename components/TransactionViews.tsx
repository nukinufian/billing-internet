
import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { Tagihan, Pelanggan, Pengeluaran, KategoriPengeluaran, Wilayah } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Plus, X, Calendar, Tag, FileText, Wallet, Settings2, Trash2, Info, Hash, Banknote, RefreshCw, Layers, MapPin, Edit2, AlertTriangle, Save } from 'lucide-react';

// --- PEMASUKAN VIEW ---
interface PemasukanViewProps {
  bills: Tagihan[];
  customers: Pelanggan[];
}

export const PemasukanView: React.FC<PemasukanViewProps> = ({ bills, customers }) => {
  const paidBills = bills.filter(b => b.status === 'Lunas');
  
  const columns = [
    { 
      header: 'Tanggal Bayar', 
      accessor: (b: Tagihan) => <span className="text-slate-500 font-medium">{b.tanggalBayar || '-'}</span> 
    },
    { 
      header: 'Pelanggan', 
      accessor: (b: Tagihan) => {
        const p = customers.find(cust => cust.id === b.pelangganId);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{p?.nama || 'Unknown'}</span>
            <span className="text-[10px] text-slate-400 font-mono">{p?.nik}</span>
          </div>
        );
      }
    },
    { 
      header: 'Periode', 
      accessor: (b: Tagihan) => <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{b.bulan} {b.tahun}</span> 
    },
    { 
      header: 'Jumlah Masuk', 
      accessor: (b: Tagihan) => {
        const grandTotal = b.jumlah - (b.diskon || 0);
        return (
          <div className="flex flex-col items-end">
            <span className="font-bold text-emerald-600">Rp {grandTotal.toLocaleString()}</span>
            {b.diskon ? <span className="text-[10px] text-slate-400 italic">Diskon: Rp {b.diskon.toLocaleString()}</span> : null}
          </div>
        );
      }
    }
  ];

  const totalPemasukan = paidBills.reduce((acc, curr) => acc + (curr.jumlah - (curr.diskon || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100 flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Total Pemasukan (Lunas)</p>
          <h2 className="text-4xl font-bold">Rp {totalPemasukan.toLocaleString()}</h2>
        </div>
        <div className="p-4 bg-emerald-500/50 rounded-2xl">
          <ArrowUpCircle size={48} />
        </div>
      </div>
      
      <DataTable 
        title="Riwayat Pemasukan Otomatis (Paid Invoices)" 
        data={paidBills.sort((a, b) => (b.tanggalBayar || '').localeCompare(a.tanggalBayar || ''))} 
        columns={columns} 
      />
    </div>
  );
};

// --- PENGELUARAN VIEW ---
interface PengeluaranViewProps {
  expenses: Pengeluaran[];
  onAddExpense: (exp: Pengeluaran) => void;
  onUpdateExpense: (exp: Pengeluaran) => void;
  onDeleteExpense: (id: string) => void;
  categories: KategoriPengeluaran[];
  wilayah: Wilayah[]; 
  onAddCategory: (cat: KategoriPengeluaran) => void;
  onDeleteCategory: (id: string) => void;
}

export const PengeluaranView: React.FC<PengeluaranViewProps> = ({ 
  expenses, 
  onAddExpense, 
  onUpdateExpense,
  onDeleteExpense,
  categories, 
  wilayah,
  onAddCategory,
  onDeleteCategory 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Pengeluaran | null>(null);
  const [newCatName, setNewCatName] = useState('');
  
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    wilayahId: wilayah[0]?.id || '', 
    kategori: 'Bayar Internet',
    keterangan: '',
    volume: 1,
    satuan: 'Pcs',
    hargaSatuan: 0,
    jumlah: 0
  });

  const SATUAN_OPTIONS = ['meter', 'Pcs', 'buah', 'Roll', 'Unit', 'Lot'];

  useEffect(() => {
    if (wilayah.length > 0 && !formData.wilayahId) {
      setFormData(prev => ({ ...prev, wilayahId: wilayah[0].id }));
    }
  }, [wilayah]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      jumlah: prev.volume * prev.hargaSatuan
    }));
  }, [formData.volume, formData.hargaSatuan]);

  const columns = [
    { header: 'Tanggal', accessor: (d: Pengeluaran) => <span className="text-slate-500 font-medium">{d.tanggal}</span> },
    { 
      header: 'Wilayah', 
      accessor: (d: Pengeluaran) => {
        const w = wilayah.find(x => x.id === d.wilayahId);
        return <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">{w?.nama || 'Unknown'}</span>;
      } 
    },
    { 
      header: 'Kategori', 
      accessor: (d: Pengeluaran) => (
        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${
          d.kategori === 'Aset Barang' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
        }`}>
          {d.kategori}
        </span>
      ) 
    },
    { 
      header: 'Uraian', 
      accessor: (d: Pengeluaran) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{d.keterangan}</span>
          <span className="text-[10px] text-slate-400 italic">
            {d.volume} {d.satuan} x Rp {d.hargaSatuan.toLocaleString()}
          </span>
        </div>
      ) 
    },
    { 
      header: 'Total', 
      accessor: (d: Pengeluaran) => <span className="font-black text-rose-600">- Rp {d.jumlah.toLocaleString()}</span> 
    },
    {
      header: 'Aksi',
      accessor: (d: Pengeluaran) => (
        <div className="flex items-center gap-2 justify-end">
          <button 
            onClick={() => {
              setSelectedExpense(d);
              setFormData({
                tanggal: d.tanggal,
                wilayahId: d.wilayahId,
                kategori: d.kategori,
                keterangan: d.keterangan,
                volume: d.volume,
                satuan: d.satuan,
                hargaSatuan: d.hargaSatuan,
                jumlah: d.jumlah
              });
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Edit Pengeluaran"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => {
              setSelectedExpense(d);
              setIsDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Hapus Pengeluaran"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const totalPengeluaran = expenses.reduce((acc, curr) => acc + curr.jumlah, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.jumlah <= 0) return;
    
    if (selectedExpense) {
      onUpdateExpense({
        ...formData,
        id: selectedExpense.id
      });
    } else {
      onAddExpense({
        ...formData,
        id: `exp-${Date.now()}`
      });
    }
    
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setSelectedExpense(null);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      wilayahId: wilayah[0]?.id || '',
      kategori: 'Bayar Internet',
      keterangan: '',
      volume: 1,
      satuan: 'Pcs',
      hargaSatuan: 0,
      jumlah: 0
    });
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory({
      id: `cat-custom-${Date.now()}`,
      nama: newCatName.trim(),
      isSystem: false
    });
    setNewCatName('');
  };

  const executeDelete = () => {
    if (selectedExpense) {
      onDeleteExpense(selectedExpense.id);
      setIsDeleteConfirmOpen(false);
      setSelectedExpense(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-rose-600 p-8 rounded-[2rem] text-white shadow-xl shadow-rose-100 flex items-center justify-between">
        <div>
          <p className="text-rose-100 text-sm font-medium uppercase tracking-wider mb-1">Total Pengeluaran Operasional</p>
          <h2 className="text-4xl font-bold">Rp {totalPengeluaran.toLocaleString()}</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsCatModalOpen(true)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex flex-col items-center gap-1 min-w-[100px]"
          >
            <Settings2 size={24} />
            <span className="text-[10px] font-bold uppercase">Kategori</span>
          </button>
          <div className="p-4 bg-rose-500/50 rounded-2xl">
            <ArrowDownCircle size={48} />
          </div>
        </div>
      </div>

      <DataTable 
        title="Riwayat Pengeluaran" 
        data={expenses.sort((a, b) => b.tanggal.localeCompare(a.tanggal))} 
        columns={columns} 
        onAdd={() => { resetForm(); setIsModalOpen(true); }}
        addLabel="Input Pengeluaran"
      />

      {/* Manual Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${selectedExpense ? 'bg-indigo-50 text-indigo-900' : 'bg-rose-50 text-rose-900'}`}>
              <div className="flex items-center gap-3">
                {selectedExpense ? <Edit2 size={24} className="text-indigo-600" /> : <Wallet size={24} className="text-rose-600" />}
                <h3 className="text-xl font-bold">{selectedExpense ? 'Edit Pengeluaran' : 'Input Pengeluaran'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form 
              onSubmit={handleSubmit} 
              className="p-8 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Tanggal Transaksi
                </label>
                <input 
                  required
                  type="date" 
                  value={formData.tanggal}
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <MapPin size={14} /> Wilayah Operasional
                </label>
                <select 
                  required
                  value={formData.wilayahId}
                  onChange={(e) => setFormData({...formData, wilayahId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                >
                  {wilayah.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <Tag size={14} /> Kategori
                </label>
                <select 
                  value={formData.kategori}
                  onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                >
                  {categories.map(cat => <option key={cat.id} value={cat.nama}>{cat.nama}</option>)}
                </select>
              </div>

              {formData.kategori === 'Aset Barang' && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 text-indigo-700 text-xs font-bold">
                    <RefreshCw size={16} className="animate-spin-slow" />
                    <span>TRIPLE-SYNC AKTIF</span>
                  </div>
                  <p className="text-[10px] text-indigo-600 leading-relaxed">
                    Data ini akan otomatis tercatat di:
                    <br/>• <strong>Laporan Keuangan</strong> (Pengeluaran)
                    <br/>• <strong>Manajemen Aset</strong> (Aset Perusahaan)
                    <br/>• <strong>Stok Barang</strong> (Inventaris)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <FileText size={14} /> Uraian Pengeluaran {formData.kategori === 'Aset Barang' ? '(Nama Barang/Aset)' : ''}
                </label>
                <textarea 
                  required
                  placeholder={formData.kategori === 'Aset Barang' ? "Contoh: Router Mikrotik RB450Gx4" : "Contoh: Pembayaran internet backbone"}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <Hash size={14} /> Volume
                  </label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    placeholder="1"
                    value={formData.volume}
                    onChange={(e) => setFormData({...formData, volume: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <Layers size={14} /> Satuan
                  </label>
                  <select 
                    value={formData.satuan}
                    onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                  >
                    {SATUAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <Banknote size={14} /> Harga Satuan
                  </label>
                  <input 
                    required
                    type="number" 
                    placeholder="0"
                    value={formData.hargaSatuan || ''}
                    onChange={(e) => setFormData({...formData, hargaSatuan: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Total Pengeluaran (Otomatis)</label>
                <div className={`w-full py-4 rounded-2xl text-2xl font-black text-center shadow-inner border ${selectedExpense ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                  Rp {formData.jumlah.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-1">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className={`flex-1 px-4 py-3 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${selectedExpense ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
                >
                  <Save size={18} />
                  {selectedExpense ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedExpense && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Pengeluaran?</h3>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Anda yakin ingin menghapus data pengeluaran <strong>"{selectedExpense.keterangan}"</strong> senilai <strong>Rp {selectedExpense.jumlah.toLocaleString()}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-semibold shadow-lg shadow-rose-100 active:scale-95 transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Kelola Kategori</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <form onSubmit={handleAddCat} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Nama kategori baru..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
                  <Plus size={20} />
                </button>
              </form>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daftar Kategori</label>
                <div className="max-h-[250px] overflow-y-auto space-y-1 pr-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className={cat.isSystem ? 'text-indigo-400' : 'text-slate-400'} />
                        <span className="text-sm font-medium text-slate-700">{cat.nama}</span>
                      </div>
                      {cat.isSystem ? (
                        <span className="text-[8px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">Sistem</span>
                      ) : (
                        <button 
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsCatModalOpen(false)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
