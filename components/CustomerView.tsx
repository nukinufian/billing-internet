
import React, { useState, useRef, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import CustomerModal from './CustomerModal';
import { MOCK_PAKET, MOCK_WILAYAH } from '../constants';
import { Pelanggan } from '../types';
import { FileDown, FileUp, Trash2, Edit2, Search, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CustomerViewProps {
  data: Pelanggan[];
  onUpdate: (data: Pelanggan[]) => void;
  externalSearch?: string;
}

const CustomerView: React.FC<CustomerViewProps> = ({ data, onUpdate, externalSearch = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Pelanggan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal search with external search from header
  useEffect(() => {
    if (externalSearch) setSearchTerm(externalSearch);
  }, [externalSearch]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return data;
    return data.filter(p => 
      p.nama.toLowerCase().includes(term) || 
      p.nik.includes(term) || 
      p.telepon.includes(term) ||
      p.id.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (customer: Pelanggan) => {
    const exists = data.find(p => p.id === customer.id);
    if (exists) {
      onUpdate(data.map(p => p.id === customer.id ? customer : p));
      showToast('Data pelanggan berhasil diperbarui');
    } else {
      onUpdate([...data, customer]);
      showToast('Pelanggan baru berhasil ditambahkan');
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      onUpdate(data.filter(p => p.id !== deleteConfirmId));
      showToast('Pelanggan berhasil dihapus');
      setDeleteConfirmId(null);
    }
  };

  const handleEdit = (customer: Pelanggan) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const downloadTemplate = () => {
    const template = [
      { 
        Nama: 'Budi Utomo', 
        NIK: '3201010101010001',
        Alamat: 'Jl. Merdeka No. 10', 
        RT: '01',
        RW: '05',
        Telepon: '08123456789', 
        WilayahID: 'w1', 
        PaketID: 'p1', 
        ODPID: 'o1', 
        Status: 'Aktif',
        Tgl_Registrasi: '2024-05-20',
        Hari_Tagihan: 5
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Pelanggan_NetBill.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const importedData = XLSX.utils.sheet_to_json(ws) as any[];

        const newCustomers: Pelanggan[] = importedData.map((row, idx) => ({
          id: `c-imp-${Date.now()}-${idx}`,
          nama: row.Nama || 'Tanpa Nama',
          nik: String(row.NIK || ''),
          alamat: row.Alamat || '-',
          rt: String(row.RT || '00'),
          rw: String(row.RW || '00'),
          telepon: String(row.Telepon || ''),
          wilayahId: row.WilayahID || 'w1',
          paketId: row.PaketID || 'p1',
          odpId: row.ODPID || 'o1',
          status: row.Status || 'Aktif',
          tanggalDaftar: row.Tgl_Registrasi || new Date().toISOString().split('T')[0],
          tanggalTagihan: parseInt(row.Hari_Tagihan || 5)
        }));

        onUpdate([...data, ...newCustomers]);
        showToast(`${newCustomers.length} pelanggan berhasil diimport!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        showToast('Gagal mengimport data. Pastikan format benar.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const columns = [
    { 
      header: 'Identitas Pelanggan', 
      accessor: (p: Pelanggan) => (
        <div className="flex flex-col">
          <div className="font-bold text-slate-900">{p.nama}</div>
          <div className="text-[10px] text-slate-400 font-mono">NIK: {p.nik}</div>
        </div>
      )
    },
    { 
      header: 'Alamat / RT-RW', 
      accessor: (p: Pelanggan) => (
        <div className="text-xs text-slate-600">
          <div>{p.alamat}</div>
          <div className="font-semibold text-slate-400">RT {p.rt} / RW {p.rw}</div>
        </div>
      )
    },
    { 
      header: 'Layanan & Biaya', 
      accessor: (p: Pelanggan) => {
        const paket = MOCK_PAKET.find(pk => pk.id === p.paketId);
        return (
          <div className="text-xs">
            <div className="font-bold text-indigo-600">{paket?.nama || p.paketId}</div>
            <div className="text-slate-500 font-medium">Rp {paket?.harga.toLocaleString()}</div>
          </div>
        );
      }
    },
    { 
      header: 'Penagihan', 
      accessor: (p: Pelanggan) => (
        <div className="text-center">
          <div className="text-[10px] text-slate-400 uppercase font-bold leading-tight">Siklus</div>
          <div className="text-sm font-bold text-slate-700">Tgl {p.tanggalTagihan}</div>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (p: Pelanggan) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          p.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {p.status}
        </span>
      )
    },
    { 
      header: 'Aksi', 
      accessor: (p: Pelanggan) => (
        <div className="flex gap-1 justify-end">
          <button 
            onClick={() => handleEdit(p)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => setDeleteConfirmId(p.id)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama, NIK, atau ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
          >
            Tambah Pelanggan
          </button>
          <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block"></div>
          <button 
            onClick={downloadTemplate}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all active:scale-90"
            title="Download Template"
          >
            <FileDown size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all active:scale-90"
            title="Import Excel"
          >
            <FileUp size={20} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable 
        title={`Daftar Pelanggan (${filteredData.length})`} 
        data={filteredData} 
        columns={columns} 
      />

      {/* Modals */}
      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => {setIsModalOpen(false); setEditingCustomer(null);}} 
        onSave={handleSave}
        editData={editingCustomer}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Pelanggan?</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Tindakan ini tidak dapat dibatalkan. Semua data pelanggan ini akan dihapus dari sistem.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-semibold shadow-lg shadow-rose-100 active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-900' : 'bg-white border-rose-100 text-rose-900'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={24} className="text-emerald-500" />
            ) : (
              <AlertTriangle size={24} className="text-rose-500" />
            )}
            <p className="font-semibold text-sm">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-4 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
