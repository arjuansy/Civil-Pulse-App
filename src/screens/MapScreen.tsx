import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CivicReport, ReportCategory } from "../domain/reports";
import { CivicMapView } from "../components/CivicMapView";
import { Colors, Radius, Shadow, Size, Spacing, Typography } from "../design/tokens";

interface MapScreenProps {
  mapRef: React.RefObject<any>;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  reports: CivicReport[];
  selectedReportId: string;
  onSelectReport: (reportId: string) => void;
  categoryColors: Record<ReportCategory, string>;
  isTracking: boolean;
  distanceInterval: number;
  onToggleTracking: () => void;
  onFocusReport: (report: CivicReport) => void;
  onOpenReportDetail: (report: CivicReport) => void;
  getDistanceStr: (report: CivicReport) => string;
}

type FilterCategory = "Semua" | ReportCategory;

export function MapScreen({
  mapRef,
  initialRegion,
  reports,
  selectedReportId,
  onSelectReport,
  categoryColors,
  isTracking,
  distanceInterval,
  onToggleTracking,
  onFocusReport,
  onOpenReportDetail,
  getDistanceStr,
}: MapScreenProps) {
  const [filter, setFilter] = useState<FilterCategory>("Semua");

  const filteredReports = filter === "Semua"
    ? reports
    : reports.filter((r) => r.category === filter);

  const selectedReport =
    reports.find((r) => r.id === selectedReportId) ?? filteredReports[0] ?? reports[0];

  return (
    <View style={styles.container}>
      {/* ── Filter Bar Over Map ──────────────────────────────────────── */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(["Semua", "Jalan", "Banjir", "Fasilitas"] as FilterCategory[]).map((cat) => {
            const isSelected = filter === cat;
            return (
              <Pressable
                key={cat}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
                onPress={() => setFilter(cat)}
                accessibilityRole="button"
                accessibilityLabel={`Filter kategori ${cat}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {cat === "Semua" ? "Semua Titik" : cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Interactive Map ─────────────────────────────────────────── */}
      <View style={styles.mapWrap}>
        <CivicMapView
          mapRef={mapRef}
          initialRegion={initialRegion}
          isTracking={isTracking}
          reports={filteredReports}
          selectedReportId={selectedReportId}
          onSelectReport={(id) => {
            onSelectReport(id);
            const found = reports.find((r) => r.id === id);
            if (found) onFocusReport(found);
          }}
          categoryColors={categoryColors}
        />

        {/* Floating Tracking FAB */}
        <Pressable
          style={[
            styles.trackingFab,
            isTracking && styles.trackingFabActive,
          ]}
          onPress={onToggleTracking}
          accessibilityRole="button"
          accessibilityLabel={isTracking ? "Hentikan GPS" : "Aktifkan pelacakan GPS"}
        >
          <Text style={[styles.trackingFabIcon, isTracking && styles.trackingFabIconActive]}>
            {isTracking ? "■" : "◎"}
          </Text>
          <Text style={[styles.trackingFabText, isTracking && styles.trackingFabTextActive]}>
            {isTracking ? `${distanceInterval}m` : "GPS"}
          </Text>
        </Pressable>
      </View>

      {/* ── Selected Report Bottom Card ─────────────────────────────── */}
      {selectedReport ? (
        <View style={styles.bottomCard}>
          <View style={styles.bottomCardHeader}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.catBadge,
                  {
                    backgroundColor:
                      selectedReport.category === "Jalan"
                        ? Colors.criticalSurface
                        : selectedReport.category === "Banjir"
                        ? Colors.infoSurface
                        : Colors.warningSurface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catBadgeText,
                    {
                      color:
                        selectedReport.category === "Jalan"
                          ? Colors.critical
                          : selectedReport.category === "Banjir"
                          ? Colors.info
                          : Colors.warning,
                    },
                  ]}
                >
                  {selectedReport.category.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.timeText}>{selectedReport.reportedAt}</Text>
            </View>
            <Text style={styles.distText}>{getDistanceStr(selectedReport)}</Text>
          </View>

          <Text style={styles.bottomCardTitle} numberOfLines={1}>
            {selectedReport.title}
          </Text>
          <Text style={styles.bottomCardDesc} numberOfLines={2}>
            {selectedReport.description}
          </Text>

          <View style={styles.bottomCardActions}>
            <Pressable
              style={styles.detailButton}
              onPress={() => onOpenReportDetail(selectedReport)}
              accessibilityRole="button"
            >
              <Text style={styles.detailButtonText}>Lihat Rincian Laporan Lengkap →</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  filterBar: {
    backgroundColor: Colors.bgSurface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    zIndex: 10,
  },
  filterScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterChipTextSelected: {
    color: Colors.textInverse,
    fontWeight: "700",
  },
  mapWrap: {
    flex: 1,
    position: "relative",
  },
  trackingFab: {
    position: "absolute",
    right: Spacing.base,
    top: Spacing.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...Shadow.float,
  },
  trackingFabActive: {
    backgroundColor: Colors.primary,
  },
  trackingFabIcon: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "800",
  },
  trackingFabIconActive: {
    color: Colors.textInverse,
  },
  trackingFabText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
  },
  trackingFabTextActive: {
    color: Colors.textInverse,
  },
  bottomCard: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    ...Shadow.float,
  },
  bottomCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  distText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  bottomCardTitle: {
    ...Typography.h3,
    fontSize: 15,
  },
  bottomCardDesc: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  bottomCardActions: {
    marginTop: Spacing.md,
  },
  detailButton: {
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.mintLight,
    borderWidth: 1,
    borderColor: Colors.sageSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
