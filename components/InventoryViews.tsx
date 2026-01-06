
import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import { StokBarang, Aset, Pelanggan, AssetSettings, Wilayah } from '../types';
import { X, Plus, Minus, Package, Info, Trash2, Edit2, AlertTriangle, Hash, Layers, Banknote, RefreshCw, Briefcase, Users, Landmark, TrendingUp, Monitor, Calculator, Zap, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import { MOCK_PAKET } from '../constants';

interface StokViewProps {
  stok: StokBarang[];
  wilayah: Wilayah[];
  onAdd: (item: StokBarang) => void;
  onUpdate: (item: StokBarang) => void;
  onDelete: (id: string) => void;
  onMovement: (id: string, amount: number) => void;
}

export const StokView: React.FC<StokViewProps> = ({ stok, wilayah, onAdd, onUpdate, onDelete, onMovement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StokBarang | null>(null);
  const [movementAmount, setMovementAmount] = useState<number>(1);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('OUT');
  const [movementNote, setMovementNote] = useState('');

  const [formData, setFormData] = useState<Partial<StokBarang>>({
    nama: '',
    wilayahId: wilayah[0]?.id || '',
    kategori: 'Hardware',
    jumlah: 0,
    satuan: 'Pcs',
    harga: 0
  });

  const SATUAN_OPTIONS = ['meter', 'Pcs', 'buah', 'Roll', 'Unit', 'Lot'];

  const columns = [
    { 
      header: 'Nama Barang', 
      accessor: (d: StokBarang) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{d.nama}</span>
          <div className="flex gap-1 items-center">
             <span className="text-[10px] text-slate-400 font-bold uppercase">{d.kategori}</span>
             {d.id.includes('sync') && (
               <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded w-fit uppercase border border-indigo-100">Auto-Sync</span>
             )}
          </div>
        </div>
      )
    },
    { 
      header: 'Wilayah', 
      accessor: (d: StokBarang) => {
        const w = wilayah.find(x => x.id === d.wilayahId);
        return <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">{w?.nama || 'Unknown'}</span>;
      } 
    },
    { 
      header: 'Stok Saat Ini', 
      accessor: (d: StokBarang) => (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black px-2 py-1 rounded-lg ${
            d.jumlah <= 0 ? 'bg-rose-100 text-rose-600' : 
            d.jumlah < 10 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {d.jumlah}
          </span>
          <span className="text-slate-400 text-xs font-medium uppercase">{d.satuan}</span>
        </div>
      ) 
    },
    { header: 'Harga Satuan', accessor: (d: StokBarang) => <span className="text-slate-600 font-medium">Rp {d.harga.toLocaleString()}</span> },
    { 
      header: 'Aksi Management', 
      accessor: (d: StokBarang) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedItem(d); setIsMovementOpen(true); }}
            className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1 uppercase"
          >
            <RefreshCw size={12} /> Kelola
          </button>
          <button 
            onClick={() => { setSelectedItem(d); setFormData(d); setIsModalOpen(true); }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setSelectedItem(d); setIsDeleteOpen(true); }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) 
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      onUpdate({ ...selectedItem, ...formData } as StokBarang);
    } else {
      onAdd({ ...formData, id: `stok-${Date.now()}` } as StokBarang);
    }
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({ nama: '', wilayahId: wilayah[0]?.id || '', kategori: 'Hardware', jumlah: 0, satuan: 'Pcs', harga: 0 });
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const finalAmount = movementType === 'IN' ? movementAmount : -movementAmount;
    onMovement(selectedItem.id, finalAmount);
    setIsMovementOpen(false);
    setMovementAmount(1);
    setMovementNote('');
  };

  return (
    <div className="space-y-6">
      <DataTable 
        title="Daftar Inventaris & Stok Barang" 
        data={stok} 
        columns={columns} 
        onAdd={() => { setSelectedItem(null); setFormData({ nama: '', wilayahId: wilayah[0]?.id || '', kategori: 'Hardware', jumlah: 0, satuan: 'Pcs', harga: 0 }); setIsModalOpen(true); }}
        addLabel="Tambah Barang Baru" 
      />

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50 text-indigo-900">
              <div className="flex items-center gap-3">
                <Package size={24} className="text-indigo-600" />
                <h3 className="text-xl font-bold">{selectedItem ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Barang</label>
                <input 
                  required
                  type="text" 
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Contoh: Router ZTE F609"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <MapPin size={14} /> Wilayah Lokasi
                </label>
                <select 
                  required
                  value={formData.wilayahId}
                  onChange={(e) => setFormData({...formData, wilayahId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                >
                  {wilayah.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                <select 
                  value={formData.kategori}
                  onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Kabel">Kabel</option>
                  <option value="Aksesori">Aksesori</option>
                  <option value="Alat Kerja">Alat Kerja</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {!selectedItem && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                      <Hash size={14} /> Stok Awal
                    </label>
                    <input 
                      required
                      type="number" 
                      value={formData.jumlah}
                      onChange={(e) => setFormData({...formData, jumlah: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                )}
                <div className={selectedItem ? "col-span-2" : ""}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <Layers size={14} /> Satuan
                  </label>
                  <select 
                    value={formData.satuan}
                    onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  >
                    {SATUAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <Banknote size={14} /> Harga Satuan (Rp)
                </label>
                <input 
                  required
                  type="number" 
                  value={formData.harga}
                  onChange={(e) => setFormData({...formData, harga: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-indigo-600"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Modal (Kelola) */}
      {isMovementOpen && selectedItem && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${movementType === 'IN' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
              <div className="flex items-center gap-3">
                <RefreshCw size={24} className={movementType === 'IN' ? 'text-emerald-600' : 'text-rose-600'} />
                <h3 className="text-xl font-bold">Kelola Stok</h3>
              </div>
              <button onClick={() => setIsMovementOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleMovementSubmit} className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Barang Terpilih</p>
                <p className="text-lg font-black text-slate-800 leading-tight">{selectedItem.nama}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                  <span className="text-xs font-bold text-slate-500">Stok Sekarang:</span>
                  <span className="text-xs font-black text-slate-900">{selectedItem.jumlah} {selectedItem.satuan}</span>
                </div>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${movementType === 'IN' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  <Plus size={14} /> BARANG MASUK
                </button>
                <button 
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${movementType === 'OUT' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  <Minus size={14} /> BARANG KELUAR
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah Unit</label>
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      min="1"
                      value={movementAmount}
                      onChange={(e) => setMovementAmount(Number(e.target.value))}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-3xl font-black text-slate-800"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold uppercase">{selectedItem.satuan}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan / Tujuan</label>
                  <textarea 
                    placeholder={movementType === 'OUT' ? "Contoh: Pemasangan pelanggan baru (ID: C102)" : "Contoh: Belanja stok bulanan"}
                    value={movementNote}
                    onChange={(e) => setMovementNote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm h-24 resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-4 rounded-2xl text-white font-bold transition-all shadow-lg active:scale-95 ${
                  movementType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                }`}
              >
                Konfirmasi Perubahan Stok
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && selectedItem && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Item Stok?</h3>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Anda yakin ingin menghapus <strong>{selectedItem.nama}</strong>? Data riwayat terkait item ini mungkin akan terpengaruh.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={() => { onDelete(selectedItem.id); setIsDeleteOpen(false); }}
                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-semibold shadow-lg shadow-rose-100 active:scale-95 transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AsetViewProps {
  assets: Aset[];
  customers: Pelanggan[];
  wilayah: Wilayah[];
  settings: AssetSettings;
  onAdd: (asset: Aset) => void;
  onUpdate: (asset: Aset) => void;
  onDelete: (id: string) => void;
}

export const AsetView: React.FC<AsetViewProps> = ({ assets, customers, wilayah, settings, onAdd, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'perusahaan' | 'pelanggan'>('perusahaan');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Aset | null>(null);

  const [formData, setFormData] = useState<Partial<Aset>>({
    nama: '',
    wilayahId: wilayah[0]?.id || '',
    kategori: 'IT',
    nilai: 0,
    kondisi: 'Baik',
    tanggalPerolehan: new Date().toISOString().split('T')[0]
  });

  // Helper for physical asset depreciation (Physical Assets)
  const calculateDepreciatedValue = (cost: number, acqDate: string) => {
    const acquisition = new Date(acqDate);
    const now = new Date();
    const ageInYears = (now.getTime() - acquisition.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    const salvageValue = cost * (settings.salvageValuePercent / 100);
    const annualDepreciation = (cost - salvageValue) / settings.depreciationLifespanYears;
    
    const totalDepreciation = annualDepreciation * ageInYears;
    const bookValue = Math.max(salvageValue, cost - totalDepreciation);
    
    return { bookValue, ageInYears, isDepreciated: ageInYears >= settings.depreciationLifespanYears };
  };

  // Helper for customer economic valuation (Economic/Subscription-focused)
  const calculateCustomerEconomicValue = (pelanggan: Pelanggan) => {
    const paket = MOCK_PAKET.find(p => p.id === pelanggan.paketId);
    const monthlyRevenue = paket?.harga || 0;
    
    // Hardware is now managed in "Aset Barang", so we focus strictly on Recurring Income
    const grossIncomeValue = monthlyRevenue * settings.valuationMultiplier;
    const bufferValue = grossIncomeValue * (settings.churnRateEstimate / 100);
    const netEconomicValue = grossIncomeValue - bufferValue;

    return { 
      monthlyRevenue, 
      grossIncomeValue, 
      netEconomicValue,
      valuationBuffer: bufferValue
    };
  };

  const stats = useMemo(() => {
    // 1. Company Assets (Physical Book Value)
    const companyStats = assets.reduce((acc, a) => {
      const { bookValue } = calculateDepreciatedValue(a.nilai, a.tanggalPerolehan);
      return { 
        originalValue: acc.originalValue + a.nilai,
        bookValue: acc.bookValue + bookValue 
      };
    }, { originalValue: 0, bookValue: 0 });

    // 2. Customer Assets (Economic Revenue Valuation)
    const activeCustomers = customers.filter(c => c.status === 'Aktif');
    const customerStats = activeCustomers.reduce((acc, c) => {
      const { netEconomicValue, monthlyRevenue } = calculateCustomerEconomicValue(c);
      return {
        totalNetValue: acc.totalNetValue + netEconomicValue,
        totalMonthlyRevenue: acc.totalMonthlyRevenue + monthlyRevenue
      };
    }, { totalNetValue: 0, totalMonthlyRevenue: 0 });

    const totalWealth = companyStats.bookValue + customerStats.totalNetValue;

    return { 
      companyStats, 
      customerStats, 
      totalWealth, 
      activeCount: activeCustomers.length 
    };
  }, [assets, customers, settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsset) {
      onUpdate({ ...selectedAsset, ...formData } as Aset);
    } else {
      onAdd({ ...formData, id: `aset-${Date.now()}` } as Aset);
    }
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  const companyColumns = [
    { 
      header: 'Info Perangkat', 
      accessor: (d: Aset) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{d.nama}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{d.kategori} | Perolehan: {d.tanggalPerolehan}</span>
        </div>
      )
    },
    { 
      header: 'Wilayah', 
      accessor: (d: Aset) => {
        const w = wilayah.find(x => x.id === d.wilayahId);
        return <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">{w?.nama || 'Unknown'}</span>;
      } 
    },
    { 
      header: 'Harga Beli', 
      accessor: (d: Aset) => <span className="text-slate-400 text-xs font-medium">Rp {d.nilai.toLocaleString()}</span> 
    },
    { 
      header: 'Nilai Buku (Saat Ini)', 
      accessor: (d: Aset) => {
        const { bookValue, isDepreciated } = calculateDepreciatedValue(d.nilai, d.tanggalPerolehan);
        return (
          <div className="flex flex-col">
            <span className="font-black text-indigo-600">Rp {Math.round(bookValue).toLocaleString()}</span>
            {isDepreciated && <span className="text-[8px] font-bold text-rose-500 bg-rose-50 px-1 rounded w-fit">DEPRECIATED</span>}
          </div>
        );
      }
    },
    { 
      header: 'Kondisi', 
      accessor: (d: Aset) => (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
          d.kondisi === 'Baik' ? 'bg-emerald-50 text-emerald-600' : 
          d.kondisi === 'Perbaikan' ? 'bg-amber-50 text-amber-600' : 
          'bg-rose-50 text-rose-600'
        }`}>
          {d.kondisi}
        </span>
      ) 
    },
    {
      header: 'Aksi',
      accessor: (d: Aset) => (
        <div className="flex items-center gap-2 justify-end">
          <button 
            onClick={() => { setSelectedAsset(d); setFormData(d); setIsModalOpen(true); }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setSelectedAsset(d); setIsDeleteOpen(true); }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const customerColumns = [
    { 
      header: 'Identitas Pelanggan', 
      accessor: (p: Pelanggan) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{p.nama}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Layanan Bulanan: Tgl {p.tanggalTagihan}</span>
        </div>
      )
    },
    { 
      header: 'Wilayah', 
      accessor: (p: Pelanggan) => {
        const w = wilayah.find(x => x.id === p.wilayahId);
        return <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">{w?.nama || 'Unknown'}</span>;
      } 
    },
    { 
      header: 'Income / Bulan', 
      accessor: (p: Pelanggan) => {
        const paket = MOCK_PAKET.find(pk => pk.id === p.paketId);
        return <span className="text-slate-500 font-black text-xs">Rp {paket?.harga.toLocaleString()}</span>;
      }
    },
    { 
      header: 'Valuasi Kontrak (X)', 
      accessor: (p: Pelanggan) => {
        const { grossIncomeValue } = calculateCustomerEconomicValue(p);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-700">Rp {grossIncomeValue.toLocaleString()}</span>
            <span className="text-[9px] text-slate-400 font-bold">Projected {settings.valuationMultiplier} Mo.</span>
          </div>
        );
      }
    },
    { 
      header: 'Nilai Ekuitas Bersih', 
      accessor: (p: Pelanggan) => {
        const { netEconomicValue } = calculateCustomerEconomicValue(p);
        return (
          <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl w-fit">
            <span className="font-black text-emerald-600">Rp {Math.round(netEconomicValue).toLocaleString()}</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* PROFESSIONAL WEALTH DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Net Worth Bisnis</p>
             </div>
             <h2 className="text-4xl font-black">Rp {Math.round(stats.totalWealth).toLocaleString()}</h2>
             <div className="mt-4 flex items-center gap-3">
               <div className="bg-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/30">Valuasi Langganan: Aktif</div>
               <TrendingUp size={16} className="text-emerald-400" />
             </div>
           </div>
           <Landmark size={150} className="absolute -right-8 -bottom-8 text-white/5 -rotate-12" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Monitor size={20} /></div>
              <span className="text-[10px] font-black text-slate-300 uppercase">Fisik (Hardware)</span>
           </div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Aset Perusahaan Riil</p>
              <h4 className="text-2xl font-black text-slate-800">Rp {Math.round(stats.companyStats.bookValue).toLocaleString()}</h4>
              <p className="text-[10px] text-slate-400 mt-1 italic">Nilai beli perangkat di lokasi & kantor</p>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Landmark size={20} /></div>
              <span className="text-[10px] font-black text-slate-300 uppercase">Ekonomi (Recurring)</span>
           </div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Ekuitas Langganan ({stats.activeCount})</p>
              <h4 className="text-2xl font-black text-slate-800">Rp {Math.round(stats.customerStats.totalNetValue).toLocaleString()}</h4>
              <div className="flex gap-2 mt-2">
                 <span className="text-[8px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">Projected Income</span>
                 <span className="text-[8px] font-bold bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded">Buffer {settings.churnRateEstimate}%</span>
              </div>
           </div>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('perusahaan')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'perusahaan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Monitor size={14} /> ASET FISIK
        </button>
        <button 
          onClick={() => setActiveTab('pelanggan')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'pelanggan' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Zap size={14} /> ASET EKONOMI (LANGGANAN)
        </button>
      </div>

      {activeTab === 'perusahaan' ? (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
             <Info size={20} className="text-indigo-500 mt-0.5 shrink-0" />
             <div className="text-xs text-indigo-700 leading-relaxed">
               <strong>Financial Info:</strong> Nilai ini mencakup perangkat fisik (ONT, Kabel, Server, Kendaraan) yang sudah Anda beli. Nilai akan berkurang setiap tahun (penyusutan) sesuai dengan konfigurasi masa pakai di Pengaturan.
             </div>
          </div>
          <DataTable 
            title="Daftar Aset Fisik & Hardware Perusahaan" 
            data={assets} 
            columns={companyColumns} 
            onAdd={() => { setSelectedAsset(null); setFormData({ nama: '', wilayahId: wilayah[0]?.id || '', kategori: 'IT', nilai: 0, kondisi: 'Baik', tanggalPerolehan: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
            addLabel="Tambah Aset Baru"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
             <Landmark size={20} className="text-emerald-500 mt-0.5 shrink-0" />
             <div className="text-xs text-emerald-700 leading-relaxed">
               <strong>Strategi Valuasi Bisnis:</strong> Pelanggan bernilai ekonomi tinggi karena memberikan pendapatan berulang (Langganan). Formula valuasi: <strong>(Pendapatan Paket x {settings.valuationMultiplier})</strong> dengan pengurang buffer churn sebesar <strong>{settings.churnRateEstimate}%</strong>.
             </div>
          </div>
          <DataTable 
            title="Daftar Valuasi Ekuitas Berdasarkan Langganan" 
            data={customers.filter(c => c.status === 'Aktif')} 
            columns={customerColumns} 
          />
        </div>
      )}

      {/* CRUD Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50 text-indigo-900">
              <div className="flex items-center gap-3">
                <Monitor size={24} className="text-indigo-600" />
                <h3 className="text-xl font-bold">{selectedAsset ? 'Edit Aset' : 'Tambah Aset Baru'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Aset</label>
                <input 
                  required
                  type="text" 
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Contoh: Mobil Operasional"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <MapPin size={14} /> Wilayah Lokasi
                </label>
                <select 
                  required
                  value={formData.wilayahId}
                  onChange={(e) => setFormData({...formData, wilayahId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                >
                  {wilayah.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                <select 
                  value={formData.kategori}
                  onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="Kendaraan">Kendaraan</option>
                  <option value="IT">IT (Server/PC)</option>
                  <option value="Hardware">Network Hardware</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Alat Kerja">Alat Kerja</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nilai Perolehan (Rp)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.nilai}
                    onChange={(e) => setFormData({...formData, nilai: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kondisi Barang</label>
                  <select 
                    value={formData.kondisi}
                    onChange={(e) => setFormData({...formData, kondisi: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Perbaikan">Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Tanggal Perolehan
                </label>
                <input 
                  required
                  type="date" 
                  value={formData.tanggalPerolehan}
                  onChange={(e) => setFormData({...formData, tanggalPerolehan: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && selectedAsset && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Aset Perusahaan?</h3>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Anda yakin ingin menghapus <strong>{selectedAsset.nama}</strong>? Tindakan ini akan menghapus data valuasi aset dari laporan kekayaan Anda.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={() => { onDelete(selectedAsset.id); setIsDeleteOpen(false); }}
                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-semibold shadow-lg shadow-rose-100 active:scale-95 transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
