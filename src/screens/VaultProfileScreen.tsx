import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CivicUserSession } from "../storage/secureStore";
import { CivicPermissionType, PermissionState } from "../hooks/useJustInTimePermissions";
import { Colors, Radius, Shadow, Size, Spacing, Typography } from "../design/tokens";

interface VaultProfileScreenProps {
  inputNik: string;
  setInputNik: (v: string) => void;
  inputPassword: string;
  setInputPassword: (v: string) => void;
  activeSession: CivicUserSession | null;
  rawToken: string | null;
  onLogin: () => void;
  onLogout: () => void;
  sandboxFiles: string[];
  sandboxDirectoryUri: string;
  onSavePhotoDemo: () => void;
  onSaveDocDemo: () => void;
  onOpenCamera: () => void;
  selectedPreviewImage: string | null;
  onClosePreviewImage: () => void;
  onReadFile: (fileName: string) => void;
  onDeleteFile: (fileName: string) => void;
  permissionStatuses: Record<CivicPermissionType, PermissionState>;
  onRequestPermission: (type: CivicPermissionType) => void;
  onOpenDeviceSettings: () => void;
}

export function VaultProfileScreen({
  inputNik,
  setInputNik,
  inputPassword,
  setInputPassword,
  activeSession,
  rawToken,
  onLogin,
  onLogout,
  sandboxFiles,
  sandboxDirectoryUri,
  onSavePhotoDemo,
  onSaveDocDemo,
  onOpenCamera,
  selectedPreviewImage,
  onClosePreviewImage,
  onReadFile,
  onDeleteFile,
  permissionStatuses,
  onRequestPermission,
  onOpenDeviceSettings,
}: VaultProfileScreenProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── 1. CITIZEN IDENTITY & SECURE STORE ───────────────────────── */}
      <View style={styles.cardSection}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>1. SECURESTORE &amp; KEADILAN IDENTITAS</Text>
        </View>
        <Text style={styles.sectionTitle}>Identitas Terenkripsi Warga</Text>
        <Text style={styles.sectionSubtitle}>
          Kredensial disimpan secara aman di Android Keystore / iOS Keychain tanpa risiko kebocoran data.
        </Text>

        {/* Form Login / NIK */}
        <View style={styles.formBox}>
          <Text style={styles.inputLabel}>Nomor Induk Kependudukan (16 Digit NIK)</Text>
          <TextInput
            style={styles.textInput}
            value={inputNik}
            onChangeText={setInputNik}
            keyboardType="numeric"
            maxLength={16}
            placeholder="Masukkan 16 digit NIK Anda"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.inputLabel}>Kata Sandi Akses</Text>
          <TextInput
            style={styles.textInput}
            value={inputPassword}
            onChangeText={setInputPassword}
            secureTextEntry
            placeholder="Masukkan kata sandi"
            placeholderTextColor={Colors.textMuted}
          />

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryBtn} onPress={onLogin}>
              <Text style={styles.primaryBtnText}>Simpan &amp; Masuk</Text>
            </Pressable>
            <Pressable style={styles.dangerBtn} onPress={onLogout}>
              <Text style={styles.dangerBtnText}>Logout / Bersihkan</Text>
            </Pressable>
          </View>
        </View>

        {/* Active Session Status */}
        <View style={styles.sessionStatusBox}>
          <Text style={styles.sessionBoxTitle}>Status Enkripsi Keystore:</Text>
          {activeSession ? (
            <View style={styles.sessionData}>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>NIK:</Text>
                <Text style={styles.sessionVal}>{activeSession.nik}</Text>
              </View>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>Auth Token:</Text>
                <Text style={styles.sessionVal} numberOfLines={1}>
                  {rawToken ? `${rawToken.slice(0, 18)}...` : "—"}
                </Text>
              </View>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>Waktu Login:</Text>
                <Text style={styles.sessionVal}>
                  {new Date(activeSession.waktuLogin).toLocaleString("id-ID")}
                </Text>
              </View>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>Peran:</Text>
                <Text style={[styles.sessionVal, { color: Colors.primary, fontWeight: "700" }]}>
                  {activeSession.role.toUpperCase()}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.sessionEmptyText}>
              Belum ada kredensial yang tersimpan di Keystore. Silakan lakukan login untuk mengaktifkan sesi aman.
            </Text>
          )}
        </View>
      </View>

      {/* ── 2. FILE SYSTEM SANDBOX & OFFLINE VAULT ────────────────────── */}
      <View style={styles.cardSection}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>2. BRANKAS BERKAS SANDBOX LOKAL</Text>
        </View>
        <Text style={styles.sectionTitle}>Penyimpanan Berkas Laporan</Text>
        <Text style={styles.sectionSubtitle}>
          Manajemen berkas terisolasi (documentDirectory) untuk menyimpan foto bukti dan draft laporan offline.
        </Text>

        <Text style={styles.sandboxUri} numberOfLines={1}>
          Path: {sandboxDirectoryUri}
        </Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryBtn} onPress={onSavePhotoDemo}>
            <Text style={styles.secondaryBtnText}>+ Simpan Foto Dummy</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onSaveDocDemo}>
            <Text style={styles.secondaryBtnText}>+ Buat Laporan JSON</Text>
          </Pressable>
        </View>

        <Pressable style={styles.cameraTriggerBtn} onPress={onOpenCamera}>
          <Text style={styles.cameraTriggerText}>
            📸 Buka Kamera Langsung (Ambil Foto Lapangan)
          </Text>
        </Pressable>

        {/* Foto Preview Box jika ada */}
        {selectedPreviewImage ? (
          <View style={styles.photoPreviewCard}>
            <View style={styles.photoPreviewHeader}>
              <Text style={styles.photoPreviewTitle}>Pratinjau Foto Sandbox</Text>
              <Pressable style={styles.closePreviewBtn} onPress={onClosePreviewImage}>
                <Text style={styles.closePreviewText}>Tutup</Text>
              </Pressable>
            </View>
            <Image
              source={{ uri: selectedPreviewImage }}
              style={styles.photoPreviewImg}
              resizeMode="cover"
            />
            <Text style={styles.photoPathText} numberOfLines={2}>
              {selectedPreviewImage}
            </Text>
          </View>
        ) : null}

        {/* Daftar Berkas */}
        <View style={styles.fileListBox}>
          <Text style={styles.fileListHeading}>
            Daftar Berkas Tersimpan ({sandboxFiles.length})
          </Text>
          {sandboxFiles.length === 0 ? (
            <Text style={styles.fileListEmpty}>
              Belum ada berkas tersimpan di sandbox lokal.
            </Text>
          ) : (
            sandboxFiles.map((file) => {
              const isImg =
                file.endsWith(".jpg") ||
                file.endsWith(".jpeg") ||
                file.endsWith(".png") ||
                file.endsWith(".svg");
              return (
                <View key={file} style={styles.fileRow}>
                  <View style={styles.fileRowLeft}>
                    <View style={[styles.fileTag, { backgroundColor: isImg ? Colors.infoSurface : Colors.bgSubtle }]}>
                      <Text style={[styles.fileTagText, { color: isImg ? Colors.info : Colors.textSecondary }]}>
                        {isImg ? "FOTO" : "DATA"}
                      </Text>
                    </View>
                    <Text style={styles.fileRowName} numberOfLines={1}>
                      {file}
                    </Text>
                  </View>
                  <View style={styles.fileRowActions}>
                    <Pressable
                      style={styles.fileMiniBtn}
                      onPress={() => onReadFile(file)}
                    >
                      <Text style={styles.fileMiniText}>
                        {isImg ? "Lihat" : "Baca"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.fileMiniBtn, styles.fileMiniBtnDanger]}
                      onPress={() => onDeleteFile(file)}
                    >
                      <Text style={styles.fileMiniTextDanger}>Hapus</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* ── 3. RUNTIME PERMISSIONS (JUST-IN-TIME) ─────────────────────── */}
      <View style={styles.cardSection}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>3. RUNTIME PERMISSIONS (JIT)</Text>
        </View>
        <Text style={styles.sectionTitle}>Izin Sesuai Kebutuhan</Text>
        <Text style={styles.sectionSubtitle}>
          Prinsip privasi minim: Izin hanya diminta saat fitur diakses. Jika ditolak permanen, aplikasi mengarahkan ke pengaturan perangkat.
        </Text>

        <View style={styles.permissionsList}>
          {/* Kamera */}
          <View style={styles.permItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permName}>Kamera</Text>
              <Text style={styles.permStatus}>Status: {permissionStatuses.camera}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable
                style={styles.permActionBtn}
                onPress={() => onRequestPermission("camera")}
              >
                <Text style={styles.permActionText}>Cek Izin</Text>
              </Pressable>
              <Pressable
                style={[styles.permActionBtn, { backgroundColor: Colors.primary }]}
                onPress={onOpenCamera}
              >
                <Text style={[styles.permActionText, { color: Colors.textInverse }]}>
                  Buka Kamera
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Lokasi */}
          <View style={styles.permItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permName}>Lokasi GPS</Text>
              <Text style={styles.permStatus}>Status: {permissionStatuses.location}</Text>
            </View>
            <Pressable
              style={[styles.permActionBtn, { backgroundColor: Colors.primary }]}
              onPress={() => onRequestPermission("location")}
            >
              <Text style={[styles.permActionText, { color: Colors.textInverse }]}>
                Minta Izin
              </Text>
            </Pressable>
          </View>

          {/* Storage */}
          <View style={styles.permItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permName}>Galeri / Storage</Text>
              <Text style={styles.permStatus}>Status: {permissionStatuses.storage}</Text>
            </View>
            <Pressable
              style={[styles.permActionBtn, { backgroundColor: Colors.primary }]}
              onPress={() => onRequestPermission("storage")}
            >
              <Text style={[styles.permActionText, { color: Colors.textInverse }]}>
                Minta Izin
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.settingsRedirectBtn} onPress={onOpenDeviceSettings}>
          <Text style={styles.settingsRedirectText}>
            ⚙️ Buka Pengaturan Perangkat (App Settings)
          </Text>
        </Pressable>
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
  cardSection: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...Shadow.card,
  },
  sectionBadge: {
    backgroundColor: Colors.mintLight,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginBottom: 6,
  },
  sectionBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 16,
  },
  sectionSubtitle: {
    ...Typography.caption,
    marginTop: 2,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  formBox: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  primaryBtn: {
    flex: 1,
    height: Size.buttonHeight,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: Colors.textInverse,
    fontSize: 13,
    fontWeight: "700",
  },
  dangerBtn: {
    flex: 1,
    height: Size.buttonHeight,
    backgroundColor: Colors.criticalSurface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.criticalBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerBtnText: {
    color: Colors.critical,
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    height: Size.buttonHeight,
    backgroundColor: Colors.mintLight,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.sageSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  sessionStatusBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  sessionBoxTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  sessionData: {
    gap: 4,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sessionKey: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sessionVal: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sessionEmptyText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: "italic",
    lineHeight: 16,
  },
  sandboxUri: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  cameraTriggerBtn: {
    marginTop: Spacing.sm,
    height: Size.buttonHeight,
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTriggerText: {
    color: Colors.textInverse,
    fontSize: 13,
    fontWeight: "700",
  },
  photoPreviewCard: {
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.successSurface,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    padding: Spacing.md,
  },
  photoPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  photoPreviewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.success,
  },
  closePreviewBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSurface,
  },
  closePreviewText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  photoPreviewImg: {
    width: "100%",
    height: 180,
    borderRadius: Radius.sm,
    backgroundColor: "#000000",
  },
  photoPathText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  fileListBox: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.md,
  },
  fileListHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  fileListEmpty: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  fileRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  fileTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  fileTagText: {
    fontSize: 9,
    fontWeight: "800",
  },
  fileRowName: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  fileRowActions: {
    flexDirection: "row",
    gap: 6,
  },
  fileMiniBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  fileMiniBtnDanger: {
    backgroundColor: Colors.criticalSurface,
    borderColor: Colors.criticalBorder,
  },
  fileMiniText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },
  fileMiniTextDanger: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.critical,
  },
  permissionsList: {
    gap: Spacing.sm,
  },
  permItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  permName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  permStatus: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: "capitalize",
  },
  permActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.mintLight,
    borderWidth: 1,
    borderColor: Colors.sageSoft,
  },
  permActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  settingsRedirectBtn: {
    marginTop: Spacing.md,
    height: Size.buttonHeight,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsRedirectText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
});
