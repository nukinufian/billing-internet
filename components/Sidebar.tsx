
import React, { useState } from 'react';
import { LayoutDashboard, Users, Receipt, Database, Map, Package, Share2, UserCircle, ChevronDown, ChevronRight, Box, HardDrive, Banknote, ArrowUpCircle, ArrowDownCircle, Settings, Globe, Smartphone, ShieldCheck, Lock, UserCog, FileBarChart2, PieChart, BarChart3, Fingerprint, FileText, Briefcase, Coins } from 'lucide-react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  user: User;
  permissions: Record<string, Record<string, boolean>>;
  appLogo: string | null;
  companyName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, permissions, appLogo, companyName }) => {
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isTransaksiOpen, setIsTransaksiOpen] = useState(false);
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const hasAccess = (id: string) => {
    return permissions[id]?.[user.role] ?? false;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'absensi', label: 'Absensi & Gaji', icon: Fingerprint },
    { id: 'pelanggan', label: 'Pelanggan', icon: Users },
    { id: 'tagihan', label: 'Tagihan', icon: Receipt },
    { id: 'stok', label: 'Stok Barang', icon: Box },
    { id: 'aset', label: 'Aset', icon: HardDrive },
  ];

  const transaksiItems = [
    { id: 'pemasukan', label: 'Pemasukan', icon: ArrowUpCircle },
    { id: 'pengeluaran', label: 'Pengeluaran', icon: ArrowDownCircle },
  ];

  const laporanItems = [
    { id: 'laporan-laba-rugi', label: 'Laba Rugi', icon: BarChart3 },
    { id: 'laporan-aset', label: 'Laporan Aset', icon: PieChart },
    { id: 'laporan-bagihasil', label: 'Laporan Bagihasil', icon: Coins },
    { id: 'laporan-saham', label: 'Kepemilikan Saham', icon: Briefcase },
  ];

  const masterItems = [
    { id: 'wilayah', label: 'Data Wilayah', icon: Map },
    { id: 'paket', label: 'Data Paket', icon: Package },
    { id: 'odp', label: 'Data ODP', icon: Share2 },
    { id: 'karyawan', label: 'Data Karyawan', icon: UserCircle },
  ];

  const settingsItems = [
    { id: 'manajemen-user', label: 'Manajemen User', icon: UserCog },
    { id: 'pengaturan-umum', label: 'Pengaturan Umum', icon: Globe },
    { id: 'pengaturan-invoice', label: 'Pengaturan Invoice', icon: FileText },
    { id: 'pengaturan-aplikasi', label: 'Pengaturan Aplikasi', icon: Smartphone },
    { id: 'pengaturan-aset', label: 'Pengaturan Aset', icon: ShieldCheck },
    { id: 'pengaturan-hak-akses', label: 'Hak Akses', icon: Lock },
  ];

  const visibleNav = navItems.filter(i => hasAccess(i.id));
  const visibleTransaksi = transaksiItems.filter(i => hasAccess(i.id));
  const visibleLaporan = laporanItems.filter(i => hasAccess(i.id));
  const visibleMaster = masterItems.filter(i => hasAccess(i.id));
  const visibleSettings = settingsItems.filter(i => {
    if (i.id === 'manajemen-user') return hasAccess('manajemen-user');
    return hasAccess('pengaturan');
  });

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-3">
          {appLogo ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0">
               <img src={appLogo} alt="App Logo" className="w-full h-full object-contain p-1" />
            </div>
          ) : (
            <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
              <Share2 size={24} className="text-white" />
            </div>
          )}
          <span className="truncate">{companyName.split(' ')[0]}</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {visibleTransaksi.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setIsTransaksiOpen(!isTransaksiOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all ${(isTransaksiOpen || ['pemasukan', 'pengeluaran'].includes(currentView)) ? 'text-white bg-slate-800/50' : 'text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <Banknote size={20} />
                <span className="font-medium">Transaksi</span>
              </div>
              {isTransaksiOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {(isTransaksiOpen || ['pemasukan', 'pengeluaran'].includes(currentView)) && (
              <div className="mt-1 ml-4 border-l border-slate-700 space-y-1">
                {visibleTransaksi.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as View)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      currentView === item.id 
                        ? 'text-indigo-400 bg-slate-800/30' 
                        : 'hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {visibleLaporan.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setIsLaporanOpen(!isLaporanOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all ${(isLaporanOpen || currentView.startsWith('laporan')) ? 'text-white bg-slate-800/50' : 'text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <FileBarChart2 size={20} />
                <span className="font-medium">Laporan</span>
              </div>
              {isLaporanOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {(isLaporanOpen || currentView.startsWith('laporan')) && (
              <div className="mt-1 ml-4 border-l border-slate-700 space-y-1">
                {visibleLaporan.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as View)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      currentView === item.id 
                        ? 'text-indigo-400 bg-slate-800/30' 
                        : 'hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {visibleMaster.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setIsMasterOpen(!isMasterOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all ${(isMasterOpen || ['wilayah', 'paket', 'odp', 'karyawan'].includes(currentView)) ? 'text-white bg-slate-800/50' : 'text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <Database size={20} />
                <span className="font-medium">Master Data</span>
              </div>
              {isMasterOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {(isMasterOpen || ['wilayah', 'paket', 'odp', 'karyawan'].includes(currentView)) && (
              <div className="mt-1 ml-4 border-l border-slate-700 space-y-1">
                {visibleMaster.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as View)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      currentView === item.id 
                        ? 'text-indigo-400 bg-slate-800/30' 
                        : 'hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {visibleSettings.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all ${(isSettingsOpen || currentView.startsWith('pengaturan') || currentView === 'manajemen-user') ? 'text-white bg-slate-800/50' : 'text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <Settings size={20} />
                <span className="font-medium">Pengaturan</span>
              </div>
              {isSettingsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {(isSettingsOpen || currentView.startsWith('pengaturan') || currentView === 'manajemen-user') && (
              <div className="mt-1 ml-4 border-l border-slate-700 space-y-1">
                {visibleSettings.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as View)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      currentView === item.id 
                        ? 'text-indigo-400 bg-slate-800/30' 
                        : 'hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold uppercase">{user.nama.substring(0, 2)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.nama}</p>
            <p className="text-xs text-slate-500 truncate">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
