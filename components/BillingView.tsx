
import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import GenerateBillingModal from './GenerateBillingModal';
import ManualBillingModal from './ManualBillingModal';
import { MOCK_PELANGGAN, MONTHS, MOCK_PAKET } from '../constants';
import { Tagihan, Pelanggan, InvoiceSettings } from '../types';
import { Search, Filter, Calendar, CheckCircle2, AlertCircle, Receipt, Zap, Printer, X, AlertTriangle, CreditCard, RotateCcw, Tag, UserPlus } from 'lucide-react';

interface BillingViewProps {
  bills: Tagihan[];
  onUpdate: (data: Tagihan[]) => void;
  customers: Pelanggan[];
  appLogo: string | null;
  companyName: string;
  companyTagline: string;
  invoiceSettings: InvoiceSettings;
}

const BillingView: React.FC<BillingViewProps> = ({ bills, onUpdate, customers, appLogo, companyName, companyTagline, invoiceSettings }) => {
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Lunas' | 'Belum Lunas'>('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(2026); 
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [paymentConfirmId, setPaymentConfirmId] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const pelanggan = customers.find(p => p.id === b.pelangganId);
      const matchStatus = statusFilter === 'Semua' || b.status === statusFilter;
      const matchPeriod = b.bulan === selectedMonth && Number(b.tahun) === Number(selectedYear);
      const matchSearch = searchTerm === '' || 
        pelanggan?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pelanggan?.nik.includes(searchTerm);
      
      return matchStatus && matchPeriod && matchSearch;
    });
  }, [bills, statusFilter, selectedMonth, selectedYear, searchTerm, customers]);

  const stats = useMemo(() => {
    const periodBills = bills.filter(b => b.bulan === selectedMonth && Number(b.tahun) === Number(selectedYear));
    const lunasCount = periodBills.filter(b => b.status === 'Lunas').length;
    const lunasTotal = periodBills.filter(b => b.status === 'Lunas').reduce((a, b) => a + (b.jumlah - (b.diskon || 0)), 0);
    const pendingCount = periodBills.filter(b => b.status === 'Belum Lunas').length;
    const pendingTotal = periodBills.filter(b => b.status === 'Belum Lunas').reduce((a, b) => a + (b.jumlah - (b.diskon || 0)), 0);

    return { lunasCount, lunasTotal, pendingCount, pendingTotal };
  }, [bills, selectedMonth, selectedYear]);

  const handleGenerate = (newBills: Tagihan[]) => {
    onUpdate([...bills, ...newBills]);
    setIsGenerateOpen(false);
  };

  const handleManualGenerate = (newBill: Tagihan) => {
    onUpdate([...bills, newBill]);
    setIsManualOpen(false);
  };

  const executePayment = () => {
    if (paymentConfirmId) {
      onUpdate(bills.map(b => 
        b.id === paymentConfirmId 
          ? { 
              ...b, 
              status: 'Lunas', 
              diskon: discountAmount,
              tanggalBayar: new Date().toISOString().split('T')[0] 
            } 
          : b
      ));
      setPaymentConfirmId(null);
      setDiscountAmount(0);
    }
  };

  const handleCancelPayment = (id: string) => {
    const p = customers.find(cust => cust.id === bills.find(b => b.id === id)?.pelangganId);
    if (confirm(`Apakah Anda yakin ingin MEMBATALKAN status lunas untuk ${p?.nama}? Data akan kembali menjadi 'Belum Lunas'.`)) {
      onUpdate(bills.map(b => 
        b.id === id 
          ? { ...b, status: 'Belum Lunas', tanggalBayar: undefined } 
          : b
      ));
    }
  };

  const handlePrintInvoice = (t: Tagihan) => {
    const p = customers.find(cust => cust.id === t.pelangganId);
    const paket = MOCK_PAKET.find(pk => pk.id === p?.paketId);
    
    // Calculate Carry Over Unpaid if enabled
    let carryOverAmount = 0;
    if (invoiceSettings.carryOverUnpaid) {
      // Find previous unpaid bills for this specific customer excluding current
      const prevUnpaid = bills.filter(b => 
        b.pelangganId === t.pelangganId && 
        b.status === 'Belum Lunas' && 
        b.id !== t.id
      );
      carryOverAmount = prevUnpaid.reduce((acc, b) => acc + (b.jumlah - (b.diskon || 0)), 0);
    }

    const subtotal = t.jumlah;
    const totalDiskon = t.diskon || 0;
    const ppnAmount = invoiceSettings.useVAT ? (subtotal * (invoiceSettings.vatPercent / 100)) : 0;
    const grandTotal = (subtotal - totalDiskon) + ppnAmount + carryOverAmount;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${p?.nama}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Inter', sans-serif; color: #334155; line-height: 1.4; padding: 0; margin: 0; }
            .container { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #f1f5f9; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 25px; }
            .logo-container { display: flex; align-items: center; gap: 15px; }
            .logo-img { width: 55px; height: 55px; object-fit: contain; }
            .company-name { color: #4f46e5; font-size: 22px; font-weight: 800; }
            .invoice-title { font-size: 24px; font-weight: 900; text-transform: uppercase; color: #1e293b; margin: 0; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .section-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 800; }
            td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .grand-total td { font-weight: 900; font-size: 18px; border-top: 2px solid #4f46e5; border-bottom: none; color: #1e293b; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; border: 1px solid currentColor; }
            .status-lunas { background: #ecfdf5; color: #059669; }
            .status-belum { background: #fffbeb; color: #d97706; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px; font-style: italic; }
            .payment-box { background: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; margin-top: 10px; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                ${appLogo ? `<img src="${appLogo}" class="logo-img" />` : ''}
                <div>
                  <div class="company-name">${companyName}</div>
                  <div style="font-size: 11px; color: #64748b; font-weight: 500;">${companyTagline}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div class="invoice-title">Invoice</div>
                <div style="font-size: 13px; font-weight: 600; color: #64748b;">#INV/${t.tahun}/${t.id.split('-').pop()?.toUpperCase()}</div>
              </div>
            </div>

            <div class="details">
              <div>
                <div class="section-title">Tagihan Kepada:</div>
                <div style="font-weight: 800; font-size: 16px; color: #1e293b;">${p?.nama}</div>
                <div style="font-size: 13px;">NIK: ${p?.nik}</div>
                <div style="font-size: 13px; max-width: 250px; color: #475569;">${p?.alamat}, RT ${p?.rt} / RW ${p?.rw}</div>
                <div style="font-size: 13px;">Telp: ${p?.telepon}</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Periode Tagihan:</div>
                <div style="font-size: 15px; font-weight: 800; color: #1e293b;">${t.bulan} ${t.tahun}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Tgl Cetak: ${new Date().toLocaleDateString('id-ID')}</div>
                <div style="margin-top: 12px;">
                  <span class="status-badge ${t.status === 'Lunas' ? 'status-lunas' : 'status-belum'}">
                    ${t.status}
                  </span>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th width="60%">Deskripsi Layanan</th>
                  <th style="text-align: center;">Kecepatan</th>
                  <th style="text-align: right;">Harga</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Layanan Internet - ${paket?.nama || 'Home Fiber'}</td>
                  <td style="text-align: center; font-weight: 600;">${paket?.kecepatan || '-'}</td>
                  <td style="text-align: right; font-weight: 600;">Rp ${subtotal.toLocaleString()}</td>
                </tr>
                ${totalDiskon > 0 ? `
                <tr style="color: #e11d48; font-style: italic;">
                  <td colspan="2" style="text-align: right; font-size: 12px;">Potongan Diskon</td>
                  <td style="text-align: right; font-weight: 600;">- Rp ${totalDiskon.toLocaleString()}</td>
                </tr>
                ` : ''}
                ${invoiceSettings.useVAT ? `
                <tr>
                  <td colspan="2" style="text-align: right; font-size: 12px; color: #64748b;">PPN (${invoiceSettings.vatPercent}%)</td>
                  <td style="text-align: right; font-weight: 600;">Rp ${ppnAmount.toLocaleString()}</td>
                </tr>
                ` : ''}
                ${carryOverAmount > 0 ? `
                <tr style="background: #fff1f2;">
                  <td colspan="2" style="text-align: right; font-size: 12px; font-weight: 800; color: #be123c;">Tunggakan Bulan Sebelumnya</td>
                  <td style="text-align: right; font-weight: 800; color: #be123c;">Rp ${carryOverAmount.toLocaleString()}</td>
                </tr>
                ` : ''}
              </tbody>
              <tfoot>
                <tr class="grand-total">
                  <td colspan="2" style="text-align: right;">Total Tagihan</td>
                  <td style="text-align: right; color: #4f46e5;">Rp ${grandTotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div class="payment-box">
              <div class="section-title">Instruksi Pembayaran:</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                  Silakan melakukan transfer ke rekening berikut:<br/>
                  Bank: <strong>${invoiceSettings.bankName}</strong><br/>
                  No. Rekening: <strong style="font-size: 16px; color: #1e293b; letter-spacing: 0.5px;">${invoiceSettings.bankAccount}</strong><br/>
                  Atas Nama: <strong>${invoiceSettings.bankHolder}</strong>
                </div>
                <div style="text-align: right; font-size: 11px; color: #94a3b8; max-width: 200px;">
                  *Simpan bukti transfer dan kirimkan ke Admin Penagihan untuk verifikasi manual jika status belum terupdate.
                </div>
              </div>
            </div>

            <div class="footer">
              "${invoiceSettings.footerMessage}"
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const columns = [
    { 
      header: 'Pelanggan', 
      accessor: (t: Tagihan) => {
        const p = customers.find(p => p.id === t.pelangganId);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{p?.nama || '-'}</span>
            <span className="text-[10px] text-slate-400 font-mono">NIK: {p?.nik || '-'}</span>
          </div>
        );
      }
    },
    { 
      header: 'Tagihan', 
      accessor: (t: Tagihan) => {
        const disc = t.diskon || 0;
        return (
          <div className="flex flex-col">
            <span className={`text-xs ${disc > 0 ? 'line-through text-slate-400' : 'font-bold text-indigo-600'}`}>
              Rp {t.jumlah.toLocaleString()}
            </span>
            {disc > 0 && (
              <span className="text-xs font-bold text-indigo-600">
                Rp {(t.jumlah - disc).toLocaleString()}
              </span>
            )}
            {disc > 0 && <span className="text-[9px] text-rose-500 font-bold italic">Disc: Rp {disc.toLocaleString()}</span>}
          </div>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: (t: Tagihan) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit ${
          t.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
        }`}>
          {t.status === 'Lunas' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {t.status}
        </span>
      )
    },
    { 
      header: 'Tgl Bayar', 
      accessor: (t: Tagihan) => t.tanggalBayar ? (
        <span className="text-xs text-slate-500 font-medium">{t.tanggalBayar}</span>
      ) : (
        <span className="text-xs text-slate-300 italic">Belum bayar</span>
      )
    },
    { 
      header: 'Aksi', 
      accessor: (t: Tagihan) => (
        <div className="flex gap-2 justify-end">
          {t.status === 'Belum Lunas' ? (
            <button 
              onClick={() => {
                setPaymentConfirmId(t.id);
                setDiscountAmount(0);
              }}
              className="px-4 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-100 uppercase"
            >
              Bayar
            </button>
          ) : (
            <button 
              onClick={() => handleCancelPayment(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-all active:scale-95 shadow-sm uppercase"
              title="Batalkan Status Lunas"
            >
              <RotateCcw size={12} />
              BATAL
            </button>
          )}
          <button 
            onClick={() => handlePrintInvoice(t)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            title="Cetak Invoice A4"
          >
            <Printer size={14} />
            <span>PRINT A4</span>
          </button>
        </div>
      )
    }
  ];

  const selectedBillToPay = paymentConfirmId ? bills.find(b => b.id === paymentConfirmId) : null;
  const selectedPelangganToPay = selectedBillToPay ? customers.find(p => p.id === selectedBillToPay.pelangganId) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setStatusFilter(statusFilter === 'Lunas' ? 'Semua' : 'Lunas')}
          className={`group flex items-center justify-between p-6 rounded-3xl border transition-all text-left ${
            statusFilter === 'Lunas' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${statusFilter === 'Lunas' ? 'bg-emerald-500/50' : 'bg-emerald-50 text-emerald-600'}`}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className={`text-sm font-medium ${statusFilter === 'Lunas' ? 'text-emerald-100' : 'text-slate-500'}`}>Tagihan Terbayar ({selectedMonth} {selectedYear})</p>
              <h4 className="text-2xl font-bold">Rp {stats.lunasTotal.toLocaleString()}</h4>
            </div>
          </div>
          <div className="text-right">
             <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusFilter === 'Lunas' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
               {stats.lunasCount} Transaksi
             </span>
          </div>
        </button>

        <button 
          onClick={() => setStatusFilter(statusFilter === 'Belum Lunas' ? 'Semua' : 'Belum Lunas')}
          className={`group flex items-center justify-between p-6 rounded-3xl border transition-all text-left ${
            statusFilter === 'Belum Lunas' ? 'bg-amber-500 border-amber-400 text-white shadow-xl shadow-amber-100' : 'bg-white border-slate-100 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${statusFilter === 'Belum Lunas' ? 'bg-amber-400/50' : 'bg-amber-50 text-amber-600'}`}>
              <AlertCircle size={24} />
            </div>
            <div>
              <p className={`text-sm font-medium ${statusFilter === 'Belum Lunas' ? 'text-amber-50' : 'text-slate-500'}`}>Piutang Berjalan ({selectedMonth} {selectedYear})</p>
              <h4 className="text-2xl font-bold">Rp {stats.pendingTotal.toLocaleString()}</h4>
            </div>
          </div>
          <div className="text-right">
             <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusFilter === 'Belum Lunas' ? 'bg-white/20' : 'bg-amber-50 text-amber-600'}`}>
               {stats.pendingCount} Pelanggan
             </span>
          </div>
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Calendar size={14} className="text-slate-400 ml-2" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
          <button 
            onClick={() => setIsManualOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all active:scale-95"
          >
            <UserPlus size={16} />
            Tagihan Manual
          </button>
          <button 
            onClick={() => setIsGenerateOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Zap size={16} className="fill-white" />
            Generate Masal
          </button>
        </div>
      </div>

      <DataTable 
        title={`Data Penagihan: ${selectedMonth} ${selectedYear}`} 
        data={filteredBills} 
        columns={columns} 
      />

      {paymentConfirmId && selectedBillToPay && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Pembayaran</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Pelanggan: <strong>{selectedPelangganToPay?.nama}</strong><br/>
                Tagihan: <strong>Rp {selectedBillToPay.jumlah.toLocaleString()}</strong>
              </p>
              
              <div className="mb-6 text-left">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                  <Tag size={12} /> Berikan Diskon / Potongan (Rp)
                </label>
                <input 
                  type="number" 
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-lg text-emerald-600"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setPaymentConfirmId(null);
                    setDiscountAmount(0);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={executePayment}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  Ya, Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GenerateBillingModal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} onGenerate={handleGenerate} customers={customers} existingBills={bills} />
      <ManualBillingModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} onGenerate={handleManualGenerate} customers={customers} existingBills={bills} />
    </div>
  );
};

export default BillingView;
