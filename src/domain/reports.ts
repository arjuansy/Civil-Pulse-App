export type ReportCategory = "Jalan" | "Banjir" | "Fasilitas";
export type ReportSeverity = "Tinggi" | "Sedang" | "Rendah";
export type ReportStatus = "Menunggu Verifikasi" | "Sedang Ditangani" | "Selesai";

export type CivicReport = {
  id: string;
  title: string;
  category: ReportCategory;
  severity: ReportSeverity;
  description: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  status?: ReportStatus;
  photoUri?: string;
  reporterNik?: string;
};

type DemoReport = Omit<CivicReport, "latitude" | "longitude"> & {
  northMeters: number;
  eastMeters: number;
};

const DEMO_REPORTS: DemoReport[] = [
  {
    id: "report-1",
    title: "Jalan berlubang cukup parah",
    category: "Jalan",
    severity: "Tinggi",
    description: "Lubang jalan sedalam ±15 cm membahayakan pengendara roda dua, terutama saat malam hari.",
    northMeters: 260,
    eastMeters: -180,
    reportedAt: "12 menit lalu",
    status: "Sedang Ditangani",
  },
  {
    id: "report-2",
    title: "Genangan air setinggi trotoar",
    category: "Banjir",
    severity: "Sedang",
    description: "Genangan air menutupi sebagian lajur jalan akibat sumbatan sampah pada mulut gorong-gorong.",
    northMeters: -180,
    eastMeters: 300,
    reportedAt: "35 menit lalu",
    status: "Menunggu Verifikasi",
  },
  {
    id: "report-3",
    title: "Penerangan jalan umum (PJU) mati",
    category: "Fasilitas",
    severity: "Rendah",
    description: "Dua tiang lampu penerangan jalan di sisi barat padam sejak kemarin malam.",
    northMeters: 430,
    eastMeters: 270,
    reportedAt: "1 jam lalu",
    status: "Selesai",
  },
  {
    id: "report-4",
    title: "Trotoar pedestrian amblas & retak",
    category: "Fasilitas",
    severity: "Sedang",
    description: "Paving block amblas sepanjang 3 meter, menyulitkan pejalan kaki dan penyandang disabilitas.",
    northMeters: -360,
    eastMeters: -240,
    reportedAt: "2 jam lalu",
    status: "Sedang Ditangani",
  },
];

export function createDemoReports(
  center: { latitude: number; longitude: number },
): CivicReport[] {
  const latitudeMeters = 111_320;
  const longitudeMeters =
    latitudeMeters * Math.cos((center.latitude * Math.PI) / 180);

  return DEMO_REPORTS.map(({ northMeters, eastMeters, ...report }) => ({
    ...report,
    latitude: center.latitude + northMeters / latitudeMeters,
    longitude: center.longitude + eastMeters / longitudeMeters,
  }));
}
