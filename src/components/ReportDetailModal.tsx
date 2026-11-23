import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CivicReport, ReportCategory } from "../domain/reports";
import { Colors, Radius, Shadow, Size, Spacing, Typography } from "../design/tokens";

interface ReportDetailModalProps {
  visible: boolean;
  report: CivicReport | null;
  distance: string;
  onClose: () => void;
  onFocusMap?: () => void;
}

export function ReportDetailModal({
  visible,
  report,
  distance,
  onClose,
  onFocusMap,
}: ReportDetailModalProps) {
  if (!report) return null;

  const status = report.status ?? "Sedang Ditangani";
  const statusColor =
    status === "Selesai"
      ? Colors.success
      : status === "Sedang Ditangani"
      ? Colors.warning
      : Colors.info;

  const statusBg =
    status === "Selesai"
      ? Colors.successSurface
      : status === "Sedang Ditangani"
      ? Colors.warningSurface
      : Colors.infoSurface;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.scrim}>
        <Pressable style={styles.scrimTouch} onPress={onClose} />
        <View style={styles.sheetContainer}>
          {/* Grab handle */}
          <View style={styles.handle} />

          {/* Sheet Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor:
                        report.category === "Jalan"
                          ? Colors.criticalSurface
                          : report.category === "Banjir"
                          ? Colors.infoSurface
                          : Colors.warningSurface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
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
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {status}
                  </Text>
                </View>
              </View>

              <Text style={styles.title}>{report.title}</Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Tutup rincian laporan"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Foto Bukti jika ada */}
            {report.photoUri ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: report.photoUri }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                <View style={styles.photoTag}>
                  <Text style={styles.photoTagText}>Bukti Foto Lapangan</Text>
                </View>
              </View>
            ) : null}

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Deskripsi &amp; Situasi Lapangan</Text>
              <Text style={styles.descText}>{report.description}</Text>
            </View>

            {/* Metadata Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Jarak dari Anda</Text>
                <Text style={[styles.infoVal, { color: Colors.primary, fontWeight: "700" }]}>
                  {distance}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Waktu Dilaporkan</Text>
                <Text style={styles.infoVal}>{report.reportedAt}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Tingkat Prioritas</Text>
                <Text
                  style={[
                    styles.infoVal,
                    {
                      color:
                        report.severity === "Tinggi"
                          ? Colors.critical
                          : report.severity === "Sedang"
                          ? Colors.warning
                          : Colors.textSecondary,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {report.severity}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Koordinat Spasial</Text>
                <Text style={styles.infoVal} numberOfLines={1}>
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </Text>
              </View>
            </View>

            {/* Alur Penanganan Tanggap Warga */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Progres Penanganan Dinas Terkait</Text>
              <View style={styles.timelineBox}>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineNode, styles.timelineNodeDone]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timelineTitle}>Laporan Diterima Sistem</Text>
                    <Text style={styles.timelineSub}>Terverifikasi oleh sensor spasial &amp; NIK warga</Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineNode,
                      status !== "Menunggu Verifikasi"
                        ? styles.timelineNodeDone
                        : styles.timelineNodePending,
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timelineTitle}>Disposisi Tim Lapangan</Text>
                    <Text style={styles.timelineSub}>Petugas teknis melakukan inspeksi ke lokasi</Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineNode,
                      status === "Selesai"
                        ? styles.timelineNodeDone
                        : styles.timelineNodePending,
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timelineTitle}>Perbaikan Tuntas</Text>
                    <Text style={styles.timelineSub}>Infrastruktur kembali aman &amp; berfungsi normal</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footerRow}>
            {onFocusMap ? (
              <Pressable
                style={styles.secondaryActionBtn}
                onPress={() => {
                  onClose();
                  onFocusMap();
                }}
              >
                <Text style={styles.secondaryActionText}>Fokuskan di Peta</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.primaryActionBtn} onPress={onClose}>
              <Text style={styles.primaryActionText}>Tutup Rincian</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(18, 76, 61, 0.45)",
    justifyContent: "flex-end",
  },
  scrimTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: "85%",
    ...Shadow.float,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.borderDefault,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    ...Typography.h2,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "700",
  },
  scrollBody: {
    marginVertical: Spacing.md,
  },
  photoContainer: {
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: "hidden",
    height: 180,
    backgroundColor: Colors.bgSubtle,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  photoTagText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  descText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoKey: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.borderDefault,
  },
  timelineBox: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineNodeDone: {
    backgroundColor: Colors.primary,
  },
  timelineNodePending: {
    backgroundColor: Colors.borderDefault,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.borderDefault,
    marginLeft: 5,
    marginVertical: 2,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  timelineSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
  primaryActionBtn: {
    flex: 1,
    height: Size.buttonHeight,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryActionBtn: {
    flex: 1,
    height: Size.buttonHeight,
    borderRadius: Radius.sm,
    backgroundColor: Colors.mintLight,
    borderWidth: 1,
    borderColor: Colors.sageSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
