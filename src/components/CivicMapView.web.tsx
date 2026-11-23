import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CivicReport, ReportCategory } from "../domain/reports";

export interface CivicMapViewProps {
  mapRef: React.RefObject<any>;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isTracking: boolean;
  reports: CivicReport[];
  selectedReportId: string;
  onSelectReport: (reportId: string) => void;
  categoryColors: Record<ReportCategory, string>;
}

export function CivicMapView({
  reports,
  selectedReportId,
  onSelectReport,
  categoryColors,
}: CivicMapViewProps) {
  return (
    <View style={styles.webFallbackContainer}>
      <Text style={styles.webFallbackIcon}>🗺️</Text>
      <Text style={styles.webFallbackTitle}>Mode Tampilan Web</Text>
      <Text style={styles.webFallbackDesc}>
        Pustaka native Google Maps (react-native-maps) hanya berjalan di perangkat{" "}
        <Text style={styles.bold}>Android & iOS</Text> (Expo Go / Emulator).
      </Text>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionTitle}>
          📱 Cara Menjalankan di Perangkat Mobile:
        </Text>
        <Text style={styles.instructionStep}>1. Buka terminal proyek di VS Code</Text>
        <Text style={styles.instructionStep}>
          2. Tekan tombol <Text style={styles.bold}>a</Text> untuk membuka di Android Emulator
        </Text>
        <Text style={styles.instructionStep}>
          3. Atau scan QR Code di terminal dengan aplikasi{" "}
          <Text style={styles.bold}>Expo Go</Text> di smartphone Anda
        </Text>
      </View>

      <Text style={styles.chipsHeading}>Daftar Titik Laporan LBS:</Text>
      <View style={styles.reportChips}>
        {reports.map((r) => {
          const isSelected = r.id === selectedReportId;
          return (
            <Pressable
              key={r.id}
              onPress={() => onSelectReport(r.id)}
              style={[
                styles.chip,
                { borderColor: categoryColors[r.category] },
                isSelected && styles.chipSelected,
              ]}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#243d38",
                }}
              >
                {r.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webFallbackContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e8edea",
    alignItems: "center",
    justifyContent: "center",
  },
  webFallbackIcon: {
    fontSize: 38,
    marginBottom: 6,
  },
  webFallbackTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#173a35",
    marginBottom: 4,
  },
  webFallbackDesc: {
    fontSize: 12,
    color: "#5f716d",
    textAlign: "center",
    maxWidth: 440,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
    color: "#173a35",
  },
  instructionBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cfe0d9",
    width: "100%",
    maxWidth: 380,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#137c68",
    marginBottom: 6,
  },
  instructionStep: {
    fontSize: 11,
    color: "#3f5450",
    lineHeight: 18,
  },
  chipsHeading: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: "700",
    color: "#5c706c",
  },
  reportChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: "#d4ece3",
  },
});
