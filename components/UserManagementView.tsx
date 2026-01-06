
import React, { useState } from 'react';
import DataTable from './DataTable';
import { User, Role, Wilayah } from '../types';
import { Edit2, Trash2, ShieldCheck, UserPlus, X, Save, Lock, MapPin, Key } from 'lucide-react';

interface UserManagementViewProps {
  data: User[];
  wilayah: Wilayah[];
  onAdd: (user: User) => void;
  onUpdate: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ data, wilayah, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    nama: 'nuki',
    username: 'admin',
    password: 'admin',
    role: 'Admin',
    assignedWilayahIds: []
  });

  const columns = [
    { 
      header: 'Nama & Username', 
      accessor: (u: User) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{u.nama}</span>
          <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: (u: User) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          u.role === 'Owner' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
          u.role === 'Admin' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
          u.role === 'Teknisi' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
          'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {u.role}
        </span>
      )
    },
    { 
      header: 'Wilayah Kelolaan', 
      accessor: (u: User) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {u.role === 'Owner' ? (
             <span className="text-[10px] font-bold text-indigo-600 italic">Semua Wilayah (Full)</span>
          ) : u.assignedWilayahIds.length > 0 ? (
            u.assignedWilayahIds.map(wid => {
              const w = wilayah.find(x => x.id === wid);
              return <span key={wid} className="text-[9px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{w?.nama || wid}</span>;
            })
          ) : (
            <span className="text-[10px] text-rose-400 italic font-bold">Belum Ada Akses</span>
          )}
        </div>
      )
    },
    { 
      header: 'Aksi', 
      accessor: (u: User) => (
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setSelected(u); setFormData(u); setIsModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
          <button onClick={() => onDelete(u.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
        </div>
      ) 
    }
  ];

  const toggleWilayah = (id: string) => {
    const current = formData.assignedWilayahIds || [];
    if (current.includes(id)) {
      setFormData({ ...formData, assignedWilayahIds: current.filter(x => x !== id) });
    } else {
      setFormData({ ...formData, assignedWilayahIds: [...current, id] });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) onUpdate({ ...selected, ...formData } as User);
    else onAdd({ ...formData, id: `u-${Date.now()}` } as User);
    setIsModalOpen(false);
  };

  return (
    <>
      <DataTable title="Daftar Pengguna Sistem" data={data} columns={columns} onAdd={() => { setSelected(null); setFormData({nama:'', username:'', password:'', role:'Admin', assignedWilayahIds:[]}); setIsModalOpen(true); }} />
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="p-6 border-b border-slate-100 bg-indigo-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold">{selected ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
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
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Username</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1 flex items-center gap-2"><Key size={12}/> Password</label>
                  <input required={!selected} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder={selected ? "Biarkan kosong..." : "****"} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Role / Hak Akses</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Teknisi">Teknisi</option>
                    <option value="Penarik">Penarik</option>
                  </select>
                </div>
              </div>

              {formData.role !== 'Owner' && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><MapPin size={12}/> Pilih Wilayah Akses</label>
                  <div className="grid grid-cols-2 gap-3">
                    {wilayah.map(w => (
                      <label key={w.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all">
                        <input 
                          type="checkbox" 
                          checked={formData.assignedWilayahIds?.includes(w.id)}
                          onChange={() => toggleWilayah(w.id)}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-sm font-bold text-slate-700">{w.nama}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                  <Save size={18}/> {selected ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementView;
