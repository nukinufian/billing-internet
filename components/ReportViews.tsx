
import React, { useState, useMemo } from 'react';
import { Tagihan, Pelanggan, Pengeluaran, Aset, Wilayah, AssetSettings, PemilikSaham } from '../types';
import { Printer, MapPin, TrendingUp, TrendingDown, Landmark, PieChart, FileText, Download, Briefcase, Calendar, Coins, UserCheck, ArrowRight } from 'lucide-react';
import { MOCK_PAKET, MONTHS } from '../constants';

interface LabaRugiProps {
  bills: Tagihan[];
  expenses: Pengeluaran[];
  customers: Pelanggan[];
  wilayah: Wilayah[];
  appLogo: string | null;
  companyName: string;
}

export const LabaRugiReportView: React.FC<LabaRugiProps> = ({ bills, expenses, customers, wilayah, appLogo, companyName }) => {
  const [selectedWilayahId, setSelectedWilayahId] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(2026);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      if (b.status !== 'Lunas') return false;
      const matchesPeriod = b.bulan === selectedMonth && Number(b.tahun) === Number(selectedYear);
      if (!matchesPeriod) return false;
      if (selectedWilayahId === 'all') return true;
      const p = customers.find(cust => cust.id === b.pelangganId);
      return p?.wilayahId === selectedWilayahId;
    });
  }, [bills, selectedWilayahId, selectedMonth, selectedYear, customers]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesWilayah = selectedWilayahId === 'all' || e.wilayahId === selectedWilayahId;
      const expDate = new Date(e.tanggal);
      const expMonth = MONTHS[expDate.getMonth()];
      const expYear = expDate.getFullYear();
      return matchesWilayah && expMonth === selectedMonth && Number(expYear) === Number(selectedYear);
    });
  }, [expenses, selectedWilayahId, selectedMonth, selectedYear]);

  const totalIncome = filteredBills.reduce((acc, b) => acc + (b.jumlah - (b.diskon || 0)), 0);
  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.jumlah, 0);
  const netProfit = totalIncome - totalExpense;

  const handlePrint = () => {
    const wName = selectedWilayahId === 'all' ? 'Seluruh Wilayah' : wilayah.find(w => w.id === selectedWilayahId)?.nama;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Laporan Laba Rugi - ${selectedMonth} ${selectedYear}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
            .header { display: flex; align-items: center; justify-content: center; gap: 20px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-img { width: 60px; height: 60px; object-fit: contain; }
            .title { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; }
            .subtitle { font-size: 14px; color: #64748b; font-weight: 500; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; color: #4f46e5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th { text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; padding: 10px; border-bottom: 1px solid #f1f5f9; }
            td { padding: 10px; font-size: 13px; border-bottom: 1px solid #f8fafc; }
            .text-right { text-align: right; }
            .summary-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 30px; border: 1px solid #e2e8f0; }
            .grand-total { border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px; font-size: 18px; font-weight: 900; color: ${netProfit >= 0 ? '#059669' : '#e11d48'}; }
            .footer { margin-top: 60px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${appLogo ? `<img src="${appLogo}" class="logo-img" />` : ''}
            <div style="text-align: center;">
              <h1 class="title">LAPORAN LABA RUGI</h1>
              <p class="subtitle">${companyName} | Periode: ${selectedMonth} ${selectedYear} | Wilayah: ${wName}</p>
            </div>
          </div>
          <div class="section-title">PENDAPATAN (INCOME)</div>
          <table>
            <thead><tr><th>Tanggal / Pelanggan</th><th class="text-right">Jumlah</th></tr></thead>
            <tbody>
              ${filteredBills.length > 0 ? filteredBills.map(b => {
                const p = customers.find(cust => cust.id === b.pelangganId);
                return `<tr><td>${b.tanggalBayar || '-'} - ${p?.nama}</td><td class="text-right">Rp ${(b.jumlah - (b.diskon || 0)).toLocaleString()}</td></tr>`;
              }).join('') : '<tr><td colspan="2">Kosong</td></tr>'}
            </tbody>
          </table>
          <div class="section-title">PENGELUARAN (EXPENSES)</div>
          <table>
            <thead><tr><th>Tanggal / Uraian</th><th class="text-right">Jumlah</th></tr></thead>
            <tbody>
              ${filteredExpenses.map(e => `<tr><td>${e.tanggal} | [${e.kategori}] ${e.keterangan}</td><td class="text-right">Rp ${e.jumlah.toLocaleString()}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="summary-box">
            <div class="grand-total" style="display: flex; justify-content: space-between;">
              <span>Laba Bersih:</span><span>Rp ${netProfit.toLocaleString()}</span>
            </div>
          </div>
          <div class="footer">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Filter Laporan Keuangan</h3>
            <p className="text-xs text-slate-500">Sesuaikan wilayah dan periode waktu</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={selectedWilayahId}
            onChange={(e) => setSelectedWilayahId(e.target.value)}
            className="flex-1 lg:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
          >
            <option value="all">Semua Wilayah</option>
            {wilayah.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
          </select>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 flex-1 lg:flex-none">
            <Calendar size={14} className="text-slate-400 ml-2" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer py-1.5"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer py-1.5"
            >
              {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={handlePrint}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            title="Cetak Laporan ke PDF"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <p className="text-emerald-100 text-xs font-black uppercase mb-1">Pemasukan ({selectedMonth})</p>
          <h2 className="text-3xl font-black">Rp {totalIncome.toLocaleString()}</h2>
          <TrendingUp className="absolute right-4 bottom-4 opacity-20" size={64} />
        </div>
        <div className="bg-rose-600 p-8 rounded-[2rem] text-white shadow-xl shadow-rose-100 relative overflow-hidden">
          <p className="text-rose-100 text-xs font-black uppercase mb-1">Pengeluaran ({selectedMonth})</p>
          <h2 className="text-3xl font-black">Rp {totalExpense.toLocaleString()}</h2>
          <TrendingDown className="absolute right-4 bottom-4 opacity-20" size={64} />
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <p className="text-slate-400 text-xs font-black uppercase mb-1">Laba Bersih</p>
          <h2 className={`text-3xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Rp {netProfit.toLocaleString()}
          </h2>
          <Landmark className="absolute right-4 bottom-4 opacity-20" size={64} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              <h4 className="font-bold text-slate-800">Rincian Pendapatan</h4>
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{selectedMonth} {selectedYear}</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400">PELANGGAN</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 text-right">JUMLAH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBills.length > 0 ? filteredBills.map(b => {
                  const p = customers.find(cust => cust.id === b.pelangganId);
                  return (
                    <tr key={b.id}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{p?.nama || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400">{b.tanggalBayar || 'Lunas'}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600">
                        Rp {(b.jumlah - (b.diskon || 0)).toLocaleString()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-300 italic">Data kosong</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown size={20} className="text-rose-500" />
              <h4 className="font-bold text-slate-800">Rincian Pengeluaran</h4>
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{selectedMonth} {selectedYear}</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400">URAIAN</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 text-right">JUMLAH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.length > 0 ? filteredExpenses.map(e => (
                  <tr key={e.id}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{e.keterangan}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{e.kategori} | {e.tanggal}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-rose-600">
                      Rp {e.jumlah.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-300 italic">Data kosong</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BagihasilReportView: React.FC<{
  bills: Tagihan[];
  expenses: Pengeluaran[];
  owners: PemilikSaham[];
  appLogo: string | null;
  companyName: string;
}> = ({ bills, expenses, owners, appLogo, companyName }) => {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(2026);

  const stats = useMemo(() => {
    const periodBills = bills.filter(b => b.status === 'Lunas' && b.bulan === selectedMonth && Number(b.tahun) === Number(selectedYear));
    const periodExpenses = expenses.filter(e => {
      const d = new Date(e.tanggal);
      return MONTHS[d.getMonth()] === selectedMonth && d.getFullYear() === selectedYear;
    });

    const omsetKotor = periodBills.reduce((acc, b) => acc + (b.jumlah - (b.diskon || 0)), 0);
    const totalExp = periodExpenses.reduce((acc, e) => acc + e.jumlah, 0);
    const labaBersih = omsetKotor - totalExp;

    return { omsetKotor, totalExp, labaBersih };
  }, [bills, expenses, selectedMonth, selectedYear]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Laporan Bagi Hasil - ${selectedMonth} ${selectedYear}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 50px; height: 50px; margin-bottom: 10px; }
            .title { font-size: 20px; font-weight: bold; margin: 0; }
            .summary { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .summary-item { text-align: center; flex: 1; }
            .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .summary-value { font-size: 16px; font-weight: bold; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 12px; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .footer { margin-top: 50px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${appLogo ? `<img src="${appLogo}" class="logo" />` : ''}
            <div class="title">LAPORAN PEMBAGIAN HASIL (DIVIDEN)</div>
            <div style="color: #64748b;">${companyName} | Periode: ${selectedMonth} ${selectedYear}</div>
          </div>
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Omset Kotor</div>
              <div class="summary-value">Rp ${stats.omsetKotor.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Pengeluaran</div>
              <div class="summary-value">Rp ${stats.totalExp.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Laba Bersih</div>
              <div class="summary-value" style="color: #4f46e5;">Rp ${stats.labaBersih.toLocaleString()}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Pemegang Saham</th>
                <th>Kepemilikan (%)</th>
                <th style="text-align: right;">Hasil Diterima</th>
              </tr>
            </thead>
            <tbody>
              ${owners.map(o => `
                <tr>
                  <td><strong>${o.nama}</strong><br><small>${o.nik}</small></td>
                  <td>${o.persentaseSaham}%</td>
                  <td style="text-align: right; font-weight: bold;">Rp ${Math.round((o.persentaseSaham / 100) * stats.labaBersih).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Coins size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Filter Distribusi Laba</h3>
            <p className="text-xs text-slate-500">Pilih periode untuk perhitungan bagi hasil</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 flex-1 lg:flex-none">
            <Calendar size={14} className="text-slate-400 ml-2" />
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm font-bold outline-none py-1.5">
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent text-sm font-bold outline-none py-1.5">
              {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handlePrint} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Omset Kotor (Paid)</p>
             <h4 className="text-2xl font-black text-slate-800">Rp {stats.omsetKotor.toLocaleString()}</h4>
           </div>
           <TrendingUp size={80} className="absolute -right-4 -bottom-4 text-emerald-50" />
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Pengeluaran</p>
             <h4 className="text-2xl font-black text-slate-800">Rp {stats.totalExp.toLocaleString()}</h4>
           </div>
           <TrendingDown size={80} className="absolute -right-4 -bottom-4 text-rose-50" />
        </div>
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Hasil Bersih Dibagikan</p>
             <h4 className="text-2xl font-black">Rp {stats.labaBersih.toLocaleString()}</h4>
           </div>
           <Coins size={80} className="absolute -right-4 -bottom-4 text-white/10" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><UserCheck size={20} /></div>
              <h4 className="font-bold text-slate-800 text-lg">Distribusi Dividen Proporsional</h4>
           </div>
           <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase">{selectedMonth} {selectedYear}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Penerima Manfaat</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Share (%)</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Estimasi Terima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {owners.map(o => {
                const hasil = (o.persentaseSaham / 100) * stats.labaBersih;
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase">{o.nama.substring(0,2)}</div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{o.nama}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NIK: {o.nik}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-indigo-500 h-full" style={{ width: `${o.persentaseSaham}%` }}></div>
                        </div>
                        <span className="text-sm font-black text-slate-700">{o.persentaseSaham}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-lg">
                          <span>Rp {Math.round(hasil).toLocaleString()}</span>
                          <ArrowRight size={16} className="text-slate-200 group-hover:text-emerald-300 transition-colors" />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <p className="text-[10px] text-slate-400 text-center italic">Perhitungan ini bersifat estimasi berdasarkan data real-time penagihan dan pengeluaran yang tercatat di sistem.</p>
        </div>
      </div>
    </div>
  );
};

interface LaporanAsetReportViewProps {
  assets: Aset[];
  customers: Pelanggan[];
  wilayah: Wilayah[];
  settings: AssetSettings;
  appLogo: string | null;
  companyName: string;
}

export const LaporanAsetReportView: React.FC<LaporanAsetReportViewProps> = ({ assets, customers, wilayah, settings, appLogo, companyName }) => {
  const [selectedWilayahId, setSelectedWilayahId] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(2026);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => selectedWilayahId === 'all' || a.wilayahId === selectedWilayahId);
  }, [assets, selectedWilayahId]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.status === 'Aktif' && (selectedWilayahId === 'all' || c.wilayahId === selectedWilayahId));
  }, [customers, selectedWilayahId]);

  const calculateDepreciatedValue = (cost: number, acqDate: string) => {
    const acquisition = new Date(acqDate);
    const now = new Date();
    const ageInYears = (now.getTime() - acquisition.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const salvageValue = cost * (settings.salvageValuePercent / 100);
    const annualDepreciation = (cost - salvageValue) / settings.depreciationLifespanYears;
    return Math.max(salvageValue, cost - (annualDepreciation * Math.max(0, ageInYears)));
  };

  const calculateCustomerValue = (p: Pelanggan) => {
    const paket = MOCK_PAKET.find(pk => pk.id === p.paketId);
    const monthlyRevenue = paket?.harga || 0;
    const grossVal = monthlyRevenue * settings.valuationMultiplier;
    return grossVal - (grossVal * (settings.churnRateEstimate / 100));
  };

  const totalPhysicalValue = filteredAssets.reduce((acc, a) => acc + calculateDepreciatedValue(a.nilai, a.tanggalPerolehan), 0);
  const totalEconomicValue = filteredCustomers.reduce((acc, p) => acc + calculateCustomerValue(p), 0);
  const grandTotalAsset = totalPhysicalValue + totalEconomicValue;

  const handlePrint = () => {
    const wName = selectedWilayahId === 'all' ? 'Seluruh Wilayah' : wilayah.find(w => w.id === selectedWilayahId)?.nama;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Laporan Aset - ${selectedMonth} ${selectedYear}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
            .header { display: flex; align-items: center; justify-content: center; gap: 20px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-img { width: 60px; height: 60px; object-fit: contain; }
            .title { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; }
            .subtitle { font-size: 14px; color: #64748b; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; color: #6366f1; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th { text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; padding: 10px; border-bottom: 1px solid #f1f5f9; }
            td { padding: 10px; font-size: 12px; border-bottom: 1px solid #f8fafc; }
            .text-right { text-align: right; }
            .total-banner { background: #1e293b; color: white; padding: 25px; border-radius: 12px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-value { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            ${appLogo ? `<img src="${appLogo}" class="logo-img" />` : ''}
            <div style="text-align: center;">
              <h1 class="title">LAPORAN KEKAYAAN ASET</h1>
              <p class="subtitle">${companyName} | Periode: ${selectedMonth} ${selectedYear} | Wilayah: ${wName}</p>
            </div>
          </div>
          <div class="section-title">IKHTISAR NILAI ASET</div>
          <div class="total-banner">
            <div>
              <div style="font-size: 14px; font-weight: bold; text-transform: uppercase; opacity: 0.7;">Total Valuasi Bisnis</div>
              <div style="font-size: 10px; opacity: 0.5;">Fisik + Recurring Revenue Equity</div>
            </div>
            <div class="total-value">Rp ${Math.round(grandTotalAsset).toLocaleString()}</div>
          </div>
          <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };
  // ... rest of component stays same
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <PieChart size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Filter Analisa Aset</h3>
            <p className="text-xs text-slate-500">Valuasi kekayaan bisnis per periode</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={selectedWilayahId}
            onChange={(e) => setSelectedWilayahId(e.target.value)}
            className="flex-1 lg:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
          >
            <option value="all">Semua Wilayah</option>
            {wilayah.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
          </select>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 flex-1 lg:flex-none">
            <Calendar size={14} className="text-slate-400 ml-2" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer py-1.5"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer py-1.5"
            >
              {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={handlePrint}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            title="Cetak Laporan Aset"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <Landmark className="absolute -right-12 -bottom-12 opacity-10 -rotate-12" size={250} />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
               <Briefcase size={16} /> Total Net Worth Bisnis ({selectedMonth})
            </p>
            <h2 className="text-5xl font-black">Rp {Math.round(grandTotalAsset).toLocaleString()}</h2>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/5 uppercase">Fisik: Rp {Math.round(totalPhysicalValue).toLocaleString()}</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/5 uppercase">Ekonomi: Rp {Math.round(totalEconomicValue).toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={handlePrint}
            className="px-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/50 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3"
          >
            <Printer size={20} /> CETAK LAPORAN SNAPSHOT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileText size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Daftar Aset Fisik</h4>
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase">Valuasi Depresiasi</span>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
            {filteredAssets.length > 0 ? filteredAssets.map(a => (
              <div key={a.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{a.nama}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{a.kategori} | Kondisi: {a.kondisi}</p>
                </div>
                <p className="font-black text-indigo-600">Rp {Math.round(calculateDepreciatedValue(a.nilai, a.tanggalPerolehan)).toLocaleString()}</p>
              </div>
            )) : <p className="text-center text-slate-400 italic text-sm py-10">Tidak ada aset fisik terdaftar.</p>}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Ekuitas Kontrak Langganan</h4>
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase">Valuasi Proyeksi</span>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
            {filteredCustomers.length > 0 ? filteredCustomers.map(p => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-700 text-sm group-hover:text-emerald-600 transition-colors">{p.nama}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{MOCK_PAKET.find(pk => pk.id === p.paketId)?.nama}</p>
                </div>
                <p className="font-black text-emerald-600">Rp {Math.round(calculateCustomerValue(p)).toLocaleString()}</p>
              </div>
            )) : <p className="text-center text-slate-400 italic text-sm py-10">Tidak ada pelanggan aktif pada wilayah ini.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
