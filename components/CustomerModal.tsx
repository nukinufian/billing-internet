
import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard } from 'lucide-react';
import { Pelanggan, Wilayah, Paket, ODP } from '../types';
import { MOCK_WILAYAH, MOCK_PAKET, MOCK_ODP } from '../constants';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Pelanggan) => void;
  editData?: Pelanggan | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState<Partial<Pelanggan>>({
    nama: '',
    nik: '',
    alamat: '',
    rt: '',
    rw: '',
    telepon: '',
    wilayahId: MOCK_WILAYAH[0].id,
    paketId: MOCK_PAKET[0].id,
    odpId: MOCK_ODP[0].id,
    status: 'Aktif',
    tanggalDaftar: new Date().toISOString().split('T')[0],
    tanggalTagihan: 5
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        nama: '',
        nik: '',
        alamat: '',
        rt: '',
        rw: '',
        telepon: '',
        wilayahId: MOCK_WILAYAH[0].id,
        paketId: MOCK_PAKET[0].id,
        odpId: MOCK_ODP[0].id,
        status: 'Aktif',
        tanggalDaftar: new Date().toISOString().split('T')[0],
        tanggalTagihan: 5
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editData?.id || `c${Date.now()}`,
    } as Pelanggan);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">{editData ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input 
                required
                type="text" 
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
              <input 
                required
                type="text" 
                maxLength={16}
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="16 Digit NIK"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat</label>
              <input 
                required
                type="text"
                value={formData.alamat}
                onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Jl. Merdeka No. 10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">RT</label>
              <input 
                required
                type="text" 
                value={formData.rt}
                onChange={(e) => setFormData({...formData, rt: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="001"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">RW</label>
              <input 
                required
                type="text" 
                value={formData.rw}
                onChange={(e) => setFormData({...formData, rw: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Telepon</label>
              <input 
                required
                type="text" 
                value={formData.telepon}
                onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="08123xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status Pelanggan</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <Calendar size={16} /> Tanggal Registrasi
              </label>
              <input 
                required
                type="date" 
                value={formData.tanggalDaftar}
                onChange={(e) => setFormData({...formData, tanggalDaftar: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <CreditCard size={16} /> Tanggal Tagihan Bulanan
              </label>
              <input 
                required
                type="number" 
                min={1}
                max={31}
                value={formData.tanggalTagihan}
                onChange={(e) => setFormData({...formData, tanggalTagihan: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Contoh: 5 (Tagihan setiap tgl 5)"
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Wilayah</label>
              <select 
                value={formData.wilayahId}
                onChange={(e) => setFormData({...formData, wilayahId: e.target.value})}
                className="w-full bg-white px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {MOCK_WILAYAH.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Paket Internet</label>
              <select 
                value={formData.paketId}
                onChange={(e) => setFormData({...formData, paketId: e.target.value})}
                className="w-full bg-white px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {MOCK_PAKET.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nama} (Rp {p.harga.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Titik ODP</label>
              <select 
                value={formData.odpId}
                onChange={(e) => setFormData({...formData, odpId: e.target.value})}
                className="w-full bg-white px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {MOCK_ODP.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
