
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const getFinancialInsights = async (
  activeCustomers: number,
  newCustomers: number,
  totalRevenue: number,
  totalExpenses: number
) => {
  try {
    // Correct initialization using process.env.API_KEY directly as required.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analisa kondisi keuangan bisnis ISP skala kecil dengan data berikut:
    - Jumlah Pelanggan Aktif: ${activeCustomers}
    - Pelanggan Baru Bulan Ini: ${newCustomers}
    - Total Pendapatan: Rp ${totalRevenue.toLocaleString()}
    - Total Pengeluaran: Rp ${totalExpenses.toLocaleString()}
    
    Berikan kesimpulan singkat dalam 3 poin tentang kesehatan bisnis dan 1 saran strategis. Gunakan Bahasa Indonesia yang profesional.`;

    // Ensure model selection aligns with task complexity and typing is explicit.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access the .text property directly instead of calling a method.
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "Gagal memuat insight AI. Silakan coba lagi nanti.";
  }
};
