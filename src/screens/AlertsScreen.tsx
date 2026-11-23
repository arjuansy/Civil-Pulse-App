import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DISASTER_ALERTS, DisasterAlert, AlertLevel } from "../domain/disasterAlerts";
import { Colors, Radius, Shadow, Spacing, Typography } from "../design/tokens";

export function AlertsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<"Semua" | AlertLevel>("Semua");

  const filteredAlerts = selectedFilter === "Semua"
    ? DISASTER_ALERTS
    : DISASTER_ALERTS.filter((a) => a.level === selectedFilter);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Banner Header ────────────────────────────────────────────── */}
      <View style={styles.headerNotice}>
        <View style={styles.headerNoticeTop}>
          <View style={styles.badgeSource}>
            <Text style={styles.badgeSourceText}>SUMBER RESMI TERINTEGRASI</Text>
          </View>
        </View>
        <Text style={styles.headerNoticeTitle}>
          Pusat Informasi &amp; Peringatan Dini Bencana
        </Text>
        <Text style={styles.headerNoticeDesc}>
          Pantauan mitigasi bencana berbasis komunitas untuk mendukung target{" "}
          <Text style={{ fontWeight: "700" }}>SDG 11.5</Text> (pengurangan risiko bencana perkotaan).
        </Text>
      </View>

      {/* ── Filter Pills ─────────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {(["Semua", "Waspada", "Informasi"] as ("Semua" | AlertLevel)[]).map((lvl) => {
          const isSelected = selectedFilter === lvl;
          return (
            <Pressable
              key={lvl}
              style={[
                styles.filterPill,
                isSelected && styles.filterPillSelected,
              ]}
              onPress={() => setSelectedFilter(lvl)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextSelected,
                ]}
              >
                {lvl}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Alerts List ──────────────────────────────────────────────── */}
      <View style={styles.alertsList}>
        {filteredAlerts.map((alert) => {
          const isCritical = alert.level === "Kritis";
          const isWarning = alert.level === "Waspada";

          const levelColor = isCritical
            ? Colors.critical
            : isWarning
            ? Colors.warning
            : Colors.info;

          const levelBg = isCritical
            ? Colors.criticalSurface
            : isWarning
            ? Colors.warningSurface
            : Colors.infoSurface;

          const levelBorder = isCritical
            ? Colors.criticalBorder
            : isWarning
            ? Colors.warningBorder
            : Colors.infoBorder;

          return (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                { borderColor: levelBorder },
              ]}
            >
              {/* Card Top */}
              <View style={styles.alertCardTop}>
                <View style={[styles.levelBadge, { backgroundColor: levelBg }]}>
                  <Text style={[styles.levelBadgeText, { color: levelColor }]}>
                    {alert.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.alertTimestamp}>{alert.timeAgo}</Text>
              </View>

              <Text style={styles.alertCardTitle}>{alert.title}</Text>

              {/* Source & Location meta */}
              <View style={styles.metaRow}>
                <Text style={styles.metaItem}>📍 {alert.location}</Text>
                <Text style={styles.metaItem}>🏛️ {alert.source}</Text>
              </View>

              <Text style={styles.alertCardSummary}>{alert.summary}</Text>

              {/* Actionable guidance box */}
              <View style={styles.actionGuideBox}>
                <Text style={styles.actionGuideTitle}>Langkah Mitigasi Mandiri Warga:</Text>
                <Text style={styles.actionGuideText}>{alert.recommendedAction}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Emergency Call Contact Guide ─────────────────────────────── */}
      <View style={styles.emergencyCard}>
        <Text style={styles.emergencyTitle}>Panggilan Darurat Kota</Text>
        <Text style={styles.emergencyDesc}>
          Jika Anda menghadapi kondisi darurat infrastruktur atau ancaman keselamatan jiwa:
        </Text>
        <View style={styles.emergencyNumbers}>
          <View style={styles.emergencyItem}>
            <Text style={styles.emergencyNum}>112</Text>
            <Text style={styles.emergencyLabel}>Layanan Darurat Terpadu</Text>
          </View>
          <View style={styles.emergencyItem}>
            <Text style={styles.emergencyNum}>113</Text>
            <Text style={styles.emergencyLabel}>Dinas Pemadam &amp; Penyelamatan</Text>
          </View>
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
    gap: Spacing.base,
    paddingBottom: Spacing.xxl + 24,
  },
  headerNotice: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.card,
  },
  headerNoticeTop: {
    flexDirection: "row",
    marginBottom: 6,
  },
  badgeSource: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeSourceText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  headerNoticeTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textInverse,
  },
  headerNoticeDesc: {
    fontSize: 12,
    color: Colors.mintLight,
    marginTop: 4,
    lineHeight: 17,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  filterPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterPillTextSelected: {
    color: Colors.textInverse,
    fontWeight: "700",
  },
  alertsList: {
    gap: Spacing.md,
  },
  alertCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    ...Shadow.card,
  },
  alertCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  alertTimestamp: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  alertCardTitle: {
    ...Typography.h3,
    fontSize: 15,
  },
  metaRow: {
    flexDirection: "column",
    gap: 3,
    marginTop: 6,
    marginBottom: 8,
  },
  metaItem: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  alertCardSummary: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  actionGuideBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  actionGuideTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  actionGuideText: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  emergencyCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  emergencyDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  emergencyNumbers: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  emergencyItem: {
    flex: 1,
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  emergencyNum: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.critical,
  },
  emergencyLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
});
