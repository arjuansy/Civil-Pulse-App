import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { CivicReport, ReportCategory } from "../domain/reports";

export interface CivicMapViewProps {
  mapRef: React.RefObject<MapView | null>;
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
  mapRef,
  initialRegion,
  isTracking,
  reports,
  selectedReportId,
  onSelectReport,
  categoryColors,
}: CivicMapViewProps) {
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
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
            onPress={() => onSelectReport(report.id)}
            tracksViewChanges={false}
            accessibilityLabel={`${report.title}, ${report.severity}`}
          >
            <View
              style={[
                styles.marker,
                { backgroundColor: categoryColors[report.category] },
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
  );
}

const styles = StyleSheet.create({
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
});
