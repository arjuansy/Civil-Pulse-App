import * as SecureStore from "expo-secure-store";

/**
 * Kunci penyimpanan standar untuk data sensitif Civic Pulse.
 * Aturan SecureStore: Kunci hanya boleh mengandung alfanumerik, '.', '-', dan '_'.
 */
export const SECURE_KEYS = {
  AUTH_TOKEN: "civic_pulse_auth_token",
  USER_NIK: "civic_pulse_user_nik",
  USER_CREDENTIALS: "civic_pulse_credentials",
  USER_SESSION: "civic_pulse_session",
} as const;

export type SecureKeyType = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS] | string;

export interface CivicUserSession {
  nik: string;
  namaLengkap: string;
  token: string;
  role: "warga" | "petugas" | "admin";
  waktuLogin: string;
}

/**
 * Menyimpan data sensitif ke penyimpanan aman perangkat (Keystore di Android / Keychain di iOS).
 * Otomatis mengonversi objek menjadi string JSON.
 *
 * @param key Kunci identifikasi penyimpanan
 * @param value Nilai yang akan disimpan (string atau objek)
 * @returns boolean status keberhasilan
 */
export async function saveSecure(
  key: SecureKeyType,
  value: string | object,
): Promise<boolean> {
  try {
    const stringValue = typeof value === "object" ? JSON.stringify(value) : value;
    await SecureStore.setItemAsync(key, stringValue);
    return true;
  } catch (error) {
    console.error(`[SecureStore] Gagal menyimpan data untuk kunci "${key}":`, error);
    return false;
  }
}

/**
 * Membaca data sensitif dari penyimpanan aman.
 * Jika `parseJson` true, otomatis mengurai kembali string JSON menjadi objek.
 *
 * @param key Kunci identifikasi penyimpanan
 * @param parseJson Apakah nilai perlu diparsing sebagai JSON
 * @returns Nilai yang disimpan atau null jika tidak ditemukan / gagal
 */
export async function getSecure<T = string>(
  key: SecureKeyType,
  parseJson: boolean = false,
): Promise<T | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (!value) {
      return null;
    }

    if (parseJson) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }

    return value as unknown as T;
  } catch (error) {
    console.error(`[SecureStore] Gagal membaca data untuk kunci "${key}":`, error);
    return null;
  }
}

/**
 * Menghapus data sensitif dari penyimpanan aman berdasarkan kunci.
 *
 * @param key Kunci identifikasi penyimpanan
 * @returns boolean status keberhasilan penghapusan
 */
export async function deleteSecure(key: SecureKeyType): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error(`[SecureStore] Gagal menghapus data untuk kunci "${key}":`, error);
    return false;
  }
}

/**
 * CONTOH IMPLEMENTASI ALUR LOGIN SEDERHANA
 *
 * Mensimulasikan autentikasi warga menggunakan NIK dan kata sandi,
 * lalu menyimpan token akses dan data sesi secara aman di SecureStore.
 */
export async function loginUser(
  nik: string,
  kataSandi: string,
): Promise<{ success: boolean; message: string; session?: CivicUserSession }> {
  // Validasi format NIK sederhana (16 digit)
  const cleanNik = nik.trim();
  if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
    return {
      success: false,
      message: "NIK harus berjumlah 16 digit angka.",
    };
  }

  if (!kataSandi || kataSandi.length < 4) {
    return {
      success: false,
      message: "Kata sandi minimal 4 karakter.",
    };
  }

  // Simulasi pembuatan token JWT / auth token
  const dummyToken = `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const sessionData: CivicUserSession = {
    nik: cleanNik,
    namaLengkap: `Warga (${cleanNik.slice(-4)})`,
    token: dummyToken,
    role: "warga",
    waktuLogin: new Date().toISOString(),
  };

  // Simpan data sensitif ke SecureStore (Token, NIK, dan Sesi)
  const savedToken = await saveSecure(SECURE_KEYS.AUTH_TOKEN, dummyToken);
  const savedNik = await saveSecure(SECURE_KEYS.USER_NIK, cleanNik);
  const savedSession = await saveSecure(SECURE_KEYS.USER_SESSION, sessionData);

  if (savedToken && savedNik && savedSession) {
    return {
      success: true,
      message: "Login berhasil. Token dan NIK tersimpan aman di SecureStore.",
      session: sessionData,
    };
  }

  return {
    success: false,
    message: "Gagal menyimpan kredensial ke penyimpanan aman.",
  };
}

/**
 * CONTOH ALUR LOGOUT SEDERHANA
 * Menghapus semua kredensial sensitif saat warga keluar dari aplikasi.
 */
export async function logoutUser(): Promise<boolean> {
  const deletedToken = await deleteSecure(SECURE_KEYS.AUTH_TOKEN);
  const deletedNik = await deleteSecure(SECURE_KEYS.USER_NIK);
  const deletedSession = await deleteSecure(SECURE_KEYS.USER_SESSION);

  return deletedToken && deletedNik && deletedSession;
}

/**
 * Mengambil sesi aktif dari SecureStore jika pengguna sebelumnya sudah login.
 */
export async function getActiveSession(): Promise<CivicUserSession | null> {
  return await getSecure<CivicUserSession>(SECURE_KEYS.USER_SESSION, true);
}
