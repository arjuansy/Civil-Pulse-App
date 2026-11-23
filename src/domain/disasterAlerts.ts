export type AlertLevel = "Kritis" | "Waspada" | "Informasi";

export interface DisasterAlert {
  id: string;
  title: string;
  level: AlertLevel;
  category: "Banjir" | "Cuaca Ekstrem" | "Gempa & Longsor" | "Infrastruktur Kritis";
  location: string;
  timeAgo: string;
  source: string;
  summary: string;
  recommendedAction: string;
}

export const DISASTER_ALERTS: DisasterAlert[] = [
  {
    id: "alert-1",
    title: "Peningkatan Debit Air Sungai & Siaga Genangan",
    level: "Waspada",
    category: "Banjir",
    location: "Kec. Coblong & Sekitarnya (DAS Citarum)",
    timeAgo: "25 menit lalu",
    source: "BPBD & Dinas Sumber Daya Air",
    summary: "Hujan intensitas sedang-lebat terpantau di hulu. Pintu air mendekati batas normal atas (Siaga 3).",
    recommendedAction: "Amankan barang berharga ke lantai atas dan bersihkan saluran drainase lingkungan Anda.",
  },
  {
    id: "alert-2",
    title: "Peringatan Dini Cuaca Ekstrem & Angin Kencang",
    level: "Informasi",
    category: "Cuaca Ekstrem",
    location: "Wilayah Kota & Pinggiran",
    timeAgo: "1 jam lalu",
    source: "BMKG Stasiun Geofisika",
    summary: "Potensi angin kencang berdurasi singkat dan kilat petir antara pukul 14.00 - 18.00 WIB.",
    recommendedAction: "Hindari berteduh di bawah pohon rindang, baliho reklame, atau tiang listrik rentan.",
  },
  {
    id: "alert-3",
    title: "Jalur Alternatif: Perbaikan Tanggul Retak",
    level: "Informasi",
    category: "Infrastruktur Kritis",
    location: "Jl. Babakan Siliwangi",
    timeAgo: "3 jam lalu",
    source: "Dinas Bina Marga & Penataan Ruang",
    summary: "Petugas PU sedang melakukan perkuatan tanggul pengaman. Satu lajur ditutup sementara.",
    recommendedAction: "Gunakan jalur alternatif Jl. Dago atau Jl. Tamansari untuk menghindari kepadatan.",
  },
];
