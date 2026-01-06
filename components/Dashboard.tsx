
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, UserPlus, DollarSign, Wallet, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Pelanggan, Tagihan } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface DashboardProps {
  customers: Pelanggan[];
  bills: Tagihan[];
}

const Dashboard: React.FC<DashboardProps> = ({ customers, bills }) => {
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  const activeCount = customers.filter(p => p.status === 'Aktif').length;
  const newThisMonth = customers.filter(p => p.tanggalDaftar.startsWith('2024-05')).length;
  const totalRevenue = bills.reduce((acc, curr) => acc + (curr.status === 'Lunas' ? curr.jumlah : 0), 0);
  const totalExpenses = 450000;

  const chartData = [
    { name: 'Jan', revenue: 1200000, users: 15 },
    { name: 'Feb', revenue: 1800000, users: 22 },
    { name: 'Mar', revenue: 1600000, users: 28 },
    { name: 'Apr', revenue: 2400000, users: 35 },
    { name: 'Mei', revenue: 3200000, users: activeCount },
  ];

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    const result = await getFinancialInsights(activeCount, newThisMonth, totalRevenue, totalExpenses);
    setInsight(result || "No data available");
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ringkasan Bisnis</h2>
          <p className="text-slate-500">Analisa performa ISP Anda hari ini.</p>
        </div>
        <button 
          onClick={handleGetInsight}
          disabled={loadingInsight}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          <BrainCircuit size={18} />
          {loadingInsight ? "Menganalisa..." : "AI Financial Insight"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pelanggan Aktif" 
          value={activeCount.toString()} 
          icon={Users} 
          color="bg-blue-500" 
          change="+12%" 
          isPositive={true}
        />
        <StatCard 
          title="Pelanggan Baru (Mei)" 
          value={newThisMonth.toString()} 
          icon={UserPlus} 
          color="bg-purple-500" 
          change="+5%" 
          isPositive={true}
        />
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
          change="+18%" 
          isPositive={true}
        />
        <StatCard 
          title="Total Pengeluaran" 
          value={`Rp ${totalExpenses.toLocaleString()}`} 
          icon={Wallet} 
          color="bg-rose-500" 
          change="-2%" 
          isPositive={false}
        />
      </div>

      {insight && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-indigo-200">
             <BrainCircuit size={64} />
          </div>
          <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
             AI Financial Insight
          </h3>
          <div className="text-indigo-800 prose prose-indigo max-w-none">
            {insight.split('\n').map((line, i) => (
              <p key={i} className="mb-1 text-sm">{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Pertumbuhan Pendapatan</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Pertumbuhan Pelanggan</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: any; color: string; change: string; isPositive: boolean }> = ({ title, value, icon: Icon, color, change, isPositive }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {change}
      </div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
  </div>
);

export default Dashboard;
