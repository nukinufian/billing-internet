
import React, { useState, useMemo, useRef } from 'react';
import { Absensi, Karyawan, User, JadwalKehadiran } from '../types';
import { Clock, Fingerprint, Camera, MapPin, CheckCircle2, XCircle, Printer, FileText, Calendar, Search, ArrowRightLeft, UserCheck, CreditCard, CalendarDays, ShieldAlert, Plus, Trash2, Info } from 'lucide-react';
import DataTable from './DataTable';
import { MONTHS } from '../constants';

interface AbsensiViewProps {
  user: User;
  karyawan: Karyawan[];
  absensi: Absensi[];
  schedules: JadwalKehadiran[];
  appLogo: string | null;
  companyName: string;
  onAddAbsensi: (abs: Absensi) => void;
  onUpdateAbsensi: (abs: Absensi) => void;
  onUpdateSchedule: (sched: JadwalKehadiran) => void;
}

const AbsensiView: React.FC<AbsensiViewProps> = ({ 
  user, 
  karyawan, 
  absensi, 
  schedules,
  appLogo,
  companyName,
  onAddAbsensi, 
  onUpdateAbsensi,
  onUpdateSchedule 
}) => {
  const [activeTab, setActiveTab] = useState<'absen' | 'rekap' | 'payroll' | 'jadwal'>(user.role === 'Teknisi' || user.role === 'Penarik' ? 'absen' : 'rekap');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [quotaLibur, setQuotaLibur] = useState(4);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const myKaryawanId = user.karyawanId;
  const myTodayAbsen = absensi.find(a => a.karyawanId === myKaryawanId && a.tanggal === today);
  const isAdmin = user.role === 'Owner' || user.role === 'Admin';

  const handleAbsenMasuk = async () => {
    if (!myKaryawanId) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newAbsen: Absensi = {
      id: `abs-${Date.now()}`,
      karyawanId: myKaryawanId,
      tanggal: today,
      jamMasuk: time,
      status: 'Hadir',
    };
    onAddAbsensi(newAbsen);
  };

  const handleAbsenKeluar = () => {
    if (!myTodayAbsen) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    onUpdateAbsensi({ ...myTodayAbsen, jamKeluar: time });
  };

  const handleAddHoliday = (kId: string, date: string) => {
    setErrorMessage(null);
    const k = karyawan.find(x => x.id === kId);
    if (!k) return;

    const currentSchedule = schedules.find(s => s.karyawanId === kId && s.bulan === selectedMonth && s.tahun === selectedYear) || {
      id: `sch-${kId}-${selectedMonth}-${selectedYear}`,
      karyawanId: kId,
      bulan: selectedMonth,
      tahun: selectedYear,
      tanggalLibur: []
    };

    if (currentSchedule.tanggalLibur.length >= quotaLibur) {
      setErrorMessage(`Kuota libur untuk ${k.nama} sudah penuh (${quotaLibur} hari).`);
      return;
    }

    if (k.posisi.toLowerCase().includes('teknisi')) {
      const isConflicting = schedules.some(s => {
        const otherK = karyawan.find(x => x.id === s.karyawanId);
        return s.karyawanId !== kId && 
               otherK?.posisi.toLowerCase().includes('teknisi') && 
               s.tanggalLibur.includes(date);
      });

      if (isConflicting) {
        setErrorMessage(`Gagal! Teknisi lain sudah dijadwalkan libur pada tanggal ${date}. Tidak boleh ada 2 teknisi libur bersamaan.`);
        return;
      }
    }

    if (!currentSchedule.tanggalLibur.includes(date)) {
      onUpdateSchedule({
        ...currentSchedule,
        tanggalLibur: [...currentSchedule.tanggalLibur, date].sort()
      });
    }
  };

  const handleRemoveHoliday = (kId: string, date: string) => {
    const currentSchedule = schedules.find(s => s.karyawanId === kId && s.bulan === selectedMonth && s.tahun === selectedYear);
    if (currentSchedule) {
      onUpdateSchedule({
        ...currentSchedule,
        tanggalLibur: currentSchedule.tanggalLibur.filter(d => d !== date)
      });
    }
  };

  const printJadwal = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Jadwal Libur Karyawan - ${selectedMonth} ${selectedYear}</title>
          <style>
            @page { size: A4 landscape; margin: 15mm; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 20px; }
            .header { display: flex; align-items: center; justify-content: center; gap: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 30px; }
            .logo-img { width: 50px; height: 50px; object-fit: contain; }
            .title { font-size: 20px; font-weight: bold; margin: 0; }
            .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 12px; border: 1px solid #e2e8f0; }
            td { padding: 12px; font-size: 12px; border: 1px solid #e2e8f0; vertical-align: top; }
            .holiday-tag { display: inline-block; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin: 2px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${appLogo ? `<img src="${appLogo}" class="logo-img" />` : ''}
            <div style="text-align: center;">
              <h1 class="title">REKAPITULASI JADWAL LIBUR KARYAWAN</h1>
              <p class="meta">${companyName} | Periode: ${selectedMonth} ${selectedYear}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="250">Nama Karyawan / Posisi</th>
                <th>Tanggal Libur Terjadwal</th>
                <th width="100" style="text-align: center;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${karyawan.map(k => {
                const sched = schedules.find(s => s.karyawanId === k.id && s.bulan === selectedMonth && s.tahun === selectedYear);
                const holidays = sched?.tanggalLibur || [];
                return `
                  <tr>
                    <td>
                      <strong>${k.nama}</strong><br/>
                      <small style="color:#64748b; text-transform:uppercase;">${k.posisi}</small>
                    </td>
                    <td>
                      ${holidays.length > 0 
                        ? holidays.map(d => `<span class="holiday-tag">${d}</span>`).join('') 
                        : '<span style="color:#cbd5e1; font-style:italic;">Belum ada jadwal libur</span>'}
                    </td>
                    <td style="text-align: center; font-weight: bold;">${holidays.length} Hari</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
            <div style="text-align: center; width: 200px;">
              Manager Operasional,<br><br><br><br>
              ( ____________________ )
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const printSlipGaji = (k: Karyawan) => {
    const periodAbsen = absensi.filter(a => a.karyawanId === k.id && new Date(a.tanggal).getMonth() === MONTHS.indexOf(selectedMonth) && new Date(a.tanggal).getFullYear() === selectedYear);
    const totalHadir = periodAbsen.filter(a => a.status === 'Hadir').length;
    const tunjangan = totalHadir * k.tunjanganHarian;
    const totalGaji = k.gajiPokok + tunjangan;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Slip Gaji - ${k.nama} - ${selectedMonth} ${selectedYear}</title>
          <style>
            @page { size: A5 landscape; margin: 10mm; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; padding: 20px; }
            .header { display: flex; align-items: center; justify-content: center; gap: 15px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
            .logo-img { width: 40px; height: 40px; object-fit: contain; }
            .title { font-size: 18px; font-weight: bold; margin: 0; }
            .details { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; padding: 8px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
            .total-row { font-weight: bold; background: #f8fafc; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${appLogo ? `<img src="${appLogo}" class="logo-img" />` : ''}
            <div style="text-align: center;">
              <h1 class="title">SLIP GAJI KARYAWAN</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">${companyName} | Periode: ${selectedMonth} ${selectedYear}</p>
            </div>
          </div>

          <div class="details">
            <div>
              <strong>Nama:</strong> ${k.nama}<br>
              <strong>Jabatan:</strong> ${k.posisi}
            </div>
            <div style="text-align: right;">
              <strong>NIK:</strong> ${k.nik}<br>
              <strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID')}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Keterangan</th>
                <th style="text-align: right;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gaji Pokok</td>
                <td style="text-align: right;">Rp ${k.gajiPokok.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Tunjangan Kehadiran (${totalHadir} Hari x Rp ${k.tunjanganHarian.toLocaleString()})</td>
                <td style="text-align: right;">Rp ${tunjangan.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL DITERIMA (Take Home Pay)</td>
                <td style="text-align: right;">Rp ${totalGaji.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div style="text-align: center; width: 150px;">
              Penerima,<br><br><br><br>
              ( ${k.nama} )
            </div>
            <div style="text-align: center; width: 150px;">
              Hormat Kami,<br><br><br><br>
              ( Admin Keuangan )
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };
  // ... rest of component stays the same
  const rekapColumns = [
    { 
      header: 'Karyawan', 
      accessor: (a: Absensi) => {
        const k = karyawan.find(x => x.id === a.karyawanId);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{k?.nama || 'Unknown'}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{k?.posisi}</span>
          </div>
        );
      }
    },
    { header: 'Tanggal', accessor: (a: Absensi) => <span className="text-xs font-medium">{a.tanggal}</span> },
    { 
      header: 'Jam Masuk', 
      accessor: (a: Absensi) => (
        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <Clock size={14} /> {a.jamMasuk}
        </div>
      )
    },
    { 
      header: 'Jam Keluar', 
      accessor: (a: Absensi) => a.jamKeluar ? (
        <div className="flex items-center gap-1.5 text-rose-600 font-bold">
          <Clock size={14} /> {a.jamKeluar}
        </div>
      ) : <span className="text-slate-300 italic text-xs">Belum Absen</span>
    },
    { 
      header: 'Status', 
      accessor: (a: Absensi) => (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
          a.status === 'Hadir' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {a.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap p-1.5 bg-slate-200/50 rounded-2xl w-fit gap-1">
        <button 
          onClick={() => setActiveTab('absen')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'absen' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Fingerprint size={14} /> ABSEN
        </button>
        {isAdmin && (
          <>
            <button 
              onClick={() => setActiveTab('jadwal')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'jadwal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarDays size={14} /> JADWAL KERJA
            </button>
            <button 
              onClick={() => setActiveTab('rekap')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'rekap' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Calendar size={14} /> REKAP
            </button>
            <button 
              onClick={() => setActiveTab('payroll')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'payroll' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CreditCard size={14} /> PAYROLL
            </button>
          </>
        )}
      </div>

      {activeTab === 'absen' && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Fingerprint size={150} /></div>
             <div>
                <p className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-2">Presensi Digital</p>
                <h2 className="text-4xl font-black text-slate-800">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</h2>
                <p className="text-slate-400 font-medium">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${myTodayAbsen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}><CheckCircle2 size={18} /></div>
                      <span className="text-sm font-bold text-slate-700">Clock In</span>
                   </div>
                   <span className="font-black text-slate-800">{myTodayAbsen?.jamMasuk || '--:--'}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${myTodayAbsen?.jamKeluar ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-400'}`}><XCircle size={18} /></div>
                      <span className="text-sm font-bold text-slate-700">Clock Out</span>
                   </div>
                   <span className="font-black text-slate-800">{myTodayAbsen?.jamKeluar || '--:--'}</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button disabled={!!myTodayAbsen} onClick={handleAbsenMasuk} className={`py-5 rounded-2xl font-black text-sm shadow-xl transition-all flex flex-col items-center gap-2 ${myTodayAbsen ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}>
                   <ArrowRightLeft size={24} className="rotate-90" /> MASUK
                </button>
                <button disabled={!myTodayAbsen || !!myTodayAbsen.jamKeluar} onClick={handleAbsenKeluar} className={`py-5 rounded-2xl font-black text-sm shadow-xl transition-all flex flex-col items-center gap-2 ${!myTodayAbsen || myTodayAbsen.jamKeluar ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'}`}>
                   <ArrowRightLeft size={24} className="-rotate-90" /> KELUAR
                </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'jadwal' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><CalendarDays size={24} /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Manajemen Jadwal & Libur</h3>
                <p className="text-xs text-slate-400 font-medium">Atur hari libur tanpa bentrokan antar teknisi</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Kuota Libur</label>
                 <input 
                  type="number" 
                  value={quotaLibur} 
                  onChange={(e) => setQuotaLibur(parseInt(e.target.value))}
                  className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                 />
               </div>
               <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                <Calendar size={14} className="text-slate-400 ml-2" />
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm font-bold outline-none py-1.5">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent text-sm font-bold outline-none py-1.5">
                  {[2026, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button 
                onClick={printJadwal}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Printer size={16} /> CETAK JADWAL
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in slide-in-from-top-2">
              <ShieldAlert size={20} /> {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {karyawan.map(k => {
              const currentSchedule = schedules.find(s => s.karyawanId === k.id && s.bulan === selectedMonth && s.tahun === selectedYear);
              const holidays = currentSchedule?.tanggalLibur || [];
              const isTeknisi = k.posisi.toLowerCase().includes('teknisi');

              return (
                <div key={k.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-lg font-black text-slate-800">{k.nama}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase">{k.posisi}</p>
                    </div>
                    {isTeknisi && <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">STRICT SCHEDULING</div>}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-500">Libur Terjadwal:</span>
                       <span className={`text-xs font-black ${holidays.length >= quotaLibur ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {holidays.length} / {quotaLibur} HARI
                       </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {holidays.map(date => (
                        <div key={date} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold">
                           {date}
                           <button onClick={() => handleRemoveHoliday(k.id, date)} className="hover:text-rose-400"><Trash2 size={12} /></button>
                        </div>
                      ))}
                      {holidays.length < quotaLibur && (
                        <input 
                          type="date" 
                          onChange={(e) => handleAddHoliday(k.id, e.target.value)}
                          className="px-2 py-1 text-[10px] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
             <Info size={18} className="text-amber-500 mt-0.5" />
             <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
               <strong>Sistem Anti-Bentrok:</strong> Untuk menjaga ketersediaan tim teknis di lapangan, sistem akan memblokir pemilihan tanggal libur jika sudah ada teknisi lain yang dijadwalkan libur pada hari yang sama.
             </p>
          </div>
        </div>
      )}

      {activeTab === 'rekap' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><UserCheck size={24} /></div>
              <div><h3 className="text-lg font-bold text-slate-800">Filter Rekap Absensi</h3><p className="text-xs text-slate-500">Pantau kehadiran tim Anda per periode</p></div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <Calendar size={14} className="text-slate-400 ml-2" />
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm font-bold outline-none py-1.5">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent text-sm font-bold outline-none py-1.5">
                {[2026, 2025].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <DataTable title={`Rekapitulasi Kehadiran ${selectedMonth} ${selectedYear}`} data={absensi.filter(a => new Date(a.tanggal).getMonth() === MONTHS.indexOf(selectedMonth) && new Date(a.tanggal).getFullYear() === selectedYear)} columns={rekapColumns} />
        </div>
      )}

      {activeTab === 'payroll' && isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {karyawan.map(k => {
                const periodAbsen = absensi.filter(a => a.karyawanId === k.id && new Date(a.tanggal).getMonth() === MONTHS.indexOf(selectedMonth) && new Date(a.tanggal).getFullYear() === selectedYear);
                const totalHadir = periodAbsen.filter(a => a.status === 'Hadir').length;
                const tunjangan = totalHadir * k.tunjanganHarian;
                const totalGaji = k.gajiPokok + tunjangan;
                return (
                  <div key={k.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">{k.nama.substring(0,2).toUpperCase()}</div>
                       <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">{totalHadir} KEHADIRAN</span>
                    </div>
                    <div className="mb-6"><h4 className="text-lg font-black text-slate-800">{k.nama}</h4><p className="text-xs text-slate-400 font-bold uppercase">{k.posisi}</p></div>
                    <div className="space-y-3 mb-8">
                       <div className="flex justify-between text-sm"><span className="text-slate-500">Gaji Pokok</span><span className="font-bold text-slate-700">Rp {k.gajiPokok.toLocaleString()}</span></div>
                       <div className="flex justify-between text-sm"><span className="text-slate-500">Tunjangan</span><span className="font-bold text-slate-700">Rp {tunjangan.toLocaleString()}</span></div>
                       <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between"><span className="text-xs font-black text-slate-400 uppercase">Take Home Pay</span><span className="text-lg font-black text-indigo-600">Rp {totalGaji.toLocaleString()}</span></div>
                    </div>
                    <button onClick={() => printSlipGaji(k)} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all">
                       <Printer size={16} /> CETAK SLIP GAJI
                    </button>
                  </div>
                );
             })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsensiView;
