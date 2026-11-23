import { useCallback, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import {
  getPermissionsAsync as getMediaPermissionsAsync,
  requestPermissionsAsync as requestMediaPermissionsAsync,
} from "expo-media-library";

export type CivicPermissionType = "camera" | "location" | "storage";

export type PermissionState = "granted" | "denied" | "blocked" | "undetermined";

interface PermissionConfig {
  title: string;
  featureDescription: string;
  checkFn: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
  requestFn: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
}

const PERMISSION_CONFIGS: Record<CivicPermissionType, PermissionConfig> = {
  camera: {
    title: "Izin Kamera",
    featureDescription: "mengambil foto bukti kerusakan atau kondisi darurat di lapangan",
    checkFn: async () => {
      const res = await Camera.getCameraPermissionsAsync();
      return { granted: res.granted, canAskAgain: res.canAskAgain };
    },
    requestFn: async () => {
      const res = await Camera.requestCameraPermissionsAsync();
      return { granted: res.granted, canAskAgain: res.canAskAgain };
    },
  },
  location: {
    title: "Izin Lokasi",
    featureDescription: "menentukan koordinat akurat titik bencana/infrastruktur",
    checkFn: async () => {
      const res = await Location.getForegroundPermissionsAsync();
      return { granted: res.granted, canAskAgain: res.canAskAgain };
    },
    requestFn: async () => {
      const res = await Location.requestForegroundPermissionsAsync();
      return { granted: res.granted, canAskAgain: res.canAskAgain };
    },
  },
  storage: {
    title: "Izin Galeri / Penyimpanan",
    featureDescription: "memilih dan melampirkan berkas foto dari penyimpanan perangkat",
    checkFn: async () => {
      const res = await getMediaPermissionsAsync();
      return { granted: res.granted, canAskAgain: res.canAskAgain };
    },
    requestFn: async () => {
      const res = await requestMediaPermissionsAsync();
      return { granted: res.granted, canAskAgain: res.canAskAgain };
    },
  },
};

/**
 * Membuka menu pengaturan aplikasi di perangkat Android/iOS jika izin diblokir secara permanen.
 */
export async function openDeviceSettings(): Promise<void> {
  try {
    if (Platform.OS !== "web") {
      await Linking.openSettings();
    }
  } catch (error) {
    console.error("[Permission] Gagal membuka pengaturan:", error);
  }
}

/**
 * Menampilkan dialog pengalihan ke pengaturan perangkat ketika izin ditolak dengan status "Jangan tanya lagi".
 */
function promptRedirectToSettings(title: string, featureDesc: string) {
  Alert.alert(
    `${title} Diperlukan`,
    `Aplikasi membutuhkan ${title.toLowerCase()} untuk ${featureDesc}.\n\nAnda sebelumnya menolak izin ini secara permanen. Silakan aktifkan izin secara manual melalui Pengaturan Perangkat.`,
    [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Buka Pengaturan",
        onPress: () => openDeviceSettings(),
      },
    ],
    { cancelable: true },
  );
}

/**
 * Helper fungsi mandiri Just-In-Time untuk meminta izin sebelum menjalankan aksi tertentu.
 * Mengembalikan boolean `true` jika izin telah diberikan oleh pengguna.
 */
export async function requestPermissionJIT(
  type: CivicPermissionType,
): Promise<boolean> {
  const config = PERMISSION_CONFIGS[type];
  if (!config) {
    return false;
  }

  // 1. Periksa status izin saat ini terlebih dahulu
  const currentStatus = await config.checkFn();
  if (currentStatus.granted) {
    return true;
  }

  // 2. Jika pengguna sebelumnya sudah memilih "Jangan tanya lagi" (canAskAgain === false)
  if (!currentStatus.canAskAgain) {
    promptRedirectToSettings(config.title, config.featureDescription);
    return false;
  }

  // 3. Minta izin secara Just-In-Time
  const requestResult = await config.requestFn();
  if (requestResult.granted) {
    return true;
  }

  // 4. Jika setelah diminta tetap ditolak dan sudah tidak bisa ditanya lagi
  if (!requestResult.canAskAgain) {
    promptRedirectToSettings(config.title, config.featureDescription);
  } else {
    Alert.alert(
      "Izin Ditolak",
      `Fitur tidak dapat dijalankan tanpa ${config.title.toLowerCase()}.`,
    );
  }

  return false;
}

/**
 * Custom Hook Reusable untuk mengelola runtime permission secara Just-In-Time.
 * Cocok digunakan di komponen React untuk reaktivitas status izin.
 */
export function useJustInTimePermissions() {
  const [statuses, setStatuses] = useState<Record<CivicPermissionType, PermissionState>>({
    camera: "undetermined",
    location: "undetermined",
    storage: "undetermined",
  });
  const [isRequesting, setIsRequesting] = useState(false);

  /**
   * Cek status izin tanpa memunculkan prompt dialog sistem
   */
  const checkStatus = useCallback(async (type: CivicPermissionType): Promise<PermissionState> => {
    const config = PERMISSION_CONFIGS[type];
    if (!config) return "undetermined";

    try {
      const res = await config.checkFn();
      const state: PermissionState = res.granted
        ? "granted"
        : !res.canAskAgain
        ? "blocked"
        : "denied";

      setStatuses((prev) => ({ ...prev, [type]: state }));
      return state;
    } catch {
      return "undetermined";
    }
  }, []);

  /**
   * Minta izin Just-In-Time saat pengguna berinteraksi dengan fitur terkait
   */
  const requestJustInTime = useCallback(
    async (type: CivicPermissionType): Promise<boolean> => {
      setIsRequesting(true);
      try {
        const isGranted = await requestPermissionJIT(type);
        await checkStatus(type);
        return isGranted;
      } finally {
        setIsRequesting(false);
      }
    },
    [checkStatus],
  );

  return {
    statuses,
    isRequesting,
    checkStatus,
    requestJustInTime,
    openDeviceSettings,
  };
}
