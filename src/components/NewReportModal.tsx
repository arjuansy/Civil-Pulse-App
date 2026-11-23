import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CivicReport, ReportCategory, ReportSeverity } from "../domain/reports";
import { saveReportFile } from "../storage/reportFileManager";
import { Colors, Radius, Shadow, Size, Spacing, Typography } from "../design/tokens";

interface NewReportModalProps {
  visible: boolean;
  userCoords: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onOpenLiveCamera: () => void;
  capturedPhotoUri: string | null;
  onReportCreated: (newReport: CivicReport) => void;
}

const CATEGORIES: { key: ReportCategory; label: string; desc: string }[] = [
  { key: "Jalan", label: "Jalan & Drainase", desc: "Jalan berlubang, gorong-gorong tersumbat" },
  { key: "Banjir", label: "Banjir & Genangan", desc: "Luapan air sungai, genangan tinggi" },
  { key: "Fasilitas", label: "Fasilitas Publik", desc: "PJU padam, trotoar amblas, taman rusak" },
];

const SEVERITIES: { key: ReportSeverity; label: string }[] = [
  { key: "Rendah", label: "Rendah" },
  { key: "Sedang", label: "Sedang" },
  { key: "Tinggi", label: "Tinggi (Darurat)" },
];

export function NewReportModal({
  visible,
  userCoords,
  onClose,
  onOpenLiveCamera,
  capturedPhotoUri,
  onReportCreated,
}: NewReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>("Jalan");
  const [severity, setSeverity] = useState<ReportSeverity>("Sedang");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Data Belum Lengkap", "Harap isi judul laporan secara singkat.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Data Belum Lengkap", "Harap berikan deskripsi kondisi lapangan.");
      return;
    }

    try {
      setIsSubmitting(true);
      const reportId = `lapor-${Date.now()}`;
      const lat = userCoords?.latitude ?? -6.9175;
      const lng = userCoords?.longitude ?? 107.6191;

      const reportObject: CivicReport = {
        id: reportId,
        title: title.trim(),
        category,
        severity,
        description: description.trim(),
        latitude: lat,
        longitude: lng,
        reportedAt: "Baru saja",
        status: "Menunggu Verifikasi",
        photoUri: capturedPhotoUri ?? undefined,
      };

      // Simpan ke sandbox FileSystem sebagai bukti offline
      const fileName = `laporan_${reportId}.json`;
      await saveReportFile(fileName, JSON.stringify(reportObject, null, 2));

      Alert.alert(
        "Laporan Berhasil Dikirim!",
        "Laporan infrastruktur telah terdaftar, disimpan ke sandbox lokal, dan diteruskan ke tim dinas terkait.",
      );

      onReportCreated(reportObject);
      // Reset form
      setTitle("");
      setDescription("");
      onClose();
    } catch {
      Alert.alert("Gagal Mengirim", "Terjadi kesalahan saat menyimpan berkas laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Buat Laporan Baru</Text>
            <Text style={styles.headerSubtitle}>SDG 11: Infrastruktur Kota Berkelanjutan</Text>
          </View>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Batal buat laporan"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Langkah 1: Kategori */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>1. PILIH KATEGORI KERUSAKAN</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => setCategory(cat.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.radioRow}>
                      <View
                        style={[
                          styles.radioDot,
                          isSelected && styles.radioDotSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.categoryName,
                          isSelected && styles.categoryNameSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </View>
                    <Text style={styles.categoryDesc}>{cat.desc}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Langkah 2: Bukti Foto Kamera */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>2. FOTO BUKTI LAPANGAN</Text>
            {capturedPhotoUri ? (
              <View style={styles.photoPreviewBox}>
                <Image
                  source={{ uri: capturedPhotoUri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
                <View style={styles.photoOverlayBadge}>
                  <Text style={styles.photoOverlayText}>Watermark Spasial Aktif</Text>
                </View>
                <Pressable
                  style={styles.retakeBtn}
                  onPress={onOpenLiveCamera}
                  accessibilityRole="button"
                >
                  <Text style={styles.retakeBtnText}>Ambil Ulang Foto</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.cameraTriggerBox}
                onPress={onOpenLiveCamera}
                accessibilityRole="button"
                accessibilityLabel="Buka kamera untuk mengambil foto bukti"
              >
                <View style={styles.cameraIconCircle}>
                  <Text style={styles.cameraIconText}>📸</Text>
                </View>
                <Text style={styles.cameraTriggerTitle}>Buka Kamera Perangkat</Text>
                <Text style={styles.cameraTriggerSub}>
                  Ambil foto langsung di lokasi kerusakan untuk verifikasi otomatis
                </Text>
              </Pressable>
            )}
          </View>

          {/* Langkah 3: Konfirmasi Lokasi GPS */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>3. KOORDINAT LOKASI SPASIAL</Text>
            <View style={styles.locationConfirmBox}>
              <View style={styles.locationIconWrap}>
                <Text style={styles.locationIconText}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>
                  {userCoords ? "Koordinat GPS Terkunci" : "Menggunakan Koordinat Kota Default"}
                </Text>
                <Text style={styles.locationCoords}>
                  Lat: {userCoords?.latitude.toFixed(5) ?? "-6.91750"}, Lng:{" "}
                  {userCoords?.longitude.toFixed(5) ?? "107.61910"}
                </Text>
              </View>
            </View>
          </View>

          {/* Langkah 4: Rincian & Prioritas */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>4. DETAIL LAPORAN</Text>
            <Text style={styles.inputLabel}>Judul Laporan Singkat</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Aspal amblas depan halte bus"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Deskripsi Kondisi</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Jelaskan dampak kerusakan, ukuran lubang, atau potensi bahaya..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.inputLabel}>Tingkat Urgensi / Prioritas</Text>
            <View style={styles.severityRow}>
              {SEVERITIES.map((s) => {
                const isSelected = severity === s.key;
                return (
                  <Pressable
                    key={s.key}
                    style={[
                      styles.severityChip,
                      isSelected && styles.severityChipSelected,
                    ]}
                    onPress={() => setSeverity(s.key)}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        isSelected && styles.severityTextSelected,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Submit Bar */}
        <View style={styles.submitBar}>
          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Menyimpan ke Sandbox..." : "Kirim Laporan Resmi"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  header: {
    height: 64,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 17,
  },
  headerSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.primary,
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
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  scrollContent: {
    flex: 1,
    padding: Spacing.base,
  },
  formSection: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...Shadow.card,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    gap: Spacing.sm,
  },
  categoryCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.bgSubtle,
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.mintLight,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 2,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  radioDotSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  categoryNameSelected: {
    color: Colors.primaryDark,
  },
  categoryDesc: {
    ...Typography.caption,
    paddingLeft: 24,
    marginTop: 2,
  },
  cameraTriggerBox: {
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    borderStyle: "dashed",
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: "center",
    backgroundColor: Colors.bgSubtle,
  },
  cameraIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.mintLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  cameraIconText: {
    fontSize: 24,
  },
  cameraTriggerTitle: {
    ...Typography.h3,
    fontSize: 14,
  },
  cameraTriggerSub: {
    ...Typography.caption,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 260,
  },
  photoPreviewBox: {
    borderRadius: Radius.md,
    overflow: "hidden",
    height: 190,
    position: "relative",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoOverlayBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: "rgba(18, 76, 61, 0.8)",
  },
  photoOverlayText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: "700",
  },
  retakeBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  retakeBtnText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: "700",
  },
  locationConfirmBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.mintLight,
    alignItems: "center",
    justifyContent: "center",
  },
  locationIconText: {
    fontSize: 20,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  locationCoords: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  severityRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: 4,
  },
  severityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  severityChipSelected: {
    backgroundColor: Colors.mintLight,
    borderColor: Colors.primary,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  severityTextSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
  submitBar: {
    padding: Spacing.base,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  submitButton: {
    height: Size.buttonHeight,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
