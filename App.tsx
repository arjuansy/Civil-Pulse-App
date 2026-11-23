import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

// Domain & Geo
import {
  CivicReport,
  createDemoReports,
  ReportCategory,
} from "./src/domain/reports";
import { formatDistance, haversineDistanceMeters } from "./src/geo/haversine";

// Hooks
import { useLocationTracking } from "./src/hooks/useLocationTracking";
import {
  CivicPermissionType,
  useJustInTimePermissions,
} from "./src/hooks/useJustInTimePermissions";

// Storage
import {
  CivicUserSession,
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

// Design Tokens
import { Colors, Radius, Shadow, Size, Spacing, Typography } from "./src/design/tokens";

// Components & Modals
import { CivicCameraModal } from "./src/components/CivicCameraModal";
import { ReportDetailModal } from "./src/components/ReportDetailModal";
import { NewReportModal } from "./src/components/NewReportModal";
import { BottomNavBar, ActiveNavTab } from "./src/components/BottomNavBar";

// Screens
import { HomeScreen } from "./src/screens/HomeScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { AlertsScreen } from "./src/screens/AlertsScreen";
import { VaultProfileScreen } from "./src/screens/VaultProfileScreen";

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
  Jalan: Colors.catJalan,
  Banjir: Colors.catBanjir,
  Fasilitas: Colors.catFasilitas,
};

export default function App() {
  const mapRef = useRef<any>(null);

  // ── Navigation State ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveNavTab>("beranda");

  // ── Modal States ───────────────────────────────────────────────────────────
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [selectedDetailReport, setSelectedDetailReport] = useState<CivicReport | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastCapturedPhotoUri, setLastCapturedPhotoUri] = useState<string | null>(null);

  // ── LBS & Tracking (Milestone 1) ───────────────────────────────────────────
  const {
    location,
    isTracking,
    distanceInterval,
    error: locationError,
    startTracking,
    stopTracking,
  } = useLocationTracking();

  const center = location?.coords ?? DEFAULT_CENTER;
  const initialReports = useMemo(
    () => createDemoReports(center),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [center.latitude, center.longitude],
  );

  // Daftar laporan aktif (menggabungkan demo reports + laporan baru dari user)
  const [allReports, setAllReports] = useState<CivicReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState("report-1");

  useEffect(() => {
    setAllReports(initialReports);
  }, [initialReports]);

  // ── SecureStore State (Milestone 2.1) ───────────────────────────────────────
  const [inputNik, setInputNik] = useState("3201234567890001");
  const [inputPassword, setInputPassword] = useState("civicpulse123");
  const [activeSession, setActiveSession] = useState<CivicUserSession | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);

  // ── FileSystem Sandbox State (Milestone 2.2) ────────────────────────────────
  const [sandboxFiles, setSandboxFiles] = useState<string[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // ── JIT Permissions (Milestone 2.3) ────────────────────────────────────────
  const {
    statuses: permissionStatuses,
    requestJustInTime,
    openDeviceSettings,
  } = useJustInTimePermissions();

  // Inisialisasi data awal SecureStore & FileSystem
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

  // Animasi kamera peta saat lokasi pengguna berubah dan sedang di tab peta
  useEffect(() => {
    if (!location || activeTab !== "peta") return;
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

  // ── Helper Jarak Haversine ─────────────────────────────────────────────────
  const getDistanceStr = (report: CivicReport): string => {
    if (!location) return "Aktifkan lokasi";
    return formatDistance(haversineDistanceMeters(location.coords, report));
  };

  const focusReportOnMap = (report: CivicReport) => {
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

  // ── Handlers SecureStore ───────────────────────────────────────────────────
  const handleLogin = async () => {
    const result = await loginUser(inputNik, inputPassword);
    Alert.alert(result.success ? "Login Sukses" : "Login Gagal", result.message);
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
    Alert.alert("Logout", "Kredensial dan sesi berhasil dihapus dari Keystore.");
  };

  // ── Handlers FileSystem Sandbox ───────────────────────────────────────────
  const handleSavePhotoDemo = async () => {
    try {
      const { fileName } = await createDummyReportPhoto("Jalan Rusak Berlubang");
      const updated = await listReportFiles();
      setSandboxFiles(updated);
      Alert.alert("Foto Tersimpan", `Tersimpan di sandbox:\n${fileName}`);
    } catch {
      Alert.alert("Error", "Gagal menyimpan foto dummy.");
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
      Alert.alert("Dokumen Tersimpan", `Berkas ${fileName} berhasil dibuat di sandbox.`);
    } catch {
      Alert.alert("Error", "Gagal menyimpan dokumen laporan.");
    }
  };

  const handleReadFile = async (fileName: string) => {
    if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".svg")
    ) {
      const uri = `${getSandboxDirectoryUri()}${fileName}`;
      setSelectedPreviewImage(uri);
      return;
    }
    try {
      const content = await readReportFile(fileName);
      Alert.alert(`Isi Berkas: ${fileName}`, content.slice(0, 400));
    } catch {
      Alert.alert("Error", `Gagal membaca berkas: ${fileName}`);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    const ok = await deleteReportFile(fileName);
    if (ok) {
      const updated = await listReportFiles();
      setSandboxFiles(updated);
      if (selectedPreviewImage && selectedPreviewImage.endsWith(fileName)) {
        setSelectedPreviewImage(null);
      }
    }
  };

  // ── Handlers JIT Permissions & Kamera ──────────────────────────────────────
  const handlePermissionRequest = async (type: CivicPermissionType) => {
    const granted = await requestJustInTime(type);
    if (granted) {
      Alert.alert("Izin Diberikan", `Izin untuk ${type} berhasil diaktifkan.`);
    }
  };

  const handleOpenCamera = async () => {
    const granted = await requestJustInTime("camera");
    if (granted) {
      setIsCameraActive(true);
    }
  };

  const handleNewReportCreated = (newReport: CivicReport) => {
    setAllReports((prev) => [newReport, ...prev]);
    setSelectedReportId(newReport.id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* ── TOP APP BAR ──────────────────────────────────────────────────── */}
      <View style={styles.topAppBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>CP</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Civic Pulse</Text>
            <Text style={styles.brandSub}>SDG 11 Kota Berkelanjutan</Text>
          </View>
        </View>

        {/* Live Tracking GPS Pill */}
        <View style={[styles.gpsPill, isTracking && styles.gpsPillActive]}>
          <View style={[styles.gpsDot, isTracking && styles.gpsDotActive]} />
          <Text style={[styles.gpsText, isTracking && styles.gpsTextActive]}>
            {isTracking ? `GPS ${distanceInterval}m` : "GPS Nonaktif"}
          </Text>
        </View>
      </View>

      {/* ── MAIN CONTENT AREA (TAB VIEW SWITCHER) ────────────────────────── */}
      <View style={styles.screenArea}>
        {activeTab === "beranda" && (
          <HomeScreen
            reports={allReports}
            activeSession={activeSession}
            onOpenNewReport={() => setIsNewReportModalOpen(true)}
            onNavigateToMap={(reportId) => {
              if (reportId) setSelectedReportId(reportId);
              setActiveTab("peta");
            }}
            onNavigateToAlerts={() => setActiveTab("siaga")}
            onSelectReportDetail={(report) => setSelectedDetailReport(report)}
            getDistanceStr={getDistanceStr}
          />
        )}

        {activeTab === "peta" && (
          <MapScreen
            mapRef={mapRef}
            initialRegion={INITIAL_REGION}
            reports={allReports}
            selectedReportId={selectedReportId}
            onSelectReport={(id) => setSelectedReportId(id)}
            categoryColors={CATEGORY_COLORS}
            isTracking={isTracking}
            distanceInterval={distanceInterval}
            onToggleTracking={isTracking ? stopTracking : startTracking}
            onFocusReport={focusReportOnMap}
            onOpenReportDetail={(report) => setSelectedDetailReport(report)}
            getDistanceStr={getDistanceStr}
          />
        )}

        {activeTab === "siaga" && <AlertsScreen />}

        {activeTab === "vault" && (
          <VaultProfileScreen
            inputNik={inputNik}
            setInputNik={setInputNik}
            inputPassword={inputPassword}
            setInputPassword={setInputPassword}
            activeSession={activeSession}
            rawToken={rawToken}
            onLogin={handleLogin}
            onLogout={handleLogout}
            sandboxFiles={sandboxFiles}
            sandboxDirectoryUri={getSandboxDirectoryUri()}
            onSavePhotoDemo={handleSavePhotoDemo}
            onSaveDocDemo={handleSaveDocumentDemo}
            onOpenCamera={handleOpenCamera}
            selectedPreviewImage={selectedPreviewImage}
            onClosePreviewImage={() => setSelectedPreviewImage(null)}
            onReadFile={handleReadFile}
            onDeleteFile={handleDeleteFile}
            permissionStatuses={permissionStatuses}
            onRequestPermission={handlePermissionRequest}
            onOpenDeviceSettings={openDeviceSettings}
          />
        )}
      </View>

      {/* ── BOTTOM NAVIGATION BAR ────────────────────────────────────────── */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenReportModal={() => setIsNewReportModalOpen(true)}
      />

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {/* 1. Modal Buat Laporan Baru */}
      <NewReportModal
        visible={isNewReportModalOpen}
        userCoords={location?.coords ?? null}
        onClose={() => setIsNewReportModalOpen(false)}
        onOpenLiveCamera={handleOpenCamera}
        capturedPhotoUri={lastCapturedPhotoUri}
        onReportCreated={handleNewReportCreated}
      />

      {/* 2. Modal Rincian Laporan Komunitas */}
      <ReportDetailModal
        visible={selectedDetailReport !== null}
        report={selectedDetailReport}
        distance={selectedDetailReport ? getDistanceStr(selectedDetailReport) : "--"}
        onClose={() => setSelectedDetailReport(null)}
        onFocusMap={() => {
          if (selectedDetailReport) {
            focusReportOnMap(selectedDetailReport);
            setActiveTab("peta");
          }
        }}
      />

      {/* 3. Modal Kamera Lapangan Terintegrasi */}
      <CivicCameraModal
        visible={isCameraActive}
        onClose={() => setIsCameraActive(false)}
        onPhotoSaved={async (saved) => {
          setLastCapturedPhotoUri(saved.localUri);
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
    backgroundColor: Colors.bgSurface,
  },
  topAppBar: {
    height: 60,
    paddingHorizontal: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm + 2,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandBadgeText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.primary,
  },
  gpsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  gpsPillActive: {
    backgroundColor: Colors.successSurface,
    borderColor: Colors.successBorder,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  gpsDotActive: {
    backgroundColor: Colors.success,
  },
  gpsText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  gpsTextActive: {
    color: Colors.success,
  },
  screenArea: {
    flex: 1,
  },
});
