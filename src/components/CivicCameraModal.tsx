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
import { Colors, Radius, Shadow, Size, Spacing, Typography } from "../design/tokens";

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
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        const savedFile = await saveReportPhoto(
          photo.uri,
          `bukti_kamera_${Date.now()}.jpg`,
        );

        Alert.alert(
          "Foto Berhasil Diambil",
          `Foto bukti telah tersimpan ke sandbox lokal:\n${savedFile.fileName}`,
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
        <CameraView ref={cameraRef} facing={facing} style={StyleSheet.absoluteFill}>

          {/* ── TOP OVERLAY ───────────────────────────────────────────── */}
          <View style={styles.topOverlay}>
            {/* Status indicator */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>KAMERA AKTIF</Text>
            </View>

            {/* Close button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup kamera"
              style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
              onPress={onClose}
            >
              <Text style={styles.controlBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* ── FOCUS GUIDE ───────────────────────────────────────────── */}
          <View style={styles.focusArea}>
            {/* Corner marks — cleaner than a full dashed border */}
            <View style={styles.focusFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.focusHintContainer}>
              <Text style={styles.focusHint}>
                Arahkan kamera ke titik kerusakan atau lokasi bencana
              </Text>
            </View>
          </View>

          {/* ── BOTTOM CONTROLS ───────────────────────────────────────── */}
          <View style={styles.bottomControls}>
            {/* Flip camera */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ganti kamera depan atau belakang"
              style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.controlBtnText}>⟳</Text>
            </Pressable>

            {/* Shutter */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ambil foto bukti laporan"
              style={({ pressed }) => [
                styles.shutterOuter,
                isCapturing && styles.shutterDisabled,
                pressed && !isCapturing && styles.shutterPressed,
              ]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color={Colors.primary} size="small" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </Pressable>

            {/* Spacer to balance layout */}
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

  // Top overlay
  topOverlay: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(0,0,0,0.60)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  statusText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  controlBtnPressed: {
    opacity: 0.70,
  },
  controlBtnText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: "600",
  },

  // Focus guide
  focusArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.base,
  },
  focusFrame: {
    width: 240,
    height: 240,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "rgba(255,255,255,0.80)",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  focusHintContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: "rgba(0,0,0,0.55)",
    maxWidth: 260,
  },
  focusHint: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.90)",
    textAlign: "center",
  },

  // Bottom controls
  bottomControls: {
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.textInverse,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.textInverse,
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  shutterPressed: {
    transform: [{ scale: 0.94 }],
  },
});
