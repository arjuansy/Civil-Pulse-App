import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CivicReport, ReportCategory } from "../domain/reports";
import { Colors, Radius, Spacing, Typography } from "../design/tokens";

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
      <View style={styles.iconBadge}>
        <Text style={styles.iconBadgeText}>PETA</Text>
      </View>
      <Text style={styles.webFallbackTitle}>Pratinjau Mode Web</Text>
      <Text style={styles.webFallbackDesc}>
        Engine native peta Google Maps (react-native-maps) dirancang untuk berjalan di lingkungan native{" "}
        <Text style={styles.bold}>Android &amp; iOS</Text> (Expo Go / Emulator).
      </Text>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionTitle}>
          Panduan Menjalankan di Perangkat Mobile:
        </Text>
        <Text style={styles.instructionStep}>1. Buka terminal proyek</Text>
        <Text style={styles.instructionStep}>
          2. Tekan <Text style={styles.bold}>a</Text> untuk meluncurkan di Android Emulator
        </Text>
        <Text style={styles.instructionStep}>
          3. Atau pindai QR Code via aplikasi <Text style={styles.bold}>Expo Go</Text> di smartphone fisik
        </Text>
      </View>

      <Text style={styles.chipsHeading}>Daftar Titik Laporan LBS Terdeteksi:</Text>
      <View style={styles.reportChips}>
        {reports.map((r) => {
          const isSelected = r.id === selectedReportId;
          const color = categoryColors[r.category];
          return (
            <Pressable
              key={r.id}
              onPress={() => onSelectReport(r.id)}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: color },
                isSelected && styles.chipSelected,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Pilih titik laporan ${r.title}`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
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
    padding: Spacing.xl,
    backgroundColor: Colors.bgSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.mintLight,
    borderWidth: 1,
    borderColor: Colors.sageSoft,
    marginBottom: Spacing.sm,
  },
  iconBadgeText: {
    ...Typography.label,
    color: Colors.primary,
  },
  webFallbackTitle: {
    ...Typography.h2,
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  webFallbackDesc: {
    ...Typography.caption,
    textAlign: "center",
    maxWidth: 440,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  instructionBox: {
    marginTop: Spacing.base,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    width: "100%",
    maxWidth: 380,
  },
  instructionTitle: {
    ...Typography.captionMedium,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  instructionStep: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  chipsHeading: {
    marginTop: Spacing.base,
    ...Typography.label,
    color: Colors.textSecondary,
  },
  reportChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: Colors.mintLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
