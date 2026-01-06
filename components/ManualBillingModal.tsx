
import React, { useState, useMemo } from 'react';
import { X, UserSearch, Calendar, Check, Search, AlertCircle } from 'lucide-react';
import { Pelanggan, Tagihan, Paket } from '../types';
import { MONTHS, MOCK_PAKET } from '../constants';

interface ManualBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (bill: Tagihan) => void;
  customers: Pelanggan[];
  existingBills: Tagihan[];
}

const ManualBillingModal: React.FC<ManualBillingModalProps> = ({ 
  isOpen, onClose, onGenerate, customers, existingBills 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(null);
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(2026);

  const filteredCustomers = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return customers.filter(p => 
      p.status === 'Aktif' && 
      (p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || p.nik.includes(searchTerm))
    ).slice(0, 5);
  }, [customers, searchTerm]);

  const billExists = useMemo(() => {
    if (!selectedCustomer) return false;
    return existingBills.some(b => 
      b.pelangganId === selectedCustomer.id && 
      b.bulan === month && 
      Number(b.tahun) === Number(year)
    );
  }, [selectedCustomer, month, year, existingBills]);

  if (!isOpen) return null;

  const handleProcess = () => {
    if (!selectedCustomer || billExists) return;

    const paket = MOCK_PAKET.find(pk => pk.id === selectedCustomer.paketId);
    const newBill: Tagihan = {
      id: `t-manual-${Date.now()}-${selectedCustomer.id}`,
      pelangganId: selectedCustomer.id,
      bulan: month,
      tahun: year,
      jumlah: paket?.harga || 0,
      status: 'Belum Lunas'
    };

    onGenerate(newBill);
    setSearchTerm('');
    setSelectedCustomer(null);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50 text-indigo-900">
          <div className="flex items-center gap-3">
            <UserSearch size={24} className="text-indigo-600" />
            <h3 className="text-xl font-bold">Generate Tagihan Manual</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Step 1: Search Customer */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Cari Pelanggan</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Ketik Nama atau NIK..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedCustomer(null);
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Results List */}
            {searchTerm.length >= 2 && !selectedCustomer && (
              <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50 bg-white shadow-sm">
                {filteredCustomers.length > 0 ? filteredCustomers.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedCustomer(p)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">{p.nama}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.nik}</p>
                    </div>
                    <div className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Pilih</div>
                  </button>
                )) : (
                  <div className="p-4 text-center text-sm text-slate-400">Pelanggan tidak ditemukan atau nonaktif</div>
                )}
              </div>
            )}

            {/* Selected Card */}
            {selectedCustomer && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Pelanggan Terpilih</p>
                  <p className="font-bold text-slate-800">{selectedCustomer.nama}</p>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bulan</label>
              <select 
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tahun</label>
              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50"
              >
                {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {billExists && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs animate-in shake">
              <AlertCircle size={14} />
              <span>Tagihan untuk periode ini sudah ada!</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button 
              disabled={!selectedCustomer || billExists}
              onClick={handleProcess}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
            >
              Buat Tagihan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualBillingModal;
