export type ReportCategory = "Jalan" | "Banjir" | "Fasilitas";
export type ReportSeverity = "Tinggi" | "Sedang" | "Rendah";

export type CivicReport = {
  id: string;
  title: string;
  category: ReportCategory;
  severity: ReportSeverity;
  description: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
};

type DemoReport = Omit<CivicReport, "latitude" | "longitude"> & {
  northMeters: number;
  eastMeters: number;
};

const DEMO_REPORTS: DemoReport[] = [
  {
    id: "report-1",
    title: "Jalan berlubang",
    category: "Jalan",
    severity: "Tinggi",
    description: "Lubang cukup dalam di jalur kendaraan.",
    northMeters: 260,
    eastMeters: -180,
    reportedAt: "12 menit lalu",
  },
  {
    id: "report-2",
    title: "Genangan air",
    category: "Banjir",
    severity: "Sedang",
    description: "Genangan menutupi sebagian trotoar.",
    northMeters: -180,
    eastMeters: 300,
    reportedAt: "35 menit lalu",
  },
  {
    id: "report-3",
    title: "Lampu jalan mati",
    category: "Fasilitas",
    severity: "Rendah",
    description: "Lampu penerangan di sisi jalan tidak menyala.",
    northMeters: 430,
    eastMeters: 270,
    reportedAt: "1 jam lalu",
  },
  {
    id: "report-4",
    title: "Trotoar rusak",
    category: "Fasilitas",
    severity: "Sedang",
    description: "Permukaan trotoar retak dan tidak rata.",
    northMeters: -360,
    eastMeters: -240,
    reportedAt: "2 jam lalu",
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
