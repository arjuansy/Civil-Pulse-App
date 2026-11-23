import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CivicMapView } from "./src/components/CivicMapView";
import { CivicCameraModal } from "./src/components/CivicCameraModal";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CivicReport,
  createDemoReports,
  ReportCategory,
} from "./src/domain/reports";
import { formatDistance, haversineDistanceMeters } from "./src/geo/haversine";
import { useLocationTracking } from "./src/hooks/useLocationTracking";
import {
  CivicUserSession,
  deleteSecure,
  getActiveSession,
  getSecure,
  loginUser,
  logoutUser,
  SECURE_KEYS,
} from "./src/storage/secureStore";
import {
  createDummyReportPhoto,
  deleteReportFile,
  getSandboxDirectoryUri,
  listReportFiles,
  readReportFile,
  saveReportFile,
} from "./src/storage/reportFileManager";
import {
  CivicPermissionType,
  useJustInTimePermissions,
} from "./src/hooks/useJustInTimePermissions";

const DEFAULT_CENTER = {
  latitude: -6.9175,
  longitude: 107.6191,
};

const INITIAL_REGION = {
  ...DEFAULT_CENTER,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  Jalan: "#ef6b52",
  Banjir: "#3988e8",
  Fasilitas: "#e5a62c",
};

function getReportDistance(
  report: CivicReport,
  location: { latitude: number; longitude: number } | null,
): string {
  if (!location) {
    return "Aktifkan lokasi";
  }

  return formatDistance(haversineDistanceMeters(location, report));
}

export default function App() {
  const mapRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<"milestone1" | "milestone2">(
    "milestone1",
  );
  const [selectedReportId, setSelectedReportId] = useState("report-1");

  // Milestone 1: LBS Tracking
  const {
    location,
    isTracking,
    distanceInterval,
    error,
    startTracking,
    stopTracking,
  } = useLocationTracking();

  const center = location?.coords ?? DEFAULT_CENTER;
  const reports = useMemo(
    () => createDemoReports(center),
    [center.latitude, center.longitude],
  );
  const selectedReport =
    reports.find((report) => report.id === selectedReportId) ?? reports[0];

  // Milestone 2 State - 1. SecureStore
  const [inputNik, setInputNik] = useState("3201234567890001");
  const [inputPassword, setInputPassword] = useState("civicpulse123");
  const [activeSession, setActiveSession] = useState<CivicUserSession | null>(
    null,
  );
  const [rawToken, setRawToken] = useState<string | null>(null);

  // Milestone 2 State - 2. FileSystem Sandbox
  const [sandboxFiles, setSandboxFiles] = useState<string[]>([]);
  const [fileContentPreview, setFileContentPreview] = useState<string | null>(
    null,
  );
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);

  // Milestone 2 State - 3. Runtime JIT Permissions & Kamera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const {
    statuses: permissionStatuses,
    requestJustInTime,
    openDeviceSettings,
  } = useJustInTimePermissions();

  // Muat sesi SecureStore & daftar berkas saat aplikasi dibuka
  useEffect(() => {
    async function loadInitialData() {
      try {
        const session = await getActiveSession();
        setActiveSession(session);
        const token = await getSecure(SECURE_KEYS.AUTH_TOKEN);
        setRawToken(token);

        const files = await listReportFiles();
        setSandboxFiles(files);
      } catch (err) {
        console.warn("Gagal memuat data awal:", err);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!location || activeTab !== "milestone1") {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      500,
    );
  }, [location, activeTab]);

  const focusReport = (report: CivicReport) => {
    setSelectedReportId(report.id);
    mapRef.current?.animateToRegion(
      {
        latitude: report.latitude,
        longitude: report.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      350,
    );
  };

  // Handler Alur Login SecureStore
  const handleLogin = async () => {
    const result = await loginUser(inputNik, inputPassword);
    Alert.alert(result.success ? "Sukses" : "Gagal", result.message);
    if (result.success && result.session) {
      setActiveSession(result.session);
      const token = await getSecure(SECURE_KEYS.AUTH_TOKEN);
      setRawToken(token);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setActiveSession(null);
    setRawToken(null);
    Alert.alert("Logout", "Kredensial dan token dihapus dari SecureStore.");
  };

  // Handler FileSystem Sandbox
  const handleSavePhotoDemo = async () => {
    try {
      const { fileName } = await createDummyReportPhoto("Jalan Rusak Berlubang");
      const updated = await listReportFiles();
      setSandboxFiles(updated);
      Alert.alert(
        "Foto Tersimpan",
        `Foto berhasil disimpan di sandbox lokal:\n${fileName}`,
      );
    } catch (err) {
      Alert.alert("Error", "Gagal menyimpan foto ke sandbox.");
    }
  };

  const handleSaveDocumentDemo = async () => {
    try {
      const fileName = `laporan_${Date.now()}.json`;
      const sampleReport = {
        id: `civic-${Date.now()}`,
        judul: "Lampu Penerangan Jalan Mati",
        kategori: "Fasilitas",
        lokasi: { lat: center.latitude, lng: center.longitude },
        dibuatPada: new Date().toISOString(),
      };
      await saveReportFile(fileName, JSON.stringify(sampleReport, null, 2));
      const updated = await listReportFiles();
      setSandboxFiles(updated);
      Alert.alert("Dokumen Tersimpan", `Berkas ${fileName} berhasil dibuat.`);
    } catch (err) {
      Alert.alert("Error", "Gagal menyimpan dokumen laporan.");
    }
  };

  const handleReadFileDemo = async (fileName: string) => {
    if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png")
    ) {
      const uri = `${getSandboxDirectoryUri()}${fileName}`;
      setSelectedPreviewImage(uri);
      return;
    }

    try {
      const content = await readReportFile(fileName);
      setFileContentPreview(content);
      Alert.alert(`Isi: ${fileName}`, content.slice(0, 300));
    } catch (err) {
      Alert.alert("Error", `Gagal membaca berkas: ${fileName}`);
    }
  };

  const handleDeleteFileDemo = async (fileName: string) => {
    const ok = await deleteReportFile(fileName);
    if (ok) {
      const updated = await listReportFiles();
      setSandboxFiles(updated);
      if (fileContentPreview) setFileContentPreview(null);
      if (
        selectedPreviewImage &&
        selectedPreviewImage.endsWith(fileName)
      ) {
        setSelectedPreviewImage(null);
      }
    }
  };

  // Handler Runtime Permissions JIT
  const handlePermissionRequest = async (type: CivicPermissionType) => {
    const granted = await requestJustInTime(type);
    if (granted) {
      Alert.alert("Izin Diberikan", `Izin untuk ${type} berhasil diberikan!`);
    }
  };

  // Handler Buka Kamera Langsung (Just-In-Time)
  const handleOpenCamera = async () => {
    const granted = await requestJustInTime("camera");
    if (granted) {
      setIsCameraActive(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        {/* Header Bersama */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>P</Text>
            </View>
            <View>
              <Text style={styles.brandName}>CIVIC PULSE</Text>
              <Text style={styles.brandSubtitle}>Kota lebih baik, bersama</Text>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {activeTab === "milestone1" ? "PETA LBS" : "OFFLINE & SECURE"}
            </Text>
          </View>
        </View>

        {/* Tab Navigator Milestone 1 vs Milestone 2 */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === "milestone1" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("milestone1")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "milestone1" && styles.tabButtonTextActive,
              ]}
            >
              Milestone 1: Peta & LBS
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === "milestone2" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("milestone2")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "milestone2" && styles.tabButtonTextActive,
              ]}
            >
              Milestone 2: Secure & Files
            </Text>
          </Pressable>
        </View>

        {/* KONTEN TAB 1: MILESTONE 1 (Peta, LBS, Haversine) */}
        {activeTab === "milestone1" ? (
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.pageTitle}>Pantau sekitarmu</Text>
                <Text style={styles.pageSubtitle}>
                  Temukan laporan warga di sekitar lokasi
                </Text>
              </View>
              <View style={styles.reportCount}>
                <Text style={styles.reportCountNumber}>{reports.length}</Text>
                <Text style={styles.reportCountLabel}>laporan</Text>
              </View>
            </View>

            <View style={styles.mapContainer}>
              <CivicMapView
                mapRef={mapRef}
                initialRegion={INITIAL_REGION}
                isTracking={isTracking}
                reports={reports}
                selectedReportId={selectedReportId}
                onSelectReport={(id) => setSelectedReportId(id)}
                categoryColors={CATEGORY_COLORS}
              />

              <View style={styles.mapLabel}>
                <Text style={styles.mapLabelDot}>●</Text>
                <Text style={styles.mapLabelText}>Laporan sekitar</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isTracking ? "Hentikan pelacakan lokasi" : "Gunakan lokasi saya"
                }
                style={styles.locationButton}
                onPress={isTracking ? stopTracking : startTracking}
              >
                <Text style={styles.locationButtonIcon}>
                  {isTracking ? "■" : "◎"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeading}>
                <View>
                  <Text style={styles.panelTitle}>Laporan terbaru</Text>
                  <Text style={styles.panelSubtitle}>
                    Contoh titik untuk demonstrasi
                  </Text>
                </View>
                <View
                  style={[
                    styles.trackingStatus,
                    isTracking && styles.trackingStatusActive,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      isTracking && styles.statusDotActive,
                    ]}
                  />
                  <Text style={styles.trackingStatusText}>
                    {isTracking ? `${distanceInterval} m` : "GPS nonaktif"}
                  </Text>
                </View>
              </View>

              {error ? (
                <View accessibilityRole="alert" style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reportList}
              >
                {reports.map((report) => {
                  const isSelected = report.id === selectedReportId;
                  return (
                    <Pressable
                      key={report.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Pilih laporan ${report.title}`}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => focusReport(report)}
                      style={[
                        styles.reportCard,
                        isSelected && styles.reportCardSelected,
                      ]}
                    >
                      <View style={styles.cardTopRow}>
                        <View
                          style={[
                            styles.categoryDot,
                            {
                              backgroundColor: CATEGORY_COLORS[report.category],
                            },
                          ]}
                        />
                        <Text style={styles.reportCategory}>
                          {report.category.toUpperCase()}
                        </Text>
                        <Text style={styles.reportTime}>{report.reportedAt}</Text>
                      </View>
                      <Text style={styles.reportTitle} numberOfLines={1}>
                        {report.title}
                      </Text>
                      <View style={styles.cardBottomRow}>
                        <Text style={styles.reportSeverity}>
                          Prioritas {report.severity.toLowerCase()}
                        </Text>
                        <Text style={styles.reportDistance}>
                          {getReportDistance(report, location?.coords ?? null)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.footerNote}>
                {isTracking
                  ? "Lokasi diperbarui otomatis saat Anda bergerak."
                  : "Nyalakan GPS untuk melihat jarak dan posisi Anda."}
              </Text>
            </View>
          </View>
        ) : (
          /* KONTEN TAB 2: MILESTONE 2 (SecureStore, FileSystem Sandbox, Permissions JIT) */
          <ScrollView
            style={styles.m2Scroll}
            contentContainerStyle={styles.m2ScrollContent}
          >
            {/* 1. SEKSI SECURE STORE & LOGIN */}
            <View style={styles.m2Card}>
              <View style={styles.m2CardHeader}>
                <Text style={styles.m2CardBadge}>1. SECURE STORE</Text>
                <Text style={styles.m2CardTitle}>Kredensial & Sesi Aman</Text>
                <Text style={styles.m2CardDesc}>
                  Penyimpanan terenkripsi (Keystore/Keychain) untuk token autentikasi, NIK, dan kredensial warga.
                </Text>
              </View>

              <View style={styles.m2Form}>
                <Text style={styles.inputLabel}>NIK Warga (16 Digit)</Text>
                <TextInput
                  value={inputNik}
                  onChangeText={setInputNik}
                  keyboardType="numeric"
                  maxLength={16}
                  style={styles.textInput}
                  placeholder="Masukkan 16 digit NIK"
                />

                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <TextInput
                  value={inputPassword}
                  onChangeText={setInputPassword}
                  secureTextEntry
                  style={styles.textInput}
                  placeholder="Masukkan kata sandi"
                />

                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.primaryButton, { flex: 1 }]}
                    onPress={handleLogin}
                  >
                    <Text style={styles.primaryButtonText}>Simpan & Login</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.dangerButton, { flex: 1 }]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.dangerButtonText}>Logout / Hapus</Text>
                  </Pressable>
                </View>
              </View>

              {/* Status Sesi Tersimpan di SecureStore */}
              <View style={styles.sessionBox}>
                <Text style={styles.sessionTitle}>
                  Status SecureStore Saat Ini:
                </Text>
                {activeSession ? (
                  <View style={{ gap: 4, marginTop: 4 }}>
                    <Text style={styles.sessionText}>
                      • NIK: <Text style={styles.bold}>{activeSession.nik}</Text>
                    </Text>
                    <Text style={styles.sessionText}>
                      • Token:{" "}
                      <Text style={styles.bold}>
                        {rawToken ? `${rawToken.slice(0, 16)}...` : "-"}
                      </Text>
                    </Text>
                    <Text style={styles.sessionText}>
                      • Waktu Login:{" "}
                      {new Date(activeSession.waktuLogin).toLocaleTimeString()}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.sessionEmptyText}>
                    Belum ada kredensial yang tersimpan di SecureStore.
                  </Text>
                )}
              </View>
            </View>

            {/* 2. SEKSI EXPO-FILE-SYSTEM SANDBOX */}
            <View style={styles.m2Card}>
              <View style={styles.m2CardHeader}>
                <Text style={styles.m2CardBadge}>2. FILE SYSTEM SANDBOX</Text>
                <Text style={styles.m2CardTitle}>Penyimpanan Berkas Laporan</Text>
                <Text style={styles.m2CardDesc}>
                  Manajemen folder lokal terisolasi (documentDirectory) untuk menyimpan foto bukti dan draft laporan offline.
                </Text>
              </View>

              <Text style={styles.sandboxPathText} numberOfLines={1}>
                Sandbox: {getSandboxDirectoryUri()}
              </Text>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.secondaryButton, { flex: 1 }]}
                  onPress={handleSavePhotoDemo}
                >
                  <Text style={styles.secondaryButtonText}>
                    + Simpan Foto Dummy
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.secondaryButton, { flex: 1 }]}
                  onPress={handleSaveDocumentDemo}
                >
                  <Text style={styles.secondaryButtonText}>
                    + Buat Laporan JSON
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[
                  styles.primaryButton,
                  { marginTop: 10, backgroundColor: "#0f766e" },
                ]}
                onPress={handleOpenCamera}
              >
                <Text style={styles.primaryButtonText}>
                  📸 Buka Kamera & Ambil Foto (Uji Akses Kamera)
                </Text>
              </Pressable>

              {/* Tampilan Visual Preview Foto dari Sandbox */}
              {selectedPreviewImage ? (
                <View style={styles.imagePreviewContainer}>
                  <View style={styles.imagePreviewHeader}>
                    <Text style={styles.imagePreviewTitle}>
                      Foto dari Sandbox:
                    </Text>
                    <Pressable
                      style={styles.closePreviewBtn}
                      onPress={() => setSelectedPreviewImage(null)}
                    >
                      <Text style={styles.closePreviewBtnText}>✕ Tutup</Text>
                    </Pressable>
                  </View>
                  <Image
                    source={{ uri: selectedPreviewImage }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <Text style={styles.imagePathText} numberOfLines={2}>
                    {selectedPreviewImage}
                  </Text>
                </View>
              ) : null}

              {/* Daftar Berkas Tersimpan */}
              <View style={styles.fileListContainer}>
                <Text style={styles.sessionTitle}>
                  Berkas di Sandbox ({sandboxFiles.length}):
                </Text>
                {sandboxFiles.length === 0 ? (
                  <Text style={styles.sessionEmptyText}>
                    Belum ada berkas tersimpan di sandbox lokal.
                  </Text>
                ) : (
                  sandboxFiles.map((file) => {
                    const isImage =
                      file.endsWith(".jpg") ||
                      file.endsWith(".jpeg") ||
                      file.endsWith(".png");
                    return (
                      <View key={file} style={styles.fileItem}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {isImage ? "📸" : "📄"} {file}
                        </Text>
                        <View style={styles.fileActions}>
                          <Pressable
                            style={styles.fileMiniButton}
                            onPress={() => handleReadFileDemo(file)}
                          >
                            <Text style={styles.fileMiniButtonText}>
                              {isImage ? "Lihat" : "Baca"}
                            </Text>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.fileMiniButton,
                              styles.fileMiniButtonDelete,
                            ]}
                            onPress={() => handleDeleteFileDemo(file)}
                          >
                            <Text
                              style={[
                                styles.fileMiniButtonText,
                                styles.fileMiniButtonTextDelete,
                              ]}
                            >
                              Hapus
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* 3. SEKSI RUNTIME PERMISSIONS JUST-IN-TIME */}
            <View style={styles.m2Card}>
              <View style={styles.m2CardHeader}>
                <Text style={styles.m2CardBadge}>3. RUNTIME PERMISSIONS (JIT)</Text>
                <Text style={styles.m2CardTitle}>Izin Sesuai Kebutuhan</Text>
                <Text style={styles.m2CardDesc}>
                  Izin diminta hanya saat pengguna mengakses fiturnya. Jika ditolak permanen, aplikasi mengarahkan ke pengaturan perangkat.
                </Text>
              </View>

              <View style={styles.permissionList}>
                {/* Kamera */}
                <View style={styles.permissionItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permissionName}>Kamera</Text>
                    <Text style={styles.permissionSub}>
                      Status: {permissionStatuses.camera}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => handlePermissionRequest("camera")}
                    >
                      <Text style={styles.secondaryButtonText}>Cek Izin</Text>
                    </Pressable>
                    <Pressable
                      style={styles.primaryButton}
                      onPress={handleOpenCamera}
                    >
                      <Text style={styles.primaryButtonText}>Buka Kamera</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Lokasi */}
                <View style={styles.permissionItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permissionName}>Lokasi GPS</Text>
                    <Text style={styles.permissionSub}>
                      Status: {permissionStatuses.location}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => handlePermissionRequest("location")}
                  >
                    <Text style={styles.primaryButtonText}>Minta Izin</Text>
                  </Pressable>
                </View>

                {/* Storage */}
                <View style={styles.permissionItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permissionName}>Galeri / Storage</Text>
                    <Text style={styles.permissionSub}>
                      Status: {permissionStatuses.storage}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => handlePermissionRequest("storage")}
                  >
                    <Text style={styles.primaryButtonText}>Minta Izin</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={styles.settingsRedirectButton}
                onPress={() => openDeviceSettings()}
              >
                <Text style={styles.settingsRedirectText}>
                  ⚙️ Buka Pengaturan Perangkat
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Modal Kamera Interaktif untuk Verifikasi Akses Kamera */}
      <CivicCameraModal
        visible={isCameraActive}
        onClose={() => setIsCameraActive(false)}
        onPhotoSaved={async (saved) => {
          const updated = await listReportFiles();
          setSandboxFiles(updated);
          setSelectedPreviewImage(saved.localUri);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  screen: {
    flex: 1,
  },
  header: {
    height: 66,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eceeec",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#137c68",
    alignItems: "center",
    justifyContent: "center",
  },
  brandIconText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  brandName: {
    color: "#173a35",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    marginTop: 2,
    color: "#84918f",
    fontSize: 10,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#edf7f3",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a37f",
  },
  liveText: {
    color: "#187963",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eceeec",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f4f4",
  },
  tabButtonActive: {
    backgroundColor: "#137c68",
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#60706d",
  },
  tabButtonTextActive: {
    color: "#ffffff",
  },
  titleRow: {
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    color: "#173a35",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    marginTop: 4,
    color: "#889391",
    fontSize: 12,
  },
  reportCount: {
    alignItems: "flex-end",
  },
  reportCountNumber: {
    color: "#137c68",
    fontSize: 20,
    fontWeight: "800",
  },
  reportCountLabel: {
    color: "#889391",
    fontSize: 10,
  },
  mapContainer: {
    flex: 1,
    minHeight: 240,
    overflow: "hidden",
    backgroundColor: "#e5ebea",
  },
  mapLabel: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    shadowColor: "#193c36",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  mapLabelDot: {
    color: "#16a37f",
    fontSize: 10,
  },
  mapLabelText: {
    color: "#40534f",
    fontSize: 11,
    fontWeight: "700",
  },
  locationButton: {
    position: "absolute",
    right: 15,
    bottom: 17,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#193c36",
    shadowOpacity: 0.16,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  locationButtonIcon: {
    color: "#137c68",
    fontSize: 23,
    fontWeight: "700",
  },
  marker: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1d332f",
    shadowOpacity: 0.24,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerSelected: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 3,
  },
  markerText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  panel: {
    paddingTop: 16,
    paddingBottom: 9,
    backgroundColor: "#ffffff",
  },
  panelHeading: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panelTitle: {
    color: "#173a35",
    fontSize: 16,
    fontWeight: "800",
  },
  panelSubtitle: {
    marginTop: 3,
    color: "#93a09d",
    fontSize: 10,
  },
  trackingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#f2f4f4",
  },
  trackingStatusActive: {
    backgroundColor: "#edf7f3",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#a9b3b1",
  },
  statusDotActive: {
    backgroundColor: "#16a37f",
  },
  trackingStatusText: {
    color: "#63716e",
    fontSize: 10,
    fontWeight: "700",
  },
  reportList: {
    paddingHorizontal: 20,
    paddingBottom: 3,
    gap: 10,
  },
  reportCard: {
    width: 220,
    minHeight: 105,
    padding: 12,
    borderWidth: 1,
    borderColor: "#edf0ef",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  reportCardSelected: {
    borderColor: "#78b9a9",
    backgroundColor: "#f5fbf9",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  reportCategory: {
    color: "#677572",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  reportTime: {
    marginLeft: "auto",
    color: "#a0aaa8",
    fontSize: 9,
  },
  reportTitle: {
    marginTop: 9,
    color: "#243d38",
    fontSize: 13,
    fontWeight: "800",
  },
  cardBottomRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportSeverity: {
    color: "#82908d",
    fontSize: 10,
  },
  reportDistance: {
    color: "#137c68",
    fontSize: 10,
    fontWeight: "700",
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 9,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff2ef",
  },
  errorText: {
    color: "#a83f31",
    fontSize: 11,
    lineHeight: 16,
  },
  footerNote: {
    paddingHorizontal: 20,
    paddingTop: 8,
    color: "#9aa5a3",
    fontSize: 10,
  },

  /* Styling Milestone 2 */
  m2Scroll: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  m2ScrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 36,
  },
  m2Card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#edf0ef",
    shadowColor: "#173a35",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  m2CardHeader: {
    marginBottom: 12,
  },
  m2CardBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#137c68",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  m2CardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#173a35",
  },
  m2CardDesc: {
    fontSize: 11,
    color: "#7a8a86",
    marginTop: 4,
    lineHeight: 16,
  },
  m2Form: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#465955",
    marginTop: 4,
  },
  textInput: {
    backgroundColor: "#f7f9f8",
    borderWidth: 1,
    borderColor: "#dde3e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#173a35",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#137c68",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#edf7f3",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#137c68",
    fontSize: 12,
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "#fff2ef",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "#c24130",
    fontSize: 12,
    fontWeight: "700",
  },
  sessionBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fbf9",
    borderWidth: 1,
    borderColor: "#e3f0eb",
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4740",
  },
  sessionText: {
    fontSize: 11,
    color: "#4f6360",
  },
  sessionEmptyText: {
    fontSize: 11,
    color: "#97a7a3",
    fontStyle: "italic",
    marginTop: 4,
  },
  bold: {
    fontWeight: "700",
    color: "#173a35",
  },
  sandboxPathText: {
    fontSize: 10,
    color: "#849390",
    marginBottom: 8,
  },
  fileListContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#edf0ef",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f2",
  },
  fileName: {
    flex: 1,
    fontSize: 11,
    color: "#304340",
    marginRight: 8,
  },
  fileActions: {
    flexDirection: "row",
    gap: 6,
  },
  fileMiniButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#eef3f1",
    borderRadius: 6,
  },
  fileMiniButtonDelete: {
    backgroundColor: "#fdeeed",
  },
  fileMiniButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#196657",
  },
  fileMiniButtonTextDelete: {
    color: "#c24130",
  },
  permissionList: {
    gap: 10,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f7f9f8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6ecea",
  },
  permissionName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d3a35",
  },
  permissionSub: {
    fontSize: 10,
    color: "#80928f",
    marginTop: 2,
    textTransform: "capitalize",
  },
  settingsRedirectButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f2f4f4",
  },
  settingsRedirectText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4d605c",
  },
  imagePreviewContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  imagePreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  imagePreviewTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  closePreviewBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#dcfce7",
  },
  closePreviewBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: "#000000",
  },
  imagePathText: {
    marginTop: 6,
    fontSize: 9,
    color: "#65a30d",
  },
});
