
import React, { useState, useRef } from 'react';
import { Globe, MapPin, Phone, Mail, CreditCard, Bell, Database, ShieldCheck, Save, CheckCircle2, Layers, Zap, TrendingUp, Calculator, Clock, Landmark, ShieldAlert, Lock, Check, Camera, ImagePlus, Trash2, Smartphone, FileText, Landmark as BankIcon, MessageSquare, Monitor } from 'lucide-react';
import { AssetSettings, InvoiceSettings } from '../types';

interface PengaturanUmumViewProps {
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  companyName: string;
  onCompanyNameChange: (name: string) => void;
  companyTagline: string;
  onCompanyTaglineChange: (tag: string) => void;
}

export const PengaturanUmumView: React.FC<PengaturanUmumViewProps> = ({ 
  logo, onLogoChange, companyName, onCompanyNameChange, companyTagline, onCompanyTaglineChange 
}) => {
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Globe className="text-indigo-600" size={20} /> Identitas Bisnis
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Perusahaan / ISP</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => onCompanyNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={companyTagline}
                  onChange={(e) => onCompanyTaglineChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="text-indigo-600" size={20} /> Kontak & Lokasi
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Kantor</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" defaultValue="Jl. Sudirman No. 123, Jakarta Pusat" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input type="text" defaultValue="081234567890" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Support</label>
                  <input type="email" defaultValue="support@netbill.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end items-center gap-4">
           {success && <span className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Perubahan Berhasil Disimpan</span>}
           <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
             <Save size={18} /> Simpan Perubahan
           </button>
        </div>
      </form>
    </div>
  );
};

export const PengaturanInvoiceView: React.FC<{ settings: InvoiceSettings, onUpdate: (s: InvoiceSettings) => void }> = ({ settings, onUpdate }) => {
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} /> Kalkulasi & Pajak
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Terapkan PPN (VAT)</p>
                  <p className="text-[10px] text-slate-500">Otomatis tambahkan PPN pada setiap invoice</p>
                </div>
                <div 
                  onClick={() => onUpdate({ ...settings, useVAT: !settings.useVAT })}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.useVAT ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.useVAT ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>

              {settings.useVAT && (
                <div className="px-4 py-2 animate-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Persentase PPN (%)</label>
                  <input 
                    type="number" 
                    value={settings.vatPercent} 
                    onChange={(e) => onUpdate({ ...settings, vatPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Tunggakan Otomatis</p>
                  <p className="text-[10px] text-slate-500">Tagihkan sisa pembayaran bulan lalu di invoice baru</p>
                </div>
                <div 
                  onClick={() => onUpdate({ ...settings, carryOverUnpaid: !settings.carryOverUnpaid })}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.carryOverUnpaid ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.carryOverUnpaid ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BankIcon className="text-indigo-600" size={20} /> Informasi Pembayaran
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Bank</label>
                <input 
                  type="text" 
                  value={settings.bankName}
                  onChange={(e) => onUpdate({ ...settings, bankName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  placeholder="Contoh: Bank BCA"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nomor Rekening</label>
                <input 
                  type="text" 
                  value={settings.bankAccount}
                  onChange={(e) => onUpdate({ ...settings, bankAccount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  placeholder="123-456-7890"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Atas Nama (Holder)</label>
                <input 
                  type="text" 
                  value={settings.bankHolder}
                  onChange={(e) => onUpdate({ ...settings, bankHolder: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  placeholder="NetBill Indonesia"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-indigo-600" size={20} /> Footer Invoice
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Pesan di Bawah Invoice</label>
              <textarea 
                value={settings.footerMessage}
                onChange={(e) => onUpdate({ ...settings, footerMessage: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] font-medium text-slate-700 resize-none"
                placeholder="Tuliskan pesan terima kasih atau info tambahan..."
              />
            </div>
        </div>

        <div className="pt-6 flex justify-end items-center gap-4">
           {success && <span className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Pengaturan Berhasil Disimpan</span>}
           <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95">
             <Save size={18} /> Simpan Pengaturan Invoice
           </button>
        </div>
      </form>
    </div>
  );
};

interface PengaturanAplikasiViewProps {
  appName: string;
  onAppNameChange: (name: string) => void;
  appLogo: string | null;
  onAppLogoChange: (logo: string | null) => void;
}

export const PengaturanAplikasiView: React.FC<PengaturanAplikasiViewProps> = ({ 
  appName, onAppNameChange, appLogo, onAppLogoChange 
}) => {
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onAppLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Smartphone className="text-indigo-600" size={20} /> Branding Aplikasi
            </h3>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Logo Aplikasi</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                  {appLogo ? (
                    <>
                      <img src={appLogo} alt="Preview" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button type="button" onClick={() => onAppLogoChange(null)} className="p-2 bg-rose-500 text-white rounded-full transition-all hover:scale-110"><Trash2 size={16} /></button>
                      </div>
                    </>
                  ) : (
                    <ImagePlus size={32} className="text-slate-300" />
                  )}
                </div>
                <div className="space-y-2">
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                   />
                   <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                   >
                     <Camera size={14} /> Ganti Logo
                   </button>
                   <p className="text-[10px] text-slate-400 font-medium">Format PNG/JPG, Maks 1MB. Tampil di Sidebar & Login.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <Monitor size={16} className="text-slate-400" /> Nama Aplikasi
              </label>
              <input 
                type="text" 
                value={appName} 
                onChange={(e) => onAppNameChange(e.target.value)}
                placeholder="Contoh: NetBill Manager Pro"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
              />
              <p className="text-[10px] text-slate-400 mt-2 italic">*Nama ini akan muncul di seluruh antarmuka dashboard dan title bar.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={20} /> Fitur Sistem
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">Notifikasi WhatsApp Otomatis</p>
                  <p className="text-xs text-slate-500">Kirim pengingat tagihan otomatis</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">Laporan Dashboard Real-time</p>
                  <p className="text-xs text-slate-500">Perbarui grafik dashboard secara instan</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">Backup Cloud Mingguan</p>
                  <p className="text-xs text-slate-500">Cadangkan database ke cloud server</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end items-center gap-4">
           {success && <span className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Perubahan Berhasil Disimpan</span>}
           <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95">
             <Save size={18} /> Simpan Pengaturan Aplikasi
           </button>
        </div>
      </form>
    </div>
  );
};

interface PengaturanAsetViewProps {
  settings: AssetSettings;
  onUpdate: (settings: AssetSettings) => void;
}

export const PengaturanAsetView: React.FC<PengaturanAsetViewProps> = ({ settings, onUpdate }) => {
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="text-indigo-600" size={20} /> Parameter Valuasi & Depresiasi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><Clock size={14}/> Masa Pakai (Tahun)</label>
            <input 
              type="number" 
              value={settings.depreciationLifespanYears} 
              onChange={(e) => onUpdate({ ...settings, depreciationLifespanYears: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><TrendingUp size={14}/> Nilai Sisa (%)</label>
            <input 
              type="number" 
              value={settings.salvageValuePercent} 
              onChange={(e) => onUpdate({ ...settings, salvageValuePercent: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><Zap size={14}/> Multiplier Valuasi</label>
            <input 
              type="number" 
              value={settings.valuationMultiplier} 
              onChange={(e) => onUpdate({ ...settings, valuationMultiplier: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><ShieldAlert size={14}/> Estimasi Churn (%)</label>
            <input 
              type="number" 
              value={settings.churnRateEstimate} 
              onChange={(e) => onUpdate({ ...settings, churnRateEstimate: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end items-center gap-4">
           {success && <span className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Tersimpan</span>}
           <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
             Simpan Pengaturan Aset
           </button>
        </div>
      </form>
    </div>
  );
};

interface HakAksesViewProps {
  permissions: Record<string, Record<string, boolean>>;
  onUpdatePermissions: (permissions: Record<string, Record<string, boolean>>) => void;
}

export const HakAksesView: React.FC<HakAksesViewProps> = ({ permissions, onUpdatePermissions }) => {
  const roles = ['Owner', 'Admin', 'Teknisi', 'Penarik'];
  const modules = Object.keys(permissions);

  const togglePermission = (module: string, role: string) => {
    const updated = { ...permissions };
    updated[module] = { ...updated[module], [role]: !updated[module][role] };
    onUpdatePermissions(updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Lock className="text-indigo-600" size={20} /> Matriks Hak Akses (Role Permissions)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Modul / Fitur</th>
              {roles.map(role => (
                <th key={role} className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-center">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modules.map(module => (
              <tr key={module} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700 capitalize">{module.replace('-', ' ')}</td>
                {roles.map(role => (
                  <td key={role} className="px-6 py-4 text-center">
                    <button 
                      onClick={() => togglePermission(module, role)}
                      className={`w-8 h-8 rounded-lg border mx-auto flex items-center justify-center transition-all ${
                        permissions[module][role] 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-white border-slate-200 text-transparent hover:border-indigo-300'
                      }`}
                    >
                      <Check size={16} strokeWidth={4} />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
