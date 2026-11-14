import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CivicReport,
  createDemoReports,
  ReportCategory,
} from "./src/domain/reports";
import { formatDistance, haversineDistanceMeters } from "./src/geo/haversine";
import { useLocationTracking } from "./src/hooks/useLocationTracking";

const DEFAULT_CENTER = {
  latitude: -6.9175,
  longitude: 107.6191,
};

const INITIAL_REGION: Region = {
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
  const mapRef = useRef<MapView>(null);
  const [selectedReportId, setSelectedReportId] = useState("report-1");
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

  useEffect(() => {
    if (!location) {
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
  }, [location]);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
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
            <Text style={styles.liveText}>PETA WARGA</Text>
          </View>
        </View>

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
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={INITIAL_REGION}
            showsUserLocation={isTracking}
            showsMyLocationButton={false}
            showsCompass
            toolbarEnabled={false}
            loadingEnabled
            accessibilityLabel="Peta interaktif laporan warga"
          >
            {reports.map((report) => {
              const isSelected = report.id === selectedReportId;
              return (
                <Marker
                  key={report.id}
                  coordinate={{
                    latitude: report.latitude,
                    longitude: report.longitude,
                  }}
                  onPress={() => setSelectedReportId(report.id)}
                  tracksViewChanges={false}
                  accessibilityLabel={`${report.title}, ${report.severity}`}
                >
                  <View
                    style={[
                      styles.marker,
                      { backgroundColor: CATEGORY_COLORS[report.category] },
                      isSelected && styles.markerSelected,
                    ]}
                  >
                    <Text style={styles.markerText}>
                      {report.category === "Jalan"
                        ? "!"
                        : report.category === "Banjir"
                          ? "~"
                          : "+"}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

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
                        { backgroundColor: CATEGORY_COLORS[report.category] },
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
});
