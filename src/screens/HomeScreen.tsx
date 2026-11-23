import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CivicReport, ReportCategory } from "../domain/reports";
import { DISASTER_ALERTS, DisasterAlert } from "../domain/disasterAlerts";
import { CivicUserSession } from "../storage/secureStore";
import { Colors, Radius, Shadow, Spacing, Typography } from "../design/tokens";

interface HomeScreenProps {
  reports: CivicReport[];
  activeSession: CivicUserSession | null;
  onOpenNewReport: () => void;
  onNavigateToMap: (reportId?: string) => void;
  onNavigateToAlerts: () => void;
  onSelectReportDetail: (report: CivicReport) => void;
  getDistanceStr: (report: CivicReport) => string;
}

export function HomeScreen({
  reports,
  activeSession,
  onOpenNewReport,
  onNavigateToMap,
  onNavigateToAlerts,
  onSelectReportDetail,
  getDistanceStr,
}: HomeScreenProps) {
  // Statistics computed from actual data
  const totalReports = reports.length;
  const inProgressReports = reports.filter((r) => r.status === "Sedang Ditangani").length;
  const resolvedReports = reports.filter((r) => r.status === "Selesai").length;
  const pendingReports = reports.filter((r) => r.status === "Menunggu Verifikasi").length;

  const latestAlert = DISASTER_ALERTS[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 1. GREETING & PROFILE ACCESS ────────────────────────────── */}
      <View style={styles.greetingCard}>
        <View style={styles.greetingLeft}>
          <Text style={styles.greetingSub}>Civic Pulse · SDG 11 Kota Berkelanjutan</Text>
          <Text style={styles.greetingName}>
            {activeSession ? `Halo, ${activeSession.namaLengkap}` : "Halo, Warga Peduli Kota"}
          </Text>
          <Text style={styles.greetingDesc}>
            {activeSession
              ? `NIK terverifikasi: ${activeSession.nik.slice(0, 6)}******`
              : "Masuk untuk mencatat rekam jejak laporan partisipatif Anda"}
          </Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {activeSession ? "CP" : "W"}
          </Text>
        </View>
      </View>

      {/* ── 2. ENVIRONMENTAL / CITY OVERVIEW (SDG 11) ───────────────── */}
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Ringkasan Pantauan Kota</Text>
        <Text style={styles.sectionSubtitle}>
          Data agregat infrastruktur &amp; mitigasi bencana terkini
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalReports}</Text>
            <Text style={styles.statLabel}>Total Laporan</Text>
            <Text style={styles.statSub}>di sekitar Anda</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.warning }]}>
              {inProgressReports}
            </Text>
            <Text style={styles.statLabel}>Ditangani</Text>
            <Text style={styles.statSub}>disposisi teknis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>
              {resolvedReports}
            </Text>
            <Text style={styles.statLabel}>Tuntas</Text>
            <Text style={styles.statSub}>diperbaiki</Text>
          </View>
        </View>
      </View>

      {/* ── 3. PRIMARY ACTIONS ──────────────────────────────────────── */}
      <View style={styles.actionsSection}>
        <Pressable
          style={styles.primaryActionHero}
          onPress={onOpenNewReport}
          accessibilityRole="button"
          accessibilityLabel="Laporkan kerusakan infrastruktur baru"
        >
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>PARTISIPASI WARGA</Text>
            </View>
            <Text style={styles.heroTitle}>Lapor Kerusakan Baru</Text>
            <Text style={styles.heroDesc}>
              Kamera aktif dengan bukti foto geotagging &amp; koordinat akurat
            </Text>
          </View>
          <View style={styles.heroIconCircle}>
            <Text style={styles.heroIconText}>📸</Text>
          </View>
        </Pressable>

        <View style={styles.secondaryActionsRow}>
          <Pressable
            style={styles.actionTile}
            onPress={() => onNavigateToMap()}
            accessibilityRole="button"
          >
            <View style={styles.actionTileIconWrap}>
              <Text style={styles.actionTileIcon}>🗺️</Text>
            </View>
            <Text style={styles.actionTileTitle}>Peta Spasial</Text>
            <Text style={styles.actionTileDesc}>Pantau sebaran titik kerusakan</Text>
          </Pressable>

          <Pressable
            style={styles.actionTile}
            onPress={onNavigateToAlerts}
            accessibilityRole="button"
          >
            <View style={[styles.actionTileIconWrap, { backgroundColor: Colors.warningSurface }]}>
              <Text style={styles.actionTileIcon}>🚨</Text>
            </View>
            <Text style={styles.actionTileTitle}>Siaga Bencana</Text>
            <Text style={styles.actionTileDesc}>Peringatan dini BMKG &amp; BPBD</Text>
          </Pressable>
        </View>
      </View>

      {/* ── 4. DISASTER AWARENESS HIGHLIGHT BANNER ───────────────────── */}
      {latestAlert ? (
        <Pressable
          style={styles.alertBanner}
          onPress={onNavigateToAlerts}
          accessibilityRole="button"
        >
          <View style={styles.alertBannerHeader}>
            <View style={styles.alertPill}>
              <Text style={styles.alertPillText}>{latestAlert.level.toUpperCase()}</Text>
            </View>
            <Text style={styles.alertTime}>{latestAlert.timeAgo}</Text>
          </View>
          <Text style={styles.alertTitle}>{latestAlert.title}</Text>
          <Text style={styles.alertSummary} numberOfLines={2}>
            {latestAlert.summary}
          </Text>
          <View style={styles.alertActionRow}>
            <Text style={styles.alertActionLink}>Lihat Panduan Mitigasi Lengkap →</Text>
          </View>
        </Pressable>
      ) : null}

      {/* ── 5. RECENT COMMUNITY REPORTS ─────────────────────────────── */}
      <View style={styles.reportsSection}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Laporan Warga Terkini</Text>
            <Text style={styles.sectionSubtitle}>
              Transparansi status perbaikan infrastruktur publik
            </Text>
          </View>
          <Pressable onPress={() => onNavigateToMap()}>
            <Text style={styles.viewAllText}>Buka di Peta →</Text>
          </Pressable>
        </View>

        <View style={styles.reportsList}>
          {reports.map((report) => {
            const distance = getDistanceStr(report);
            const status = report.status ?? "Sedang Ditangani";
            return (
              <Pressable
                key={report.id}
                style={styles.reportListItem}
                onPress={() => onSelectReportDetail(report)}
                accessibilityRole="button"
                accessibilityLabel={`Laporan ${report.title}`}
              >
                <View
                  style={[
                    styles.reportCategoryBar,
                    {
                      backgroundColor:
                        report.category === "Jalan"
                          ? Colors.critical
                          : report.category === "Banjir"
                          ? Colors.info
                          : Colors.warning,
                    },
                  ]}
                />
                <View style={styles.reportItemBody}>
                  <View style={styles.reportItemTop}>
                    <Text
                      style={[
                        styles.reportItemCat,
                        {
                          color:
                            report.category === "Jalan"
                              ? Colors.critical
                              : report.category === "Banjir"
                              ? Colors.info
                              : Colors.warning,
                        },
                      ]}
                    >
                      {report.category.toUpperCase()}
                    </Text>
                    <Text style={styles.reportItemTime}>{report.reportedAt}</Text>
                  </View>

                  <Text style={styles.reportItemTitle} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <Text style={styles.reportItemDesc} numberOfLines={1}>
                    {report.description}
                  </Text>

                  <View style={styles.reportItemBottom}>
                    <View style={styles.reportStatusChip}>
                      <Text style={styles.reportStatusText}>{status}</Text>
                    </View>
                    <Text style={styles.reportItemDist}>{distance}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl + 24,
  },
  greetingCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadow.card,
  },
  greetingLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.sageSoft,
    letterSpacing: 0.6,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textInverse,
    marginTop: 4,
  },
  greetingDesc: {
    fontSize: 11,
    color: Colors.mintLight,
    marginTop: 2,
    lineHeight: 15,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.sageSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: "800",
  },
  overviewSection: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...Shadow.card,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 16,
  },
  sectionSubtitle: {
    ...Typography.caption,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  actionsSection: {
    gap: Spacing.sm,
  },
  primaryActionHero: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadow.card,
  },
  heroLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginBottom: 6,
  },
  heroBadgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textInverse,
  },
  heroDesc: {
    fontSize: 11,
    color: Colors.mintLight,
    marginTop: 3,
    lineHeight: 16,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconText: {
    fontSize: 22,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionTile: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...Shadow.card,
  },
  actionTileIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.mintLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionTileIcon: {
    fontSize: 18,
  },
  actionTileTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  actionTileDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  alertBanner: {
    backgroundColor: Colors.warningSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
  },
  alertBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  alertPill: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  alertPillText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  alertTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  alertSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  alertActionRow: {
    marginTop: 8,
  },
  alertActionLink: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.warning,
  },
  reportsSection: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  reportsList: {
    gap: Spacing.sm,
  },
  reportListItem: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    flexDirection: "row",
    overflow: "hidden",
    ...Shadow.card,
  },
  reportCategoryBar: {
    width: 5,
  },
  reportItemBody: {
    flex: 1,
    padding: Spacing.md,
  },
  reportItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportItemCat: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  reportItemTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  reportItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  reportItemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reportItemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  reportStatusChip: {
    backgroundColor: Colors.bgSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  reportStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  reportItemDist: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
});
