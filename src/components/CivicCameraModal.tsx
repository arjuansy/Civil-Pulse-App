import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraType, CameraView } from "expo-camera";
import { saveReportPhoto } from "../storage/reportFileManager";

interface CivicCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoSaved: (fileInfo: { fileName: string; localUri: string }) => void;
}

export function CivicCameraModal({
  visible,
  onClose,
  onPhotoSaved,
}: CivicCameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        // Simpan langsung ke sandbox documentDirectory
        const savedFile = await saveReportPhoto(
          photo.uri,
          `bukti_kamera_${Date.now()}.jpg`,
        );

        Alert.alert(
          "Foto Berhasil Diambil!",
          `Kamera aktif dan foto bukti laporan telah tersimpan ke sandbox:\n${savedFile.fileName}`,
        );

        onPhotoSaved(savedFile);
        onClose();
      }
    } catch (error) {
      console.error("[Camera] Gagal mengambil foto:", error);
      Alert.alert(
        "Gagal Mengambil Foto",
        "Terjadi kesalahan saat memproses gambar dari kamera.",
      );
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Viewfinder Kamera Live */}
        <CameraView ref={cameraRef} facing={facing} style={StyleSheet.absoluteFill}>
          {/* Header Overlay */}
          <View style={styles.headerOverlay}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>KAMERA AKTIF</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup kamera"
              style={styles.circleButton}
              onPress={onClose}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Area Bantuan Fokus Lapangan */}
          <View style={styles.focusArea}>
            <View style={styles.focusFrame} />
            <Text style={styles.focusHint}>
              Arahkan kamera ke titik kerusakan infrastruktur atau lokasi bencana
            </Text>
          </View>

          {/* Kontrol Shutter Bawah */}
          <View style={styles.bottomControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ganti kamera depan atau belakang"
              style={styles.circleButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.switchIcon}>🔄</Text>
            </Pressable>

            {/* Tombol Shutter Utama */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ambil foto bukti laporan"
              style={[
                styles.shutterButtonOuter,
                isCapturing && styles.shutterDisabled,
              ]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="#137c68" size="small" />
              ) : (
                <View style={styles.shutterButtonInner} />
              )}
            </Pressable>

            <View style={{ width: 44 }} />
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  headerOverlay: {
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  statusPillText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  switchIcon: {
    fontSize: 20,
  },
  focusArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  focusFrame: {
    width: 260,
    height: 260,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderStyle: "dashed",
  },
  focusHint: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomControls: {
    paddingBottom: Platform.OS === "ios" ? 44 : 30,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shutterButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#ffffff",
  },
});
