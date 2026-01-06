
import React, { useState } from 'react';
import { X, Zap, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Wilayah, Pelanggan, Tagihan } from '../types';
import { MOCK_WILAYAH, MOCK_PAKET, MONTHS } from '../constants';

interface GenerateBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (newBills: Tagihan[]) => void;
  customers: Pelanggan[];
  existingBills: Tagihan[];
}

const GenerateBillingModal: React.FC<GenerateBillingModalProps> = ({ 
  isOpen, onClose, onGenerate, customers, existingBills 
}) => {
  const currentYear = 2026; // Disesuaikan ke 2026 sesuai permintaan
  const currentMonth = MONTHS[new Date().getMonth()];

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [wilayahId, setWilayahId] = useState('all');
  const [billingDay, setBillingDay] = useState<number | 'all'>('all');

  if (!isOpen) return null;

  const handleProcess = () => {
    // Logic to find eligible customers
    const eligibleCustomers = customers.filter(p => {
      const isAktif = p.status === 'Aktif';
      const matchWilayah = wilayahId === 'all' || p.wilayahId === wilayahId;
      const matchDay = billingDay === 'all' || p.tanggalTagihan === billingDay;
      
      // Check if bill already exists for this period
      const billExists = existingBills.some(b => 
        b.pelangganId === p.id && b.bulan === month && Number(b.tahun) === Number(year)
      );

      return isAktif && matchWilayah && matchDay && !billExists;
    });

    if (eligibleCustomers.length === 0) {
      alert(`Tidak ada pelanggan baru yang memenuhi kriteria untuk periode ${month} ${year}. Mungkin tagihan sudah pernah dibuat atau tidak ada pelanggan aktif.`);
      return;
    }

    const newBills: Tagihan[] = eligibleCustomers.map(p => {
      const paket = MOCK_PAKET.find(pk => pk.id === p.paketId);
      return {
        id: `t-${Date.now()}-${p.id}`,
        pelangganId: p.id,
        bulan: month,
        tahun: year,
        jumlah: paket?.harga || 0,
        status: 'Belum Lunas'
      };
    });

    onGenerate(newBills);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Zap size={24} className="fill-white" />
            <h3 className="text-xl font-bold">Generate Tagihan Masal</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <Calendar size={14} /> Periode Bulan
              </label>
              <select 
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tahun</label>
              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <MapPin size={14} /> Wilayah
            </label>
            <select 
              value={wilayahId}
              onChange={(e) => setWilayahId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="all">Semua Wilayah</option>
              {MOCK_WILAYAH.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <CreditCard size={14} /> Siklus Tagihan (Tanggal)
            </label>
            <select 
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="all">Semua Tanggal</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Setiap Tanggal {d}</option>
              ))}
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 leading-relaxed">
            <strong>Catatan:</strong> Sistem akan membuatkan tagihan baru hanya untuk pelanggan dengan status <strong>Aktif</strong> yang belum memiliki tagihan pada periode terpilih.
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleProcess}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Proses Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateBillingModal;
