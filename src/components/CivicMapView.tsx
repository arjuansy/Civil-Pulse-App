import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { CivicReport, ReportCategory } from "../domain/reports";
import { Colors, Radius, Shadow } from "../design/tokens";

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

/**
 * Returns a 2–3 character abbreviation for each category.
 * Text-based markers avoid emoji rendering inconsistencies across Android versions.
 */
function getCategoryAbbr(category: ReportCategory): string {
  const map: Record<ReportCategory, string> = {
    Jalan: "JLN",
    Banjir: "BNJ",
    Fasilitas: "FAS",
  };
  return map[category];
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
      accessibilityLabel="Peta interaktif laporan infrastruktur warga"
    >
      {reports.map((report) => {
        const isSelected = report.id === selectedReportId;
        const color = categoryColors[report.category];
        return (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            onPress={() => onSelectReport(report.id)}
            tracksViewChanges={false}
            accessibilityLabel={`${report.title}, prioritas ${report.severity}`}
          >
            <View
              style={[
                styles.markerContainer,
                { borderColor: color },
                isSelected && styles.markerContainerSelected,
              ]}
            >
              <View style={[styles.markerBody, { backgroundColor: color }]}>
                <Text style={styles.markerText}>
                  {getCategoryAbbr(report.category)}
                </Text>
              </View>
              {/* Callout tail — small downward triangle */}
              <View style={[styles.markerTail, { borderTopColor: color }]} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    // Outer ring shows on selection
    borderWidth: 0,
    borderRadius: Radius.sm,
  },
  markerContainerSelected: {
    // Scale up via transform on the outer wrapper
    transform: [{ scale: 1.18 }],
  },
  markerBody: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    borderWidth: 2,
    borderColor: Colors.bgSurface,
    ...Shadow.float,
  },
  markerText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    // borderTopColor set dynamically per marker
    borderTopColor: Colors.primary,
    marginTop: -1,
  },
});
