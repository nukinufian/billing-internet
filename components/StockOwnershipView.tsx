
import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import { PemilikSaham, Wilayah, AssetSettings, Aset, Pelanggan } from '../types';
import { Briefcase, UserPlus, X, Save, Edit2, Trash2, ShieldCheck, MapPin, Calendar, CreditCard, IdCard, Phone, TrendingUp, Landmark, PieChart } from 'lucide-react';
import { MOCK_PAKET } from '../constants';

interface StockOwnershipViewProps {
  owners: PemilikSaham[];
  wilayah: Wilayah[];
  assets: Aset[];
  customers: Pelanggan[];
  settings: AssetSettings;
  onAdd: (owner: PemilikSaham) => void;
  onUpdate: (owner: PemilikSaham) => void;
  onDelete: (id: string) => void;
}

const StockOwnershipView: React.FC<StockOwnershipViewProps> = ({ 
  owners, wilayah, assets, customers, settings, onAdd, onUpdate, onDelete 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<PemilikSaham | null>(null);
  const [formData, setFormData] = useState<Partial<PemilikSaham>>({
    nama: '',
    nik: '',
    telepon: '',
    alamat: '',
    persentaseSaham: 0,
    wilayahId: wilayah[0]?.id || '',
    nilaiModalAwal: 0,
    tanggalBergabung: new Date().toISOString().split('T')[0]
  });

  // Calculate Business Total Net Worth (Copy from ReportViews logic)
  const totalNetWorth = useMemo(() => {
    // Physical Assets Book Value
    const physicalVal = assets.reduce((acc, a) => {
      const acqDate = new Date(a.tanggalPerolehan);
      const now = new Date();
      const age = (now.getTime() - acqDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      const salvage = a.nilai * (settings.salvageValuePercent / 100);
      const annualDepr = (a.nilai - salvage) / settings.depreciationLifespanYears;
      const bookVal = Math.max(salvage, a.nilai - (annualDepr * Math.max(0, age)));
      return acc + bookVal;
    }, 0);

    // Economic Equity (Customers)
    const economicVal = customers.filter(c => c.status === 'Aktif').reduce((acc, c) => {
      const paket = MOCK_PAKET.find(pk => pk.id === c.paketId);
      const monthly = paket?.harga || 0;
      const gross = monthly * settings.valuationMultiplier;
      return acc + (gross - (gross * (settings.churnRateEstimate / 100)));
    }, 0);

    return physicalVal + economicVal;
  }, [assets, customers, settings]);

  const stats = useMemo(() => {
    const totalSharesAllocated = owners.reduce((acc, o) => acc + o.persentaseSaham, 0);
    const totalInitialCapital = owners.reduce((acc, o) => acc + o.nilaiModalAwal, 0);
    return { totalSharesAllocated, totalInitialCapital };
  }, [owners]);

  const columns = [
    { 
      header: 'Identitas Investor', 
      accessor: (o: PemilikSaham) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{o.nama}</span>
          <span className="text-[10px] text-slate-400 font-mono">NIK: {o.nik}</span>
          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold mt-0.5">
             <Phone size={10} /> {o.telepon}
          </div>
        </div>
      )
    },
    { 
      header: 'Kepemilikan (%)', 
      accessor: (o: PemilikSaham) => (
        <div className="flex flex-col">
          <span className="text-lg font-black text-indigo-600">{o.persentaseSaham}%</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Share Equity</span>
        </div>
      )
    },
    { 
      header: 'Modal & Bergabung', 
      accessor: (o: PemilikSaham) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-slate-700">Rp {o.nilaiModalAwal.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">{o.tanggalBergabung}</span>
        </div>
      )
    },
    { 
      header: 'Valuasi Saat Ini', 
      accessor: (o: PemilikSaham) => {
        const currentVal = (o.persentaseSaham / 100) * totalNetWorth;
        const roi = ((currentVal - o.nilaiModalAwal) / o.nilaiModalAwal) * 100;
        return (
          <div className="flex flex-col">
            <span className="font-black text-emerald-600">Rp {Math.round(currentVal).toLocaleString()}</span>
            <span className={`text-[9px] font-black uppercase ${roi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
               Growth: {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </span>
          </div>
        );
      }
    },
    { 
      header: 'Aksi', 
      accessor: (o: PemilikSaham) => (
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setSelected(o); setFormData(o); setIsModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
          <button onClick={() => onDelete(o.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
        </div>
      ) 
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerData = { ...formData, id: selected?.id || `sh-${Date.now()}` } as PemilikSaham;
    
    // Validasi saham tidak boleh > 100%
    const otherOwnersShares = owners.filter(o => o.id !== ownerData.id).reduce((acc, o) => acc + o.persentaseSaham, 0);
    if (otherOwnersShares + ownerData.persentaseSaham > 100) {
      alert("Gagal! Total persentase saham seluruh pemilik tidak boleh melebihi 100%.");
      return;
    }

    if (selected) onUpdate(ownerData);
    else onAdd(ownerData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="relative z-10">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Valuasi Pasar Bisnis</p>
             <h2 className="text-4xl font-black">Rp {Math.round(totalNetWorth).toLocaleString()}</h2>
             <div className="mt-4 flex items-center gap-2">
               <TrendingUp size={16} className="text-emerald-400" />
               <span className="text-[10px] text-emerald-400 font-bold uppercase">Real-time Valuation based on Assets & Subs</span>
             </div>
           </div>
           <PieChart size={150} className="absolute -right-8 -bottom-8 text-white/5 -rotate-12" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Briefcase size={20} /></div>
              <span className="text-[10px] font-black text-slate-300 uppercase">Equity Distribution</span>
           </div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Saham Terdistribusi</p>
              <h4 className="text-2xl font-black text-slate-800">{stats.totalSharesAllocated}%</h4>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.totalSharesAllocated}%` }}></div>
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Landmark size={20} /></div>
              <span className="text-[10px] font-black text-slate-300 uppercase">Paid-in Capital</span>
           </div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Total Modal Awal</p>
              <h4 className="text-2xl font-black text-slate-800">Rp {stats.totalInitialCapital.toLocaleString()}</h4>
              <p className="text-[10px] text-slate-400 mt-1 italic">Akumulasi investasi masuk</p>
           </div>
        </div>
      </div>

      <DataTable 
        title="Daftar Struktur Kepemilikan Saham" 
        data={owners} 
        columns={columns} 
        onAdd={() => { setSelected(null); setFormData({ nama:'', nik:'', telepon:'', alamat:'', persentaseSaham:0, wilayahId: wilayah[0]?.id, nilaiModalAwal:0, tanggalBergabung: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
        addLabel="Tambah Pemegang Saham"
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="p-6 border-b border-slate-100 bg-indigo-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold">{selected ? 'Edit Data Investor' : 'Tambah Investor Baru'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Nama Lengkap</label>
                  <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">NIK (16 Digit)</label>
                  <input required type="text" maxLength={16} value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">No. WhatsApp</label>
                  <input required type="text" value={formData.telepon} onChange={e => setFormData({...formData, telepon: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Wilayah Investasi</label>
                  <select value={formData.wilayahId} onChange={e => setFormData({...formData, wilayahId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    {wilayah.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Alamat Sesuai KTP</label>
                <textarea required value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none text-sm" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Saham (%)</label>
                  <input required type="number" min="1" max="100" value={formData.persentaseSaham} onChange={e => setFormData({...formData, persentaseSaham: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Modal Awal (IDR)</label>
                  <input required type="number" value={formData.nilaiModalAwal} onChange={e => setFormData({...formData, nilaiModalAwal: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1 flex items-center gap-2"><Calendar size={12}/> Tanggal Bergabung</label>
                <input required type="date" value={formData.tanggalBergabung} onChange={e => setFormData({...formData, tanggalBergabung: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                  <Save size={18}/> {selected ? 'Simpan Perubahan' : 'Tambah Investor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOwnershipView;
