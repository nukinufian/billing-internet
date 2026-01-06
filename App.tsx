
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerView from './components/CustomerView';
import BillingView from './components/BillingView';
import Login from './components/Login';
import UserManagementView from './components/UserManagementView';
import StockOwnershipView from './components/StockOwnershipView';
import { WilayahView, PaketView, ODPView, KaryawanView } from './components/MasterViews';
import { StokView, AsetView } from './components/InventoryViews';
import { PemasukanView, PengeluaranView } from './components/TransactionViews';
import { LabaRugiReportView, LaporanAsetReportView, BagihasilReportView } from './components/ReportViews';
import AbsensiView from './components/AbsensiView';
import { PengaturanUmumView, PengaturanAplikasiView, PengaturanAsetView, HakAksesView, PengaturanInvoiceView } from './components/SettingsViews';
import { View, Pelanggan, Tagihan, Pengeluaran, KategoriPengeluaran, Aset, StokBarang, AssetSettings, Wilayah, Paket, ODP, Karyawan, User, Absensi, JadwalKehadiran, InvoiceSettings, PemilikSaham } from './types';
import { Bell, Search, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { MOCK_PELANGGAN, MOCK_TAGIHAN, SYSTEM_CATEGORIES, MOCK_ASET, MOCK_WILAYAH, MOCK_PAKET, MOCK_ODP, MOCK_KARYAWAN, MOCK_USERS, MOCK_PENGELUARAN, MOCK_ABSENSI, MOCK_SAHAM } from './constants';

const DEFAULT_ASSET_SETTINGS: AssetSettings = {
  depreciationLifespanYears: 5,
  salvageValuePercent: 10,
  valuationMultiplier: 12,
  churnRateEstimate: 5
};

const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  useVAT: false,
  vatPercent: 11,
  bankName: 'BCA',
  bankAccount: '1234-567-890',
  bankHolder: 'NetBill Indonesia',
  carryOverUnpaid: false,
  footerMessage: 'Terimakasih telah menggunakan layanan internet kami'
};

const INITIAL_STOK: StokBarang[] = [
  { id: 's1', nama: 'Router FiberHome', wilayahId: 'w1', kategori: 'Hardware', jumlah: 24, satuan: 'Pcs', harga: 450000 },
  { id: 's2', nama: 'Kabel Dropcore 1km', wilayahId: 'w1', kategori: 'Kabel', jumlah: 5, satuan: 'Roll', harga: 1200000 },
  { id: 's3', nama: 'Fast Connector', wilayahId: 'w1', kategori: 'Aksesori', jumlah: 200, satuan: 'Pcs', harga: 5000 },
];

const INITIAL_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'dashboard': { 'Owner': true, 'Admin': true, 'Teknisi': true, 'Penarik': true },
  'pelanggan': { 'Owner': true, 'Admin': true, 'Teknisi': true, 'Penarik': false },
  'tagihan': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': true },
  'stok': { 'Owner': true, 'Admin': true, 'Teknisi': true, 'Penarik': false },
  'aset': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': false },
  'pemasukan': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': false },
  'pengeluaran': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': false },
  'laporan-laba-rugi': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': false },
  'laporan-aset': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': false },
  'laporan-bagihasil': { 'Owner': true, 'Admin': false, 'Teknisi': false, 'Penarik': false },
  'laporan-saham': { 'Owner': true, 'Admin': false, 'Teknisi': false, 'Penarik': false },
  'wilayah': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': false },
  'paket': { 'Owner': true, 'Admin': true, 'Teknisi': false, 'Penarik': false },
  'odp': { 'Owner': true, 'Admin': true, 'Teknisi': true, 'Penarik': false },
  'karyawan': { 'Owner': true, 'Admin': false, 'Teknisi': false, 'Penarik': false },
  'absensi': { 'Owner': true, 'Admin': true, 'Teknisi': true, 'Penarik': true },
  'manajemen-user': { 'Owner': true, 'Admin': false, 'Teknisi': false, 'Penarik': false },
  'pengaturan': { 'Owner': true, 'Admin': false, 'Teknisi': false, 'Penarik': false },
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [customers, setCustomers] = useState<Pelanggan[]>(MOCK_PELANGGAN);
  const [bills, setBills] = useState<Tagihan[]>(MOCK_TAGIHAN);
  const [expenses, setExpenses] = useState<Pengeluaran[]>(MOCK_PENGELUARAN);
  const [expenseCategories, setExpenseCategories] = useState<KategoriPengeluaran[]>(SYSTEM_CATEGORIES);
  const [assets, setAssets] = useState<Aset[]>(MOCK_ASET);
  const [stok, setStok] = useState<StokBarang[]>(INITIAL_STOK);
  const [absensi, setAbsensi] = useState<Absensi[]>(MOCK_ABSENSI);
  const [schedules, setSchedules] = useState<JadwalKehadiran[]>([]);
  const [assetSettings, setAssetSettings] = useState<AssetSettings>(DEFAULT_ASSET_SETTINGS);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(DEFAULT_INVOICE_SETTINGS);
  const [stockOwners, setStockOwners] = useState<PemilikSaham[]>(MOCK_SAHAM);
  
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('NetBill Indonesia Pro');
  const [companyTagline, setCompanyTagline] = useState('Premium Internet Service Provider');

  const [wilayah, setWilayah] = useState<Wilayah[]>(MOCK_WILAYAH);
  const [paket, setPaket] = useState<Paket[]>(MOCK_PAKET);
  const [odp, setOdp] = useState<ODP[]>(MOCK_ODP);
  const [karyawan, setKaryawan] = useState<Karyawan[]>(MOCK_KARYAWAN);

  const [globalSearch, setGlobalSearch] = useState('');

  const canAccess = (viewId: string) => {
    if (!currentUser) return false;
    let key = viewId;
    if (viewId.startsWith('pengaturan')) key = 'pengaturan';
    return permissions[key]?.[currentUser.role] ?? false;
  };

  const filteredCustomers = useMemo(() => {
    if (!currentUser || currentUser.role === 'Owner') return customers;
    return customers.filter(p => currentUser.assignedWilayahIds.includes(p.wilayahId));
  }, [customers, currentUser]);

  const filteredBills = useMemo(() => {
    if (!currentUser || currentUser.role === 'Owner') return bills;
    return bills.filter(b => {
      const p = customers.find(cust => cust.id === b.pelangganId);
      return p && currentUser.assignedWilayahIds.includes(p.wilayahId);
    });
  }, [bills, currentUser, customers]);

  const filteredExpenses = useMemo(() => {
    if (!currentUser || currentUser.role === 'Owner') return expenses;
    return expenses.filter(e => currentUser.assignedWilayahIds.includes(e.wilayahId));
  }, [expenses, currentUser]);

  const filteredOdp = useMemo(() => {
    if (!currentUser || currentUser.role === 'Owner') return odp;
    return odp.filter(o => currentUser.assignedWilayahIds.includes(o.wilayahId));
  }, [odp, currentUser]);

  const filteredWilayah = useMemo(() => {
    if (!currentUser || currentUser.role === 'Owner') return wilayah;
    return wilayah.filter(w => currentUser.assignedWilayahIds.includes(w.id));
  }, [wilayah, currentUser]);

  const filteredStok = useMemo(() => {
    if (!currentUser || currentUser.role === 'Owner') return stok;
    return stok.filter(s => currentUser.assignedWilayahIds.includes(s.wilayahId));
  }, [stok, currentUser]);

  const filteredAssets = useMemo(() => {
    if (!currentUser || currentUser.role === 'Owner') return assets;
    return assets.filter(a => currentUser.assignedWilayahIds.includes(a.wilayahId));
  }, [assets, currentUser]);

  const createHandlers = <T extends { id: string }>(state: T[], setState: React.Dispatch<React.SetStateAction<T[]>>) => ({
    add: (item: T) => setState(prev => [item, ...prev]),
    update: (item: T) => setState(prev => prev.map(i => i.id === item.id ? item : i)),
    delete: (id: string) => setState(prev => prev.filter(i => i.id !== id))
  });

  const wilayahHandlers = createHandlers(wilayah, setWilayah);
  const paketHandlers = createHandlers(paket, setPaket);
  const odpHandlers = createHandlers(odp, setOdp);
  const karyawanHandlers = createHandlers(karyawan, setKaryawan);
  const userHandlers = createHandlers(users, setUsers);
  const stockHandlers = createHandlers(stockOwners, setStockOwners);
  const expenseHandlers = createHandlers(expenses, setExpenses);

  if (!currentUser) {
    return <Login users={users} onLogin={setCurrentUser} appLogo={appLogo} companyName={companyName} />;
  }

  const renderContent = () => {
    if (!canAccess(currentView)) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Akses Dibatasi</h2>
          <p className="text-slate-500 max-w-md mt-2">Maaf, akun Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi Administrator jika ini adalah kesalahan.</p>
          <button onClick={() => setCurrentView('dashboard')} className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Kembali ke Dashboard</button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard customers={filteredCustomers} bills={filteredBills} />;
      case 'absensi': return (
        <AbsensiView 
          user={currentUser} 
          karyawan={karyawan} 
          absensi={absensi} 
          schedules={schedules}
          appLogo={appLogo}
          companyName={companyName}
          onAddAbsensi={(abs) => setAbsensi(prev => [abs, ...prev])} 
          onUpdateAbsensi={(abs) => setAbsensi(prev => prev.map(a => a.id === abs.id ? abs : a))} 
          onUpdateSchedule={(sched) => setSchedules(prev => {
            const exists = prev.find(s => s.id === sched.id);
            if (exists) return prev.map(s => s.id === sched.id ? sched : s);
            return [sched, ...prev];
          })}
        />
      );
      case 'pelanggan': return <CustomerView data={filteredCustomers} onUpdate={setCustomers} externalSearch={globalSearch} />;
      case 'tagihan': return (
        <BillingView 
          bills={bills} 
          onUpdate={setBills} 
          customers={customers} 
          appLogo={appLogo} 
          companyName={companyName} 
          companyTagline={companyTagline}
          invoiceSettings={invoiceSettings}
        />
      );
      case 'pemasukan': return <PemasukanView bills={filteredBills} customers={customers} />;
      case 'pengeluaran': return (
        <PengeluaranView 
          expenses={filteredExpenses} 
          onAddExpense={expenseHandlers.add} 
          onUpdateExpense={expenseHandlers.update}
          onDeleteExpense={expenseHandlers.delete}
          categories={expenseCategories} 
          wilayah={filteredWilayah} 
          onAddCategory={(c) => setExpenseCategories(p => [...p, c])} 
          onDeleteCategory={(id) => setExpenseCategories(p => p.filter(x => x.id !== id))} 
        />
      );
      case 'laporan-laba-rugi': return (
        <LabaRugiReportView 
          bills={filteredBills} 
          expenses={filteredExpenses} 
          customers={customers} 
          wilayah={filteredWilayah} 
          appLogo={appLogo}
          companyName={companyName}
        />
      );
      case 'laporan-aset': return (
        <LaporanAsetReportView 
          assets={filteredAssets} 
          customers={filteredCustomers} 
          wilayah={filteredWilayah} 
          settings={assetSettings} 
          appLogo={appLogo}
          companyName={companyName}
        />
      );
      case 'laporan-bagihasil': return (
        <BagihasilReportView 
          bills={bills} 
          expenses={expenses} 
          owners={stockOwners} 
          appLogo={appLogo}
          companyName={companyName}
        />
      );
      case 'laporan-saham': return (
        <StockOwnershipView 
          owners={stockOwners} 
          wilayah={wilayah} 
          assets={assets} 
          customers={customers} 
          settings={assetSettings} 
          onAdd={stockHandlers.add} 
          onUpdate={stockHandlers.update} 
          onDelete={stockHandlers.delete} 
        />
      );
      case 'stok': return (
        <StokView 
          stok={filteredStok} 
          wilayah={wilayah}
          onAdd={(i) => setStok(p => [i, ...p])} 
          onUpdate={(i) => setStok(p => p.map(s => s.id === i.id ? i : s))} 
          onDelete={(id) => setStok(p => p.filter(s => s.id !== id))} 
          onMovement={(id, amt) => setStok(p => p.map(s => s.id === id ? {...s, jumlah: Math.max(0, s.jumlah + amt)} : s))} 
        />
      );
      case 'aset': return (
        <AsetView 
          assets={filteredAssets} 
          customers={filteredCustomers} 
          wilayah={wilayah}
          settings={assetSettings} 
          onAdd={(a) => setAssets(p => [a, ...p])} 
          onUpdate={(a) => setAssets(p => p.map(x => x.id === a.id ? a : x))} 
          onDelete={(id) => setAssets(p => p.filter(x => x.id !== id))} 
        />
      );
      case 'wilayah': return <WilayahView data={filteredWilayah} onAdd={wilayahHandlers.add} onUpdate={wilayahHandlers.update} onDelete={wilayahHandlers.delete} />;
      case 'paket': return <PaketView data={paket} onAdd={paketHandlers.add} onUpdate={paketHandlers.update} onDelete={paketHandlers.delete} />;
      case 'odp': return <ODPView data={filteredOdp} wilayah={wilayah} onAdd={odpHandlers.add} onUpdate={odpHandlers.update} onDelete={odpHandlers.delete} />;
      case 'karyawan': return <KaryawanView data={karyawan} onAdd={karyawanHandlers.add} onUpdate={karyawanHandlers.update} onDelete={karyawanHandlers.delete} />;
      case 'manajemen-user': return <UserManagementView data={users} wilayah={wilayah} onAdd={userHandlers.add} onUpdate={userHandlers.update} onDelete={userHandlers.delete} />;
      case 'pengaturan-umum': return (
        <PengaturanUmumView 
          logo={appLogo} 
          onLogoChange={setAppLogo} 
          companyName={companyName}
          onCompanyNameChange={setCompanyName}
          companyTagline={companyTagline}
          onCompanyTaglineChange={setCompanyTagline}
        />
      );
      case 'pengaturan-aplikasi': return (
        <PengaturanAplikasiView 
          appName={companyName} 
          onAppNameChange={setCompanyName} 
          appLogo={appLogo} 
          onAppLogoChange={setAppLogo} 
        />
      );
      case 'pengaturan-aset': return <PengaturanAsetView settings={assetSettings} onUpdate={setAssetSettings} />;
      case 'pengaturan-hak-akses': return <HakAksesView permissions={permissions} onUpdatePermissions={setPermissions} />;
      case 'pengaturan-invoice': return <PengaturanInvoiceView settings={invoiceSettings} onUpdate={setInvoiceSettings} />;
      default: return <Dashboard customers={filteredCustomers} bills={filteredBills} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<View, string> = {
      dashboard: 'Dashboard Overview',
      absensi: 'Manajemen Kehadiran & Payroll',
      pelanggan: 'Manajemen Pelanggan',
      tagihan: 'Manajemen Tagihan',
      pemasukan: 'Laporan Pemasukan (Paid)',
      pengeluaran: 'Laporan Pengeluaran Operasional',
      'laporan-laba-rugi': 'Laporan Laba Rugi Wilayah',
      'laporan-aset': 'Laporan Valuasi Kekayaan Bisnis',
      'laporan-bagihasil': 'Laporan Pembagian Dividen Saham',
      'laporan-saham': 'Struktur Kepemilikan Saham',
      stok: 'Stok Barang & Inventaris',
      aset: 'Manajemen Aset & Kekayaan',
      wilayah: 'Master Data Wilayah',
      paket: 'Master Data Paket Internet',
      odp: 'Master Data ODP',
      karyawan: 'Master Data Karyawan',
      'manajemen-user': 'Manajemen User Pengguna',
      'pengaturan-umum': 'Pengaturan Umum',
      'pengaturan-aplikasi': 'Pengaturan Aplikasi',
      'pengaturan-aset': 'Pengaturan Strategi Aset',
      'pengaturan-hak-akses': 'Manajemen Hak Akses',
      'pengaturan-invoice': 'Pengaturan Format Invoice'
    };
    return titles[currentView] || 'NetBill';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} user={currentUser} permissions={permissions} appLogo={appLogo} companyName={companyName} />
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (currentView !== 'pelanggan' && currentView !== 'tagihan') setCurrentView('pelanggan');
              }}
              placeholder="Cari Nama atau NIK pelanggan..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-500 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </header>
        <main className="p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <span>{companyName}</span>
                <span>/</span>
                <span className="text-indigo-600 font-medium capitalize">{currentView.replace('-', ' ')}</span>
              </nav>
              <h1 className="text-3xl font-bold text-slate-900">{getPageTitle()}</h1>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
